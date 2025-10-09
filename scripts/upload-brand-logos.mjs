import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

// Usage:
// Set environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role key required to update DB)
// node scripts/upload-brand-logos.mjs [path-to-local-logos-folder]

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. Aborting.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'brands'

const inputDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('./scripts/brand-logos')

async function uploadFile(localPath, destPath) {
  const buffer = await fs.readFile(localPath)
  const { data, error } = await supabase.storage.from(BUCKET).upload(destPath, buffer, { upsert: true })
  if (error) throw error
  return data
}

async function getPublicUrl(destPath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(destPath)
  return data?.publicUrl ?? null
}

async function updateBrandLogo(slug, publicUrl) {
  const { data, error } = await supabase.from('brands').update({ logo: publicUrl }).eq('slug', slug)
  if (error) throw error
  return data
}

async function processDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    try {
      if (e.isFile()) {
        const filename = e.name
        const slug = path.parse(filename).name
        const localPath = path.join(dir, filename)
        const dest = `${slug}/${filename}`
        console.log(`[UPLOAD] ${localPath} -> ${BUCKET}/${dest}`)
        await uploadFile(localPath, dest)
        const publicUrl = await getPublicUrl(dest)
        console.log('[PUBLIC_URL]', publicUrl)
        if (publicUrl) {
          console.log(`[DB] updating brand slug=${slug} with logo=${publicUrl}`)
          await updateBrandLogo(slug, publicUrl)
          console.log('[OK] updated', slug)
        } else {
          console.warn('[WARN] publicUrl not available for', dest)
        }
      } else if (e.isDirectory()) {
        // directory named by slug, pick first image file
        const slug = e.name
        const files = await fs.readdir(path.join(dir, slug))
        const pick = files.find(f => /\.(png|jpe?g|webp|svg)$/i.test(f))
        if (!pick) { console.warn('[SKIP] no image found in folder', slug); continue }
        const localPath = path.join(dir, slug, pick)
        const dest = `${slug}/${pick}`
        console.log(`[UPLOAD] ${localPath} -> ${BUCKET}/${dest}`)
        await uploadFile(localPath, dest)
        const publicUrl = await getPublicUrl(dest)
        console.log('[PUBLIC_URL]', publicUrl)
        if (publicUrl) {
          console.log(`[DB] updating brand slug=${slug} with logo=${publicUrl}`)
          await updateBrandLogo(slug, publicUrl)
          console.log('[OK] updated', slug)
        } else {
          console.warn('[WARN] publicUrl not available for', dest)
        }
      }
    } catch (err) {
      console.error('[ERROR]', e.name, err.message || err)
    }
  }
}

;(async () => {
  try {
    console.log('Using folder:', inputDir)
    await fs.access(inputDir)
  } catch (err) {
    console.error('Input folder does not exist:', inputDir)
    process.exit(1)
  }

  try {
    await processDir(inputDir)
    console.log('Done')
  } catch (err) {
    console.error('Fatal error', err.message || err)
    process.exit(1)
  }
})()

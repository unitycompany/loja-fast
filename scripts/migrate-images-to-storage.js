import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { writeFile, readFile } from 'fs/promises'

async function loadDotEnvIfExists() {
  const envPath = path.join(process.cwd(), '.env')
  try {
    const text = await readFile(envPath, 'utf8')
    text.split(/\r?\n/).forEach((line) => {
      const l = line.trim()
      if (!l || l.startsWith('#')) return
      const idx = l.indexOf('=')
      if (idx === -1) return
      const key = l.slice(0, idx).trim()
      let val = l.slice(idx + 1).trim()
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if (typeof process.env[key] === 'undefined') process.env[key] = val
    })
  } catch (err) {}
}

await loadDotEnvIfExists()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function safeFilenameFromUrl(url) {
  try {
    const u = new URL(url)
    const base = path.basename(u.pathname)
    // fallback
    return base || `file-${Date.now()}`
  } catch (e) {
    return `file-${Date.now()}`
  }
}

async function downloadBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`)
  return await res.arrayBuffer()
}

async function uploadToBucket(bucket, key, buffer) {
  // buffer is ArrayBuffer; convert to Buffer
  const buf = Buffer.from(buffer)
  const { data, error } = await supabase.storage.from(bucket).upload(key, buf, { upsert: true })
  if (error) throw error
  return data
}

async function migrateBrands() {
  console.log('Fetching brands...')
  const { data: brands, error: bErr } = await supabase.from('brands').select('id, slug, logo')
  if (bErr) throw bErr
  for (const b of brands || []) {
    try {
      const logo = b.logo && b.logo.public_url ? b.logo.public_url : null
      if (!logo) continue
      if (/^https?:\/\//i.test(logo)) {
        // download and reupload
        const filename = safeFilenameFromUrl(logo)
        const key = `${b.slug}/${filename}`
        console.log('Downloading logo for', b.slug, logo)
        const buf = await downloadBuffer(logo)
        await uploadToBucket('brands', key, buf)
        // update brand record to store bucket path
        await supabase.from('brands').update({ logo: { public_url: `brands/${key}` } }).eq('id', b.id)
        console.log('Uploaded logo for', b.slug)
      }
    } catch (e) {
      console.warn('Failed brand', b.slug, e.message || e)
    }
  }
}

async function migrateProducts() {
  console.log('Fetching products...')
  const { data: products, error: pErr } = await supabase.from('products').select('id, slug, images, additional_images')
  if (pErr) throw pErr
  for (const p of products || []) {
    try {
      const updates = {}
      if (Array.isArray(p.images)) {
        const newImages = []
        for (const img of p.images) {
          if (!img || !img.url) continue
          if (/^https?:\/\//i.test(img.url)) {
            const filename = safeFilenameFromUrl(img.url)
            const key = `${p.slug}/${filename}`
            try {
              const buf = await downloadBuffer(img.url)
              await uploadToBucket('products', key, buf)
              newImages.push({ ...img, url: `products/${key}` })
              console.log(`Uploaded product image for ${p.slug}: ${key}`)
            } catch (e) {
              console.warn('Failed upload image for', p.slug, img.url, e.message || e)
              // keep original url as fallback
              newImages.push(img)
            }
          } else {
            // already relative path (assume in bucket) - keep as is
            newImages.push(img)
          }
        }
        updates.images = newImages
      }

      if (Array.isArray(p.additional_images)) {
        const newAdd = []
        for (const img of p.additional_images) {
          if (!img || !img.url) continue
          if (/^https?:\/\//i.test(img.url)) {
            const filename = safeFilenameFromUrl(img.url)
            const key = `${p.slug}/additional-${filename}`
            try {
              const buf = await downloadBuffer(img.url)
              await uploadToBucket('products', key, buf)
              newAdd.push({ ...img, url: `products/${key}` })
              console.log(`Uploaded product additional image for ${p.slug}: ${key}`)
            } catch (e) {
              console.warn('Failed upload additional image for', p.slug, img.url, e.message || e)
              newAdd.push(img)
            }
          } else {
            newAdd.push(img)
          }
        }
        updates.additional_images = newAdd
      }

      if (Object.keys(updates).length) {
        await supabase.from('products').update(updates).eq('id', p.id)
        console.log('Updated product record images for', p.slug)
      }
    } catch (e) {
      console.warn('Failed product', p.slug, e.message || e)
    }
  }
}

async function main() {
  console.log('Starting migration of images to Supabase storage')
  await migrateBrands()
  await migrateProducts()
  console.log('Migration complete')
}

main().catch(err => { console.error(err); process.exit(1) })

import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { readFile } from 'fs/promises'

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
  const buf = Buffer.from(buffer)
  const { data, error } = await supabase.storage.from(bucket).upload(key, buf, { upsert: true })
  if (error) throw error
  return data
}

async function main() {
  const file = path.join(process.cwd(), 'src', 'data', 'banners.json')
  // Quick check: ensure the banners table exists in Supabase before proceeding
  try {
    const { data: test, error: testErr } = await supabase.from('banners').select('id').limit(1)
    if (testErr) {
      console.error("The 'banners' table was not found in your Supabase project. Please run 'scripts/supabase-banners-schema.sql' in the Supabase SQL Editor and re-run this script.")
      process.exit(1)
    }
  } catch (e) {
    console.error("The 'banners' table was not found in your Supabase project. Please run 'scripts/supabase-banners-schema.sql' in the Supabase SQL Editor and re-run this script.")
    process.exit(1)
  }
  const raw = await readFile(file, 'utf8')
  const banners = JSON.parse(raw)
  console.log(`Importing ${banners.length} banners...`)

  for (const b of banners) {
    const payload = {
      type: b.type || null,
      alt: b.alt || null,
      href: b.href || null,
      rota: b.rota || null,
      height: b.height || null,
      meta: {}
    }

    try {
      // handle urlMobile and urlDesktop
      if (b.urlMobile && /^https?:\/\//i.test(b.urlMobile)) {
        const filename = safeFilenameFromUrl(b.urlMobile)
        const key = `mobile/${filename}`
        const buf = await downloadBuffer(b.urlMobile)
        await uploadToBucket('banners', key, buf)
        payload.url_mobile = `banners/${key}`
      } else if (b.urlMobile) {
        payload.url_mobile = b.urlMobile
      }

      if (b.urlDesktop && /^https?:\/\//i.test(b.urlDesktop)) {
        const filename = safeFilenameFromUrl(b.urlDesktop)
        const key = `desktop/${filename}`
        const buf = await downloadBuffer(b.urlDesktop)
        await uploadToBucket('banners', key, buf)
        payload.url_desktop = `banners/${key}`
      } else if (b.urlDesktop) {
        payload.url_desktop = b.urlDesktop
      }

      if (b.image && /^https?:\/\//i.test(b.image)) {
        const filename = safeFilenameFromUrl(b.image)
        const key = `image/${filename}`
        const buf = await downloadBuffer(b.image)
        await uploadToBucket('banners', key, buf)
        payload.image = `banners/${key}`
      } else if (b.image) {
        payload.image = b.image
      }

      // Preserve any other fields in meta
      for (const k of Object.keys(b)) {
        if (!['urlMobile','urlDesktop','image','alt','href','rota','height','type'].includes(k)) {
          payload.meta[k] = b[k]
        }
      }

      // Try to find existing banner by (type, href, alt). If found -> update, else insert.
      const filter = { type: payload.type }
      if (payload.href) filter.href = payload.href
      if (payload.alt) filter.alt = payload.alt

      let existing = null
      try {
        // use match for exact fields
        const { data: found, error: fErr } = await supabase.from('banners').select('*').match(filter).limit(1)
        if (fErr) {
          // ignore and proceed to insert
        } else if (found && found.length) {
          existing = found[0]
        }
      } catch (e) {}

      if (existing) {
        const { data: updated, error: updErr } = await supabase.from('banners').update(payload).eq('id', existing.id).select()
        if (updErr) console.error('Update error for banner', existing.id, updErr)
        else console.log('Updated banner', existing.id)
      } else {
        const { data: inserted, error: insErr } = await supabase.from('banners').insert(payload).select()
        if (insErr) console.error('Insert error for banner', insErr)
        else console.log('Inserted banner', inserted && inserted[0] ? inserted[0].id : '(new)')
      }
    } catch (e) {
      console.warn('Failed to import banner', b, e.message || e)
    }
  }

  console.log('Done')
}

main().catch(e => { console.error(e); process.exit(1) })

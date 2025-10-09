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

async function main() {
  const file = path.join(process.cwd(), 'src', 'data', 'categories.json')
  const raw = await readFile(file, 'utf8')
  const cats = JSON.parse(raw)
  console.log(`Importing ${cats.length} categories...`)

  for (const c of cats) {
    try {
      // store exact object in data jsonb column, upsert by id
      const payload = { id: c.id, data: c }
      const { data: up, error } = await supabase.from('categories').upsert(payload, { onConflict: ['id'], returning: 'representation' })
      if (error) {
        console.error('Upsert error for', c.id, error)
      } else {
        console.log('Upserted category', c.id)
      }
    } catch (e) {
      console.warn('Failed to import category', c.id, e.message || e)
    }
  }

  console.log('Done')
}

main().catch(e => { console.error(e); process.exit(1) })

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
  } catch (err) {
    // ignore
  }
}

await loadDotEnvIfExists()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function createBucketIfNotExists(name, options = { public: false }) {
  try {
    console.log(`Creating bucket: ${name} (public=${options.public})`)
    const { data, error } = await supabase.storage.createBucket(name, { public: options.public })
    if (error) {
      // If bucket already exists, the API returns an error - try to handle gracefully
      if (error.message && /already exists/.test(error.message)) {
        console.log(`Bucket ${name} already exists.`)
        return { existed: true }
      }
      console.error(`Error creating bucket ${name}:`, error.message || error)
      return { error }
    }
    console.log(`Bucket created: ${name}`, data)
    return { data }
  } catch (e) {
    console.error(`Exception while creating bucket ${name}:`, e.message || e)
    return { error: e }
  }
}

async function main() {
  const buckets = [
    { name: 'products', public: false },
    { name: 'brands', public: false }
  ]

  for (const b of buckets) {
    const res = await createBucketIfNotExists(b.name, { public: b.public })
    if (res && res.error) {
      // If we got a tenant/config error, print guidance
      if (res.error.message && res.error.message.includes('Missing tenant config')) {
        console.error('Supabase error: Missing tenant config. This indicates a provisioning/tenant issue on the Supabase project side. Please check your Supabase project status, billing/plan, or contact Supabase support.')
      }
    }
  }

  console.log('Done')
}

main().catch(err => { console.error(err); process.exit(1) })

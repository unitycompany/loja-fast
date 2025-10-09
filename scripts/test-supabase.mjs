import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

const { data, error } = await supabase.from('products').select('*').limit(1)
console.log(JSON.stringify({ error: error ? { message: error.message, code: error.code } : null, count: Array.isArray(data) ? data.length : 0 }, null, 2))

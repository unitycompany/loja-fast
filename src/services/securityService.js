import { supabase } from './supabase'
import localSecurity from '../data/security.json'

// Try to fetch security badges from a `security` table in Supabase; fallback to local JSON.
export async function fetchSecurity() {
  try {
    const { data, error } = await supabase.from('security').select('*').order('position', { ascending: true })
    if (!error && data && data.length) return data
  } catch (e) {
    // ignore and fallback
  }
  // normalize local JSON as [{ name, image }]
  return Array.isArray(localSecurity) ? localSecurity : []
}

export default { fetchSecurity }

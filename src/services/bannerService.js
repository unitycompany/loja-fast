import { supabase, SUPABASE_ENABLED } from './supabase'
import localBanners from '../data/banners.json'

export async function fetchBanners() {
  if (!SUPABASE_ENABLED) {
    return Array.isArray(localBanners) ? [...localBanners] : []
  }

  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false })
  if (error) {
    // graceful fallback for local development without Supabase tables configured
    if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === '42P01') {
      return Array.isArray(localBanners) ? [...localBanners] : []
    }
    throw error
  }
  // Filter out inactive banners (meta.is_active === false)
  const rows = data ?? []
  return rows.filter(b => b?.meta?.is_active !== false)
}

export async function fetchBannersByType(type) {
  if (!SUPABASE_ENABLED) {
    return (Array.isArray(localBanners) ? localBanners : []).filter(b => !type || b.type === type)
  }

  const { data, error } = await supabase.from('banners').select('*').eq('type', type).order('created_at', { ascending: false })
  if (error) {
    if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === '42P01') {
      return (Array.isArray(localBanners) ? localBanners : []).filter(b => !type || b.type === type)
    }
    throw error
  }
  const rows = data ?? []
  return rows.filter(b => b?.meta?.is_active !== false)
}

// Optional: load per-category defaults for banner heights (desktop/mobile)
export async function fetchCategoryBannerDefaults() {
  if (!SUPABASE_ENABLED) return {}
  const { data, error } = await supabase.from('categories').select('id, data')
  if (error) return {}
  const map = {}
  for (const row of data || []) {
    const d = row.data || {}
    // Allow d.banner or d.ui.banner to store defaults
    const cfg = d.banner || (d.ui && d.ui.banner) || {}
    const key = d.slug || row.id
    map[key] = {
      height_desktop: cfg.height_desktop || '',
      height_mobile: cfg.height_mobile || '',
      enabled: cfg.enabled !== false
    }
  }
  return map
}

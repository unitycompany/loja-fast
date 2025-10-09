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
  return data ?? []
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
  return data ?? []
}

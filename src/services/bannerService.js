import { supabase } from './supabase'

export async function fetchBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchBannersByType(type) {
  const { data, error } = await supabase.from('banners').select('*').eq('type', type).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

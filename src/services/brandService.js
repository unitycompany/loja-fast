import { supabase } from './supabase'
import { localBrandLogo } from '../utils/image'

export async function fetchBrands({ limit = 50, offset = 0, includeEmpty = false } = {}) {
  const [{ data, error }, productsRes] = await Promise.all([
    supabase.from('brands').select('*').order('name', { ascending: true }).range(offset, offset + limit - 1),
    // include imageBrand and brand json to extract a usable logo fallback per brand
    supabase.from('products').select('brand_id, brand_slug, brandName, imageBrand, brand')
  ])
  let prods = productsRes?.data
  let prodErr = productsRes?.error
  if (error) {
    // Don't throw in UI path — fall back to deriving brands from products
    // eslint-disable-next-line no-console
    console.warn('[brandService] Falha ao obter brands; usando fallback derivado de products:', error.message || error)
  }
  if (prodErr) {
    console.warn('[brandService] Falha ao obter produtos (projeção ampla); tentando projeções alternativas...', prodErr.message || prodErr)
    const projections = [
      'brand_id, brand_slug, brandName, imageBrand',
      'brand_id, brand_slug, imageBrand',
      'brand_slug, imageBrand',
      'brand_slug'
    ]
    for (const sel of projections) {
      try {
        const retry = await supabase.from('products').select(sel)
        if (!retry.error && Array.isArray(retry.data)) {
          prods = retry.data
          prodErr = null
          break
        }
        if (retry.error) {
          console.warn('[brandService] Retry com seleção', sel, 'falhou:', retry.error.message || retry.error)
        }
      } catch (e) {
        console.warn('[brandService] Exceção no retry seleção', sel, e?.message || e)
      }
    }
  }

  const countById = new Map()
  const countBySlug = new Map()
  for (const p of prods || []) {
    if (p.brand_id) countById.set(p.brand_id, (countById.get(p.brand_id) || 0) + 1)
    if (p.brand_slug) countBySlug.set(p.brand_slug, (countBySlug.get(p.brand_slug) || 0) + 1)
  }

  const rows = Array.isArray(data) ? data : []
  // Normalize rows to the shape expected by the UI
  const normalized = rows.map((row) => {
    // meta may be a JSON object with bgColor and description
    const meta = row.meta || {}
    // logo may be JSON or string depending on how it's stored
    let imageCompany = null
    try {
      if (!row.logo) imageCompany = null
      else if (typeof row.logo === 'string') imageCompany = row.logo
      else if (typeof row.logo === 'object') {
        imageCompany = row.logo.url || row.logo.publicUrl || row.logo.path || row.logo.key || null
      }
    } catch (e) {
      imageCompany = null
    }

    // brand.meta may carry a logo url
    if (!imageCompany && row.meta && typeof row.meta === 'object') {
      imageCompany = row.meta.logoUrl || row.meta.logo || null
    }

    // fallback explicit column if present
    if (!imageCompany && row.imageCompany) {
      imageCompany = row.imageCompany
    }

    // fallback: derive a logo from any product of this brand
    if (!imageCompany) {
      const firstOfBrand = (prods || []).find((p) => p.brand_id === row.id || p.brand_slug === row.slug)
      if (firstOfBrand) {
        imageCompany = firstOfBrand.imageBrand || (firstOfBrand.brand && typeof firstOfBrand.brand === 'object' ? (firstOfBrand.brand.logo || null) : null)
      }
    }

    // final fallback: try a bundled local SVG for well-known brands
    if (!imageCompany) {
      imageCompany = localBrandLogo(row.slug || row.name || row.companyName)
    }

    const computedCount = countById.get(row.id) || countBySlug.get(row.slug) || 0

    const brand = {
      id: row.id,
      companyName: row.name || row.companyName || null,
      slug: row.slug || null,
      description: meta.description || row.description || null,
      bgColor: meta.bgColor || meta.bg_color || row.bgColor || null,
      imageCompany,
      numberProducts: computedCount,
      // keep original row for advanced use
      _raw: row,
    }
    return brand
  })

  let result = includeEmpty ? normalized : normalized.filter(b => (b.numberProducts || 0) > 0)

  // Fallback: if we have no brands from table, derive a minimal set from products so UI can render
  if (result.length === 0 && Array.isArray(prods) && prods.length > 0) {
    const byKey = new Map()
    for (const p of prods) {
      // pick a grouping key: prefer brand_id, then brand_slug, then normalized brandName/name
      const nameCandidate = (p.brandName) || (p.brand && typeof p.brand === 'object' ? (p.brand.companyName || p.brand.name) : null) || null
      const slugCandidate = (p.brand && typeof p.brand === 'object' ? p.brand.slug : null) || p.brand_slug || null
      const key = p.brand_id || slugCandidate || (nameCandidate ? nameCandidate.toLowerCase() : null)
      if (!key) continue
      const entry = byKey.get(key) || { id: p.brand_id || null, slug: slugCandidate || null, companyName: nameCandidate || slugCandidate || 'Marca', imageCompany: null, numberProducts: 0, _raw: null }
      entry.numberProducts += 1
      if (!entry.companyName && nameCandidate) entry.companyName = nameCandidate
      if (!entry.slug && slugCandidate) entry.slug = slugCandidate
      // pick a logo fallback from product
      const prodLogo = p.imageBrand || (p.brand && typeof p.brand === 'object' ? (p.brand.logo || null) : null)
      if (!entry.imageCompany) entry.imageCompany = prodLogo || localBrandLogo(entry.slug || entry.companyName)
      byKey.set(key, entry)
    }
    result = [...byKey.values()]
    if (!includeEmpty) result = result.filter(b => (b.numberProducts || 0) > 0)
  }

  return result
}

export async function fetchBrandById(id) {
  const { data, error } = await supabase.from('brands').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function fetchBrandBySlug(slug) {
  const { data, error } = await supabase.from('brands').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}

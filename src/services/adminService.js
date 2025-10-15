import { supabase } from './supabase'

const MISSING_CATEGORY_PATH_CODES = new Set(['42703', 'PGRST201', 'PGRST204'])
let categoryPathColumnAvailable = true
let defaultUnitKeyColumnAvailable = true

function isMissingCategoryPathColumn(error) {
  if (!error) return false
  if (error.code && MISSING_CATEGORY_PATH_CODES.has(error.code)) return true
  const message = String(error.message || error.error_description || '').toLowerCase()
  if (!message) return false
  return message.includes("'category_path'") && message.includes('schema cache')
}

function isMissingDefaultUnitKeyColumn(error) {
  if (!error) return false
  const message = String(error.message || error.error_description || '').toLowerCase()
  if (!message) return false
  return message.includes("'default_unit_key'") && message.includes('schema cache')
}

function buildProductPayload(product, { includeCategoryPath = true } = {}) {
  // Normalize brand related fields from either brand object or explicit ids
  const rawBrand = product.brand ?? product.brand_record ?? null
  const brand_id = (product.brand_id || product.brandId || rawBrand?.id || '') || null
  const brand_slug = (product.brand_slug || rawBrand?.slug || '') || null
  const brandName = (product.brandName || rawBrand?.companyName || rawBrand?.name || '') || null
  // category slug mirrors category when it's a slug (our UI uses slug values)
  const category_slug = (product.category_slug || product.category || '') || null

  // Build augmented search terms (improves discoverability by unit/measure)
  const baseTerms = Array.isArray(product.searchTerms || product.search_terms) ? (product.searchTerms || product.search_terms) : []
  const unitTerms = Array.isArray(product.units) ? product.units.flatMap(u => [u?.key, u?.label]).filter(Boolean) : []
  const measureTerms = Array.isArray(product.measures) ? product.measures.flatMap(m => [m?.id, m?.label]).filter(Boolean) : []
  const augmentedSearchTerms = Array.from(new Set([...baseTerms, ...unitTerms, ...measureTerms]))

  // Determina se o produto deve ser ativo
  // Ativo = tem pelo menos uma imagem válida
  const hasValidImage = Array.isArray(product.images) && 
                        product.images.length > 0 && 
                        product.images[0] && 
                        product.images[0] !== '' && 
                        product.images[0] !== 'null'
  
  // Se is_active foi explicitamente definido, usa esse valor
  // Caso contrário, define baseado na presença de imagem
  const isActive = typeof product.is_active === 'boolean' 
    ? product.is_active 
    : (typeof product.isActive === 'boolean' ? product.isActive : hasValidImage)

  const payload = {
    id: product.id || undefined,
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    category: product.category,
    category_slug,
    sku: product.sku,
    gtin: product.gtin,
    mpn: product.mpn,
    availability: product.availability,
    condition: product.condition,
    is_active: isActive,
    shortdescription: product.shortDescription ?? product.shortdescription ?? null,
    description: product.description ?? product.description,
    long_description: product.longDescription ?? product.long_description ?? null,
    description_html: product.descriptionHtml ?? product.description_html ?? null,
    brand: rawBrand ?? null,
    brand_id,
    brand_slug,
    brandName,
    dimensions: product.dimensions ?? null,
    weight: product.weight ?? null,
    images: product.images ?? null,
    additional_images: product.additional_images ?? product.additionalImages ?? null,
    properties: product.properties ?? null,
    units: product.units ?? null,
    measures: product.measures ?? null,
    default_measure_id: product.defaultMeasureId ?? product.default_measure_id ?? null,
  default_unit_key: product.defaultUnitKey ?? product.default_unit_key ?? null,
    shipping: product.shipping ?? null,
    seo: product.seo ?? null,
    merchant: product.merchant ?? null,
  search_terms: augmentedSearchTerms.length ? augmentedSearchTerms : null,
    faqs: product.faqs ?? null,
    schema_org: product.schemaOrg ?? product.schema_org ?? null,
    stock: product.stock ?? null,
    subcategory: product.subcategory ?? product.sub_category ?? null
  }

  const categoryPathValue = product.categoryPath ?? product.category_path
  if (includeCategoryPath && typeof categoryPathValue !== 'undefined') {
    payload.category_path = categoryPathValue ?? null
  }

  // Normalize empty strings to null where appropriate
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key]
    else if (payload[key] === '') payload[key] = null
  })

  return payload
}

// NOTE: This admin service uses the client-side anon key to perform writes.
// For production, use a server-side service role key and authenticated endpoints.

// BRANDS
export async function listBrands() {
  // Fetch brands and also aggregate product counts per brand to show accurate numbers
  const [{ data, error }, { data: prodAgg, error: prodErr }] = await Promise.all([
    supabase.from('brands').select('*'),
    supabase.from('products').select('brand_id, brand_slug')
  ])
  if (error) throw error
  if (prodErr) console.warn('Falha ao obter produtos para contagem por marca:', prodErr.message || prodErr)

  // Build counts by brand id and by slug as a fallback
  const countsById = new Map()
  const countsBySlug = new Map()
  for (const p of prodAgg || []) {
    if (p.brand_id) countsById.set(p.brand_id, (countsById.get(p.brand_id) || 0) + 1)
    if (p.brand_slug) countsBySlug.set(p.brand_slug, (countsBySlug.get(p.brand_slug) || 0) + 1)
  }

  // normalize to prefer companyName but fall back to name
  return (data || []).map(b => {
    let imageCompany = b.imageCompany
    try {
      if (!imageCompany && b.logo) {
        if (typeof b.logo === 'string') imageCompany = b.logo
        else if (typeof b.logo === 'object') imageCompany = b.logo.url || b.logo.publicUrl || b.logo.path
      }
    } catch (e) {}
    const meta = b.meta || {}
  const computedCount = countsById.get(b.id) || countsBySlug.get(b.slug) || 0
    return {
      ...b,
      companyName: b.companyName || b.name,
      imageCompany: imageCompany || null,
      description: b.description || meta.description || null,
      bgColor: b.bgColor || meta.bgColor || meta.bg_color || null,
      // Always prefer computed count from products to avoid stale values in brands
      number_products: computedCount,
      numberProducts: computedCount
    }
  })
}

export async function upsertBrand(brand) {
  // Normalize input to table shape and app expectations
  const base = {
    id: brand.id,
    name: brand.companyName || brand.name,
    companyName: brand.companyName || brand.name,
    slug: brand.slug,
    imageCompany: brand.imageCompany || brand.logo || (brand.image && brand.image.url),
    bgColor: brand.bgColor,
    logo: brand.logo || null,
    meta: (()=>{
      const meta = { ...(brand.meta || {}) }
      if (brand.description) meta.description = brand.description
      if (brand.bgColor && !meta.bgColor) meta.bgColor = brand.bgColor
      return Object.keys(meta).length ? meta : null
    })(),
    description: brand.description,
    number_products: brand.number_products ?? brand.numberProducts
  }
  // Remove undefined values
  Object.keys(base).forEach(k => base[k] === undefined && delete base[k])

  const attempt = async (payload) => {
    // Work on a shallow copy we can safely mutate
    const body = { ...payload }
    // If id is falsy (null/''), remove to allow DB default on insert
    if (!body.id) delete body.id

    if (payload.id) {
      const { data, error } = await supabase.from('brands').update(body).eq('id', payload.id).select()
      if (error) throw error
      return data && data[0]
    } else {
      const { data, error } = await supabase.from('brands').insert(body).select()
      if (error) throw error
      return data && data[0]
    }
  }

  // Retry logic to handle schema cache mismatches: strip fields that might not exist
  const fieldFallbackOrder = [
    'bgColor',
    'imageCompany',
    'companyName',
    'description'
  ]
  let payload = { ...base }
  try {
    return await attempt(payload)
  } catch (error) {
    const msg = String(error?.message || '').toLowerCase()
    for (const f of fieldFallbackOrder) {
      if (msg.includes(`'${f.toLowerCase()}'`) || msg.includes('schema cache')) {
        delete payload[f]
      }
    }
    // Always ensure minimally required fields exist
    if (!payload.name) payload.name = brand.name || brand.companyName
    return await attempt(payload)
  }
}

export async function deleteBrand(id) {
  const { error } = await supabase.from('brands').delete().eq('id', id)
  if (error) throw error
  return true
}

// BANNERS
export async function listBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function upsertBanner(banner) {
  const payload = { ...banner }
  if (payload.id) {
    const { data, error } = await supabase.from('banners').update(payload).eq('id', payload.id).select()
    if (error) throw error
    return data && data[0]
  } else {
    const { data, error } = await supabase.from('banners').insert(payload).select()
    if (error) throw error
    return data && data[0]
  }
}

export async function deleteBanner(id) {
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) throw error
  return true
}

// PRODUCTS (basic: list and delete; product upsert/UI editing is more complex)
export async function listProducts({ limit = 100 } = {}) {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function upsertProduct(product) {
  const attempt = async (includeCategoryPath, includeDefaultUnitKey) => {
    const payload = buildProductPayload(product, { includeCategoryPath })
    if (!includeDefaultUnitKey) delete payload.default_unit_key
    const id = payload.id
    if (id) delete payload.id

    if (id) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', id).select()
      if (error) throw error
      return data && data[0]
    }

    const { data, error } = await supabase.from('products').insert(payload).select()
    if (error) throw error
    return data && data[0]
  }

  try {
    // Ensure user has an admin session before writing (RLSP safe)
    // We import dynamically to avoid circular deps
    try {
      const mod = await import('./adminAuth')
      await mod.ensureAdminSession()
    } catch (e) {
      // continue; supabase will still error with meaningful message if not authenticated
    }
    const result = await attempt(categoryPathColumnAvailable, defaultUnitKeyColumnAvailable)
    return result
  } catch (error) {
    if (categoryPathColumnAvailable && isMissingCategoryPathColumn(error)) {
      categoryPathColumnAvailable = false
      return await attempt(false, defaultUnitKeyColumnAvailable)
    }
    if (defaultUnitKeyColumnAvailable && isMissingDefaultUnitKeyColumn(error)) {
      defaultUnitKeyColumnAvailable = false
      return await attempt(categoryPathColumnAvailable, false)
    }
    throw error
  }
}

export async function toggleProductActive(productId, isActive) {
  try {
    const mod = await import('./adminAuth')
    await mod.ensureAdminSession()
  } catch (e) {
    // continue
  }

  const { data, error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId)
    .select()
  
  if (error) throw error
  return data && data[0]
}

export async function bulkToggleProductsActive(productIds, isActive) {
  try {
    const mod = await import('./adminAuth')
    await mod.ensureAdminSession()
  } catch (e) {
    // continue
  }

  const { data, error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .in('id', productIds)
    .select()
  
  if (error) throw error
  return data
}

export async function activateProductsWithImages() {
  try {
    const mod = await import('./adminAuth')
    await mod.ensureAdminSession()
  } catch (e) {
    // continue
  }

  // Busca todos os produtos
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, images')
  
  if (fetchError) throw fetchError

  // Separa produtos com e sem imagem
  const withImages = products.filter(p => 
    Array.isArray(p.images) && 
    p.images.length > 0 && 
    p.images[0] && 
    p.images[0] !== '' && 
    p.images[0] !== 'null'
  )
  
  const withoutImages = products.filter(p => 
    !Array.isArray(p.images) || 
    p.images.length === 0 || 
    !p.images[0] || 
    p.images[0] === '' || 
    p.images[0] === 'null'
  )

  // Ativa produtos com imagem
  if (withImages.length > 0) {
    const { error: activateError } = await supabase
      .from('products')
      .update({ is_active: true })
      .in('id', withImages.map(p => p.id))
    
    if (activateError) throw activateError
  }

  // Desativa produtos sem imagem
  if (withoutImages.length > 0) {
    const { error: deactivateError } = await supabase
      .from('products')
      .update({ is_active: false })
      .in('id', withoutImages.map(p => p.id))
    
    if (deactivateError) throw deactivateError
  }

  return {
    activated: withImages.length,
    deactivated: withoutImages.length,
    total: products.length
  }
}

// CATEGORIES
export async function listCategories() {
  // categories table stores JSON in `data` column; return data objects for ease of editing
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw error
  // Each row: { id, data, created_at, updated_at } -> return flattened { id, ...data }
  return (data || []).map(r => ({ id: r.id, ...(r.data || {}) }))
}

export async function upsertCategory(category) {
  // categories table expects rows shaped as { id: string, data: jsonb }
  const id = category.id || category.slug || (category.data && category.data.slug) || null
  const data = category.data ?? { name: category.name, slug: category.slug, ...(category.data || {}) }

  const payload = { id, data }

  if (id) {
    const { data: updated, error } = await supabase.from('categories').update(payload).eq('id', id).select()
    if (error) throw error
    return updated && updated[0]
  } else {
    // If no id was provided, generate a random id on DB side by inserting without id isn't allowed here because id is primary key text.
    // We'll require the caller to provide an id (slug) for new categories.
    const { data: inserted, error } = await supabase.from('categories').insert(payload).select()
    if (error) throw error
    return inserted && inserted[0]
  }
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  return true
}

import { supabase, resolveImageUrl, SUPABASE_ENABLED } from './supabase'
import localProducts from '../data/products.json'
import { localBrandLogo } from '../utils/image'

async function hydrateProducts(products = []) {
  const withImages = await Promise.all((products ?? []).map(async (p) => await hydrateProductImages(p)))
  return await attachBrandRecords(withImages)
}

/**
 * Fetch paginated products from Supabase
 * @param {{page?:number, perPage?:number, orderBy?:string, order?:'asc'|'desc'}} opts
 */
export async function fetchProducts({ page = 1, perPage = 9, orderBy = 'created_at', order = 'desc', q = null, brand = null, category = null, subcategory = null } = {}) {
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  // Fallback to local data when Supabase is disabled
  if (!SUPABASE_ENABLED) {
    let rows = Array.isArray(localProducts) ? [...localProducts] : []
    const text = (q && String(q).trim().toLowerCase()) || null
    if (text) rows = rows.filter(p => String(p.name || '').toLowerCase().includes(text) || String(p.sku || '').toLowerCase().includes(text))
    if (brand) rows = rows.filter(p => String(p.brand || p.brandName || '').toLowerCase() === String(brand).toLowerCase())
    if (category) rows = rows.filter(p => String(p.category || '').toLowerCase() === String(category).toLowerCase())
    if (subcategory) rows = rows.filter(p => String(p.subcategory || p.sub_category || '').toLowerCase() === String(subcategory).toLowerCase())
    rows.sort((a,b) => {
      const av = a[orderBy] || a.created_at || 0
      const bv = b[orderBy] || b.created_at || 0
      return (order === 'asc' ? 1 : -1) * (av > bv ? 1 : av < bv ? -1 : 0)
    })
    const pageSlice = rows.slice(from, to + 1)
    const items = await hydrateProducts(pageSlice)
    return { data: items, count: rows.length }
  }

  let query = supabase.from('products').select('*', { count: 'exact' })

  // Filtrar apenas produtos ativos (visíveis no site)
  query = query.eq('is_active', true)

  // basic text search across common fields
  if (q && String(q).trim()) {
    const pattern = `%${String(q).trim()}%`
    // use OR across name, shortDescription, description, sku
    try {
      query = query.or(`name.ilike.${pattern},shortdescription.ilike.${pattern},description.ilike.${pattern},sku.ilike.${pattern}`)
    } catch (err) {
      // Some Supabase REST edge cases (special chars) may cause a malformed OR filter.
      // Fallback to a simpler single-column ilike search on name only to avoid 400 errors.
      console.warn('OR search failed, falling back to name-only ilike search', err)
      query = supabase.from('products').select('*', { count: 'exact' }).ilike('name', pattern)
      // re-apply other filters (brand/category) later below will still work because we reassign query
    }
  }

  if (brand) {
    const b = String(brand).trim()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b)
    const orParts = [
      `brand_slug.eq.${b}`,
      `brandName.eq.${b}`
    ]
    if (isUuid) orParts.push(`brand_id.eq.${b}`)
    try {
      query = query.or(orParts.join(','))
    } catch (err) {
      // If OR fails due to special chars, fallback to equality on brand_slug only
      query = query.eq('brand_slug', b)
    }
  }

  if (category) {
    // match by category slug or name
    query = query.eq('category', category).or(`category.eq.${category}`)
  }

  if (subcategory) {
    // try to match either the subcategory column or presence inside the category_path JSONB array
    try {
      // attempt equality on subcategory first
      query = query.eq('subcategory', subcategory).or(`subcategory.eq.${subcategory}`)
    } catch (err) {
      // if complex OR filters fail, use json contains fallback below when executing
      console.warn('subcategory OR filter construction failed, will apply fallback at execution', err)
    }
  }

  query = query.order(orderBy, { ascending: order === 'asc' }).range(from, to)

  // execute main query; if Supabase returns an error (e.g. malformed OR filter -> 400),
  // try a simpler fallback that searches only the name column using ilike.
  let data, error, count
  try {
    const res = await query
    data = res.data
    error = res.error
    count = res.count
  } catch (e) {
    // rare case: client threw before response
    error = e
  }

  if (error) {
    // attempt fallback only if we had a text query
    if (q && String(q).trim()) {
      try {
        const pattern = `%${String(q).trim()}%`
        let fallback = supabase.from('products').select('*', { count: 'exact' }).ilike('name', pattern)
        if (brand) {
          const b = String(brand).trim()
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b)
          const orParts = [
            `brand_slug.eq.${b}`,
            `brandName.eq.${b}`
          ]
          if (isUuid) orParts.push(`brand_id.eq.${b}`)
          try {
            fallback = fallback.or(orParts.join(','))
          } catch (err2) {
            fallback = fallback.eq('brand_slug', b)
          }
        }
        if (category) {
          fallback = fallback.eq('category', category).or(`category.eq.${category}`)
        }
        if (subcategory) {
          // for fallback try simple equality on subcategory
          fallback = fallback.eq('subcategory', subcategory)
        }
        const res2 = await fallback.order(orderBy, { ascending: order === 'asc' }).range(from, to)
        data = res2.data
        error = res2.error
        count = res2.count
      } catch (e) {
        throw e
      }
    } else {
      throw error
    }
  }

  // resolve image URLs for each product (best-effort)
  const items = await hydrateProducts(data ?? [])
  return { data: items, count }
}

/**
 * Fetch single product by slug
 */
export async function fetchProductBySlug(slug) {
  if (!SUPABASE_ENABLED) {
    const row = (Array.isArray(localProducts) ? localProducts : []).find(p => p.slug === slug)
    const [product] = await hydrateProducts(row ? [row] : [])
    if (!product) throw new Error('Produto não encontrado')
    return product
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  const [product] = await hydrateProducts([data])
  return product
}

/**
 * Fetch top N products (recent) or optionally filter by category
 */
export async function fetchTopProducts({ limit = 10, category = null, categories = null, subcategory = null } = {}) {
  if (!SUPABASE_ENABLED) {
    let rows = Array.isArray(localProducts) ? [...localProducts] : []
    const keys = new Set()
    if (category) keys.add(String(category).toLowerCase())
    if (subcategory) keys.add(String(subcategory).toLowerCase())
    if (Array.isArray(categories)) categories.filter(Boolean).forEach(k => keys.add(String(k).toLowerCase()))
    if (keys.size > 0) {
      rows = rows.filter(p => {
        const cat = String(p.category || '').toLowerCase()
        const sub = String(p.subcategory || p.sub_category || '').toLowerCase()
        return keys.has(cat) || keys.has(sub)
      })
    }
    rows.sort((a,b) => {
      const at = a.created_at ? new Date(a.created_at).getTime() : 0
      const bt = b.created_at ? new Date(b.created_at).getTime() : 0
      return bt - at
    })
    const trimmed = rows.slice(0, limit)
    return hydrateProducts(trimmed)
  }
  const keys = new Set()
  if (category) keys.add(category)
  if (subcategory) keys.add(subcategory)
  if (Array.isArray(categories)) categories.filter(Boolean).forEach((value) => keys.add(value))

  const baseQuery = () => supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(limit)

  if (keys.size === 0) {
    const { data, error } = await baseQuery()
    if (error) throw error
    return hydrateProducts(data ?? [])
  }

  const collected = new Map()

  const safeCollect = (rows = []) => {
    for (const row of rows) {
      const mapKey = row.id ?? row.slug ?? `${row.name || 'produto'}-${row.created_at || Math.random()}`
      if (!collected.has(mapKey)) collected.set(mapKey, row)
    }
  }

  for (const key of keys) {
    if (!key) continue

    const runners = [
      async () => await baseQuery().eq('category', key),
      async () => await baseQuery().eq('subcategory', key)
    ]

    for (const run of runners) {
      try {
        const { data, error } = await run()
        if (error) {
          // tolerate common PostgREST errors and continue to next strategy
          if (error.code === '42703' || error.code === 'PGRST201' || error.code === 'PGRST204' || error.code === '22P02') {
            continue
          }
          throw error
        }
        safeCollect(data)
      } catch (err) {
        if (err?.code === '42703' || err?.code === 'PGRST201' || err?.code === 'PGRST204' || err?.code === '22P02') {
          continue
        }
        throw err
      }
    }
  }

  if (collected.size === 0) {
    const { data, error } = await baseQuery()
    if (error) throw error
    return hydrateProducts(data ?? [])
  }

  const sorted = [...collected.values()].sort((a, b) => {
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
    return bDate - aDate
  })

  const trimmed = sorted.slice(0, limit)
  return hydrateProducts(trimmed)
}

/**
 * Fetch multiple products by array of slugs (single query)
 */
export async function fetchProductsBySlugs(slugs = []) {
  if (!Array.isArray(slugs) || slugs.length === 0) return []
  if (!SUPABASE_ENABLED) {
    const rows = (Array.isArray(localProducts) ? localProducts : []).filter(p => slugs.includes(p.slug))
    const items = await hydrateProducts(rows)
    const bySlug = new Map(items.map(i => [i.slug, i]))
    return slugs.map(s => bySlug.get(s)).filter(Boolean)
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('slug', slugs)
  if (error) throw error
  const items = await hydrateProducts(data ?? [])
  const bySlug = new Map(items.map(i => [i.slug, i]))
  return slugs.map(s => bySlug.get(s)).filter(Boolean)
}

/**
 * Best-effort: para campos de imagens (images, additional_images, merchant.image etc.)
 * substitui paths com URLs públicas/signed quando detectado um path relativo.
 */
async function hydrateProductImages(product) {
  if (!product) return product

  const p = { ...product }

  // Mapear campos do banco (snake_case/lowercase) para camelCase esperado no frontend
  if (p.shortdescription && !p.shortDescription) {
    p.shortDescription = p.shortdescription
  }
  if (p.long_description && !p.longDescription) {
    p.longDescription = p.long_description
  }
  if (p.description_html && !p.descriptionHtml) {
    p.descriptionHtml = p.description_html
  }
  
  // Se não tiver shortDescription mas tiver description, criar um resumo curto
  // (primeiras 150-200 chars da description como fallback)
  if (!p.shortDescription && p.description && p.description.length > 200) {
    // Encontrar a primeira frase completa ou limitar a 200 chars
    const firstSentence = p.description.match(/^[^.!?]+[.!?]/)
    if (firstSentence && firstSentence[0].length <= 200) {
      p.shortDescription = firstSentence[0].trim()
    } else {
      // Pegar os primeiros 197 chars + "..."
      p.shortDescription = p.description.substring(0, 197).trim() + '...'
    }
    // Mover o texto completo para longDescription se não existir
    if (!p.longDescription) {
      p.longDescription = p.description
    }
  }

  // images: array of { url, alt }
  if (Array.isArray(p.images)) {
    p.images = await Promise.all(p.images.map(async (img) => ({
      ...img,
      url: await resolveImageUrl(img.url)
    })))
  }

  if (Array.isArray(p.additional_images)) {
    p.additional_images = await Promise.all(p.additional_images.map(async (img) => ({
      ...img,
      url: await resolveImageUrl(img.url)
    })))
  }

  // merchant.image or similar (non-standard field in example)
  if (p.merchant && typeof p.merchant === 'object') {
    if (p.merchant.image && typeof p.merchant.image === 'string') {
      p.merchant.image = await resolveImageUrl(p.merchant.image)
    }
    // custom_labels keep unchanged
  }

  // seo canonicalUrl remains as is

  if (!p.image && Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.url) {
    p.image = p.images[0].url
  }

  return p
}

async function attachBrandRecords(products = []) {
  if (!Array.isArray(products) || products.length === 0) return products

  const brandIds = new Set()
  const brandSlugCandidates = new Set()
  const brandNameCandidates = new Set()

  for (const product of products) {
    if (!product) continue
    if (product.brand_id) brandIds.add(product.brand_id)
  if (product.brand && typeof product.brand === 'object' && product.brand.slug) brandSlugCandidates.add(product.brand.slug)
  if (product.brand && typeof product.brand === 'object' && product.brand.name) brandNameCandidates.add(product.brand.name)
  if (product.brand && typeof product.brand === 'object' && product.brand.companyName) brandNameCandidates.add(product.brand.companyName)
    if (typeof product.brand === 'string') brandSlugCandidates.add(product.brand)
    if (product.brand_slug) brandSlugCandidates.add(product.brand_slug)
    if (product.brandName && typeof product.brandName === 'string') brandNameCandidates.add(product.brandName)
  }

  let brandRows = []

  if (brandIds.size > 0) {
    const { data, error } = await supabase.from('brands').select('*').in('id', [...brandIds])
    if (!error && Array.isArray(data)) brandRows = data
  }

  const missingSlugs = [...brandSlugCandidates].filter(slug => !brandRows.some(row => row.slug === slug || row.id === slug))
  if (missingSlugs.length > 0) {
    const { data, error } = await supabase.from('brands').select('*').in('slug', missingSlugs)
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (!brandRows.some(existing => existing.id === row.id)) brandRows.push(row)
      }
    }
  }

  const missingNames = [...brandNameCandidates].filter(name => !brandRows.some(row => row.name === name || row.companyName === name))
  if (missingNames.length > 0) {
    const { data, error } = await supabase.from('brands').select('*').in('name', missingNames)
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (!brandRows.some(existing => existing.id === row.id)) brandRows.push(row)
      }
    }

    try {
      const { data: companyData, error: companyError } = await supabase.from('brands').select('*').in('companyName', missingNames)
      if (!companyError && Array.isArray(companyData)) {
        for (const row of companyData) {
          if (!brandRows.some(existing => existing.id === row.id)) brandRows.push(row)
        }
      }
    } catch (e) {
      // column may not exist; ignore
    }
  }

  const normalizedRows = await Promise.all((brandRows || []).map(async (row) => {
    const normalized = normalizeBrandRow(row)
    if (normalized?.imageCompany) {
      try {
        const resolved = await resolveImageUrl(normalized.imageCompany)
        normalized.imageCompany = resolved || normalized.imageCompany
      } catch (e) {
        // keep original image path if resolution fails
      }
    }
    return normalized
  }))

  const brandById = new Map()
  const brandBySlug = new Map()

  for (const brand of normalizedRows) {
    if (!brand) continue
    if (brand.id) brandById.set(brand.id, brand)
    if (brand.slug) brandBySlug.set(brand.slug, brand)
  }

  return products.map((product) => {
    const p = { ...product }

    const brandCandidates = []
    if (p.brand_id && brandById.has(p.brand_id)) brandCandidates.push(brandById.get(p.brand_id))
    if (p.brand && typeof p.brand === 'object' && p.brand.slug && brandBySlug.has(p.brand.slug)) brandCandidates.push(brandBySlug.get(p.brand.slug))
    if (typeof p.brand === 'string' && brandBySlug.has(p.brand)) brandCandidates.push(brandBySlug.get(p.brand))
    if (p.brand_slug && brandBySlug.has(p.brand_slug)) brandCandidates.push(brandBySlug.get(p.brand_slug))

    const brandInfo = brandCandidates.find(Boolean)

    if (brandInfo) {
      p.brand_record = brandInfo._raw
      if (!p.brandName) p.brandName = brandInfo.companyName
      if (!p.imageBrand) p.imageBrand = brandInfo.imageCompany || localBrandLogo(brandInfo.slug || brandInfo.companyName)

      const normalizedBrand = {
        id: brandInfo.id,
        name: brandInfo.companyName,
        slug: brandInfo.slug,
        logo: brandInfo.imageCompany || localBrandLogo(brandInfo.slug || brandInfo.companyName),
      }

      if (!p.brand || typeof p.brand !== 'object') {
        p.brand = normalizedBrand
      } else {
        p.brand = {
          ...normalizedBrand,
          ...p.brand,
          logo: p.brand.logo || normalizedBrand.logo,
          name: p.brand.name || normalizedBrand.name,
          id: p.brand.id || normalizedBrand.id,
          slug: p.brand.slug || normalizedBrand.slug,
        }
      }
    } else if (p.brand && typeof p.brand === 'object') {
      if (p.brand.logo && !p.imageBrand) {
        p.imageBrand = p.brand.logo
      } else if (!p.imageBrand) {
        // as a last resort, try local asset by brand slug/name
        p.imageBrand = localBrandLogo(p.brand.slug || p.brand.name)
      }
    }

    return p
  })
}

function normalizeBrandRow(row) {
  if (!row) return null
  const meta = row.meta || {}
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

  if (!imageCompany && row.imageCompany) imageCompany = row.imageCompany
  if (!imageCompany && meta.logoUrl) imageCompany = meta.logoUrl

  return {
    id: row.id,
    companyName: row.name || row.companyName || row.company_name || null,
    slug: row.slug || null,
    description: meta.description || row.description || null,
    bgColor: meta.bgColor || meta.bg_color || row.bgColor || null,
    imageCompany,
    numberProducts: row.number_products ?? row.numberProducts ?? 0,
    meta,
    _raw: row,
  }
}

/**
 * Resolve an image path or URL. If it's already a http(s) url, return it.
 * Otherwise attempt to get public url first, then signed url.
 */
// image resolution delegated to src/services/supabase.resolveImageUrl

/**
 * Suggest products when an exact search returns no results.
 * Strategy:
 * 1) Try a relaxed server-side name ilike search for the raw q.
 * 2) If no results, fetch up to `scanLimit` recent products and run a simple
 *    Levenshtein distance on the product name to find close matches.
 */
export async function suggestProducts(q, { limit = 6, scanLimit = 200 } = {}) {
  if (!q || !String(q).trim()) return []
  const pattern = `%${String(q).trim()}%`

  try {
    // Try a simple name ilike search first
    const { data, error } = await supabase.from('products').select('*').ilike('name', pattern).limit(limit)
    if (!error && data && data.length) {
      return await hydrateProducts(data)
    }
  } catch (e) {
    // ignore and fallback to scan
    console.warn('suggestProducts: ilike name search failed', e)
  }

  try {
    // Fallback: fetch a manageable set of recent products and run a client-side fuzzy match
    const { data: pool, error: poolErr } = await supabase.from('products').select('slug,name').order('created_at', { ascending: false }).limit(scanLimit)
    if (poolErr || !pool || pool.length === 0) return []

    const qLower = String(q).toLowerCase()

    // simple Levenshtein distance implementation
    function levenshtein(a, b) {
      const m = a.length
      const n = b.length
      const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
      for (let i = 0; i <= m; i++) dp[i][0] = i
      for (let j = 0; j <= n; j++) dp[0][j] = j
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1
          dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
        }
      }
      return dp[m][n]
    }

    // compute distance for each candidate
    const scored = pool.map(p => ({ ...p, score: levenshtein(qLower, (p.name || '').toLowerCase()) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)

    const slugs = scored.map(s => s.slug)
    if (slugs.length === 0) return []
    return await fetchProductsBySlugs(slugs)
  } catch (e) {
    console.warn('suggestProducts fallback failed', e)
    return []
  }
}

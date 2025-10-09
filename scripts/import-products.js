/**
 * Script para importar produtos do arquivo local `src/data/products.json` para o Supabase
 * Uso: definir SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente (ou usar .env) e rodar:
 * node scripts/import-products.js
 */

import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { readFile } from 'fs/promises'

const MISSING_CATEGORY_PATH_CODES = new Set(['42703', 'PGRST201', 'PGRST204'])
let categoryPathColumnAvailable = true

const looksLikeMissingCategoryPath = (error) => {
  if (!error) return false
  if (error.code && MISSING_CATEGORY_PATH_CODES.has(error.code)) return true
  const message = String(error.message || error.error_description || '').toLowerCase()
  return message.includes("'category_path'") && message.includes('schema cache')
}

const removeDiacritics = (str = '') => str.normalize('NFD').replace(/\p{Diacritic}+/gu, '')
const slugify = (s = '') => removeDiacritics(String(s).trim().toLowerCase())
  .replace(/[^a-z0-9\s\-_.]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$|\.+$/g, '')

const ensureDefaultUnit = (units) => {
  if (Array.isArray(units) && units.length) return units
  return [{
    key: 'un',
    label: 'Unidade',
    baseQuantity: 1,
    defaultQuantity: 1,
    price: null,
    sku: '',
    gtin: '',
    mpn: '',
    measurePrices: {}
  }]
}

const ensureMeasures = (p) => {
  if (Array.isArray(p.measures) && p.measures.length) return { measures: p.measures, defaultId: p.defaultMeasureId || p.default_measure_id || null }
  if (p.dimensions && (p.dimensions.length != null || p.dimensions.width != null || p.dimensions.height != null)) {
    const u = (p.dimensions.unit || 'mm').toString().toUpperCase()
    const len = p.dimensions.length != null ? p.dimensions.length : null
    const wid = p.dimensions.width != null ? p.dimensions.width : null
    const hei = p.dimensions.height != null ? p.dimensions.height : null
    const baseId = len != null ? `${len}${u}` : wid != null ? `${wid}${u}` : `MED-${u}`
    const id = String(baseId).replace(/\s+/g, '')
    const m = [{ id, unit: u.toLowerCase(), label: id, price: p.price || null, width: wid, length: len, height: hei }]
    return { measures: m, defaultId: id }
  }
  return { measures: null, defaultId: null }
}

const buildPayload = (p, { includeCategoryPath = true } = {}) => {
  const payload = {
    slug: p.slug,
    name: p.name,
    price: p.price,
    currency: p.currency,
    category: p.category || null,
    subcategory: p.subcategory || p.subCategory || null,
    // preserve objects/arrays as plain JS values so supabase-js sends proper jsonb
    brand: p.brand || null,
    sku: p.sku || null,
    gtin: p.gtin || null,
    mpn: p.mpn || null,
    availability: p.availability || null,
    condition: p.condition || null,
    stock: typeof p.stock !== 'undefined' ? p.stock : null,
    description: p.description || null,
    long_description: p.longDescription || null,
    description_html: p.descriptionHtml || null,
    dimensions: p.dimensions ? p.dimensions : null,
    weight: p.weight ? p.weight : null,
    images: p.images ? p.images : null,
    additional_images: p.additionalImages ? p.additionalImages : null,
    properties: p.properties ? p.properties : null,
    units: p.units ? ensureDefaultUnit(p.units) : ensureDefaultUnit(null),
    measures: p.measures ? p.measures : null,
    default_measure_id: p.defaultMeasureId || null,
    default_unit_key: 'un',
    shipping: p.shipping ? p.shipping : null,
    seo: p.seo ? p.seo : null,
    merchant: p.merchant ? p.merchant : null,
    search_terms: p.searchTerms ? p.searchTerms : null,
    faqs: p.faqs ? p.faqs : null,
    schema_org: p.schemaOrg ? p.schemaOrg : null
  }

  // category_path + category_slug
  let categoryPathValue = typeof p.categoryPath !== 'undefined' ? p.categoryPath : p.category_path
  if (typeof categoryPathValue === 'undefined') {
    if (p.category && p.subcategory) categoryPathValue = [p.category, p.subcategory]
    else if (p.category) categoryPathValue = [p.category]
  }
  if (includeCategoryPath && typeof categoryPathValue !== 'undefined') {
    payload.category_path = categoryPathValue || null
  }
  if (p.category) payload.category_slug = slugify(p.category)

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key])
  return payload
}

// Try to load .env file if present (manual lightweight loader) so you can keep envs in .env
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
    // ignore if no .env
  }
}

await loadDotEnvIfExists()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
// accept both SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY from .env
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function loadBrandMap() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
  if (error) {
    console.warn('Falha ao carregar brands; import continuará sem normalizar marcas.', error.message || error)
    return { bySlug: new Map(), byName: new Map(), rows: [] }
  }
  const bySlug = new Map()
  const byName = new Map()
  for (const b of data) {
    const slug = b.slug || slugify(b.name)
    bySlug.set(String(slug).toLowerCase(), b)
    // index by both name and companyName when available
    if (b.name) byName.set(String(b.name).toLowerCase(), b)
    if (b.companyName) byName.set(String(b.companyName).toLowerCase(), b)
  }
  return { bySlug, byName, rows: data }
}

async function loadBrandAliases() {
  try {
    const fp = path.join(process.cwd(), 'scripts', 'brand-aliases.json')
    const raw = await readFile(fp, 'utf8')
    const json = JSON.parse(raw)
    const idx = new Map()
    for (const [slug, aliases] of Object.entries(json)) {
      for (const a of aliases) idx.set(a.toLowerCase(), slug)
      idx.set(slug.toLowerCase(), slug)
    }
    return idx
  } catch (e) { return new Map() }
}

function inferUnitsFromProduct(p) {
  const name = (p.name || '').toLowerCase()
  const cat = (p.category || '').toLowerCase()
  // default unit
  let units = [{ key: 'un', label: 'Unidade', baseQuantity: 1, defaultQuantity: 1, price: p.price ?? null, sku: '', gtin: '', mpn: '', measurePrices: {} }]

  const addOrSet = (key, label) => {
    const existing = units.find(u => u.key === key)
    if (existing) { existing.label = label; existing.price = existing.price ?? p.price ?? null; return }
    units.push({ key, label, baseQuantity: 1, defaultQuantity: 1, price: p.price ?? null, sku: '', gtin: '', mpn: '', measurePrices: {} })
  }

  // Heurísticas por categoria e palavras-chave no nome
  if (/rolo/.test(name) || /rolo/.test(cat)) addOrSet('rolo', 'Rolo')
  if (/kg\b|\bkil|\bquilos|\bkilo/.test(name)) addOrSet('kg', 'Kg')
  if (/\bkg\b/.test(cat)) addOrSet('kg', 'Kg')
  if (/\bmm\b|\bcm\b|\bm\b/.test(name) || /perfil|barra|montante|guia|travessa|tabica|tira/.test(name)) addOrSet('un', 'Unidade')
  if (/caixa|cx|pack|pacote/.test(name)) addOrSet('cx', 'Caixa')
  if (/saco|sacola|ensacado/.test(name)) addOrSet('sc', 'Saco')
  if (/l\b|litro|\d+\.?\d*\s*l/.test(name)) addOrSet('l', 'Litro')
  if (/m2|m²|metro quadrado/.test(name)) addOrSet('m2', 'm²')

  // remove duplicada 'un' caso outra específica faça mais sentido? Mantemos 'un' como default.
  return ensureDefaultUnit(units)
}

async function main() {
  const file = path.join(process.cwd(), 'src', 'data', 'products.json')
  const raw = await readFile(file, 'utf8')
  const data = JSON.parse(raw)
  console.log(`Importing ${data.length} products...`)
  const brandMaps = await loadBrandMap()
  const brandAliases = await loadBrandAliases()

  for (const p of data) {
    // Normalize brand against DB (use CSV brand, or infer from name if missing/unknown)
    let normalizedBrand = p.brand || null
    let brand_id = null
    let brand_slug = null
    let brandName = null
    const tryResolve = (candidate) => {
      const nameStr = candidate.trim()
      const norm = (s) => removeDiacritics(String(s || '').toLowerCase())
      const nameNorm = norm(nameStr)
      const aliasSlug = brandAliases.get(nameNorm) // aliases are lowercased
      const slug = aliasSlug || slugify(nameStr)
      let found = brandMaps.bySlug.get(slug) || brandMaps.byName.get(nameStr.toLowerCase())

      // Fallback fuzzy: try matching by normalized contains on name or companyName
      if (!found && Array.isArray(brandMaps.rows)) {
        const candidates = brandMaps.rows.filter(b => {
          const n1 = norm(b.name)
          const n2 = norm(b.companyName)
          const s1 = norm(b.slug)
          return n1.includes(nameNorm) || n2.includes(nameNorm) || s1 === nameNorm || s1.includes(nameNorm)
        })
        if (candidates.length) found = candidates[0]
      }

      if (found) {
        normalizedBrand = {
          id: found.id,
          name: found.companyName || found.name,
          slug: found.slug || slug,
          bgColor: found.bgColor || found.meta?.bgColor || null,
          description: found.description || found.meta?.description || null,
          imageCompany: found.imageCompany || null,
          logo: found.logo || null,
          meta: found.meta || null,
          created_at: found.created_at,
          updated_at: found.updated_at,
          companyName: found.companyName || found.name,
          number_products: found.number_products || 0
        }
        brand_id = found.id
        brand_slug = found.slug || slug
        brandName = found.companyName || found.name
      } else {
        // fallback brand object with only name/slug
        normalizedBrand = { name: nameStr, slug }
        brand_slug = slug
        brandName = nameStr
      }
    }
    if (normalizedBrand && typeof normalizedBrand === 'string') {
      tryResolve(normalizedBrand)
    } else if (normalizedBrand && typeof normalizedBrand === 'object') {
      brand_id = normalizedBrand.id || null
      brand_slug = normalizedBrand.slug || (normalizedBrand.name ? slugify(normalizedBrand.name) : null)
      brandName = normalizedBrand.name || null
    } else {
      // Infer brand from product name (scan aliases)
      const lower = String(p.name || '').toLowerCase()
      let inferred = null
      for (const [alias, slug] of brandAliases.entries()) {
        if (lower.includes(alias)) { inferred = slug; break }
      }
      if (inferred) tryResolve(inferred)
    }

    // Ensure measures and default unit
  const { measures, defaultId } = ensureMeasures(p)
  const units = inferUnitsFromProduct(p)
  const augmented = { ...p, brand: normalizedBrand, measures: measures || p.measures || null, defaultMeasureId: p.defaultMeasureId || defaultId || null, units }

    const attempt = async (includeCategoryPath) => {
      const payload = buildPayload(augmented, { includeCategoryPath })
      if (brand_id) payload.brand_id = brand_id
      if (brand_slug) payload.brand_slug = brand_slug
      if (brandName) payload["brandName"] = brandName
      return await supabase
        .from('products')
        .upsert(payload, { onConflict: ['slug'], returning: 'representation' })
    }

    let response = await attempt(categoryPathColumnAvailable)
    if (response.error && categoryPathColumnAvailable && looksLikeMissingCategoryPath(response.error)) {
      categoryPathColumnAvailable = false
      console.warn('Supabase não encontrou a coluna category_path; reenviando sem ela.')
      response = await attempt(false)
    }

    const { data: upserted, error } = response
    if (error) {
      console.error('Upsert error for', p.slug, error.message || error)
    } else {
      console.log('Upserted', p.slug, upserted?.length ? `(${upserted[0].id})` : '')
    }
  }

  console.log('Done')
}

main().catch(err => { console.error(err); process.exit(1) })

#!/usr/bin/env node
/**
 * Transforma um CSV legado em src/data/products.json no formato esperado pelo import-products.js
 * Uso:
 *   node scripts/transform-csv-to-products.mjs \
 *     ./caminho/para/produtos.csv \
 *     ./scripts/csv-product-mapping.json \
 *     BRL
 */

import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const [,, csvPathArg, mappingPathArg, defaultCurrencyArg, categoryMapArg] = process.argv
const csvPath = csvPathArg ? path.resolve(process.cwd(), csvPathArg) : null
const mappingPath = mappingPathArg ? path.resolve(process.cwd(), mappingPathArg) : path.join(__dirname, 'csv-product-mapping.json')
const categoryMapPath = categoryMapArg ? path.resolve(process.cwd(), categoryMapArg) : path.join(__dirname, 'category-mapping.json')
const DEFAULT_CURRENCY = defaultCurrencyArg || 'BRL'

if (!csvPath) {
  console.error('Uso: node scripts/transform-csv-to-products.mjs <arquivo.csv> [mapping.json] [BRL] [category-map.json]')
  process.exit(1)
}

const removeDiacritics = (str='') => str.normalize('NFD').replace(/\p{Diacritic}+/gu,'')
const slugify = (s='') => removeDiacritics(String(s).trim().toLowerCase())
  .replace(/[^a-z0-9\s\-_.]/g,'')
  .replace(/\s+/g,'-')
  .replace(/-+/g,'-')
  .replace(/^-|-$|\.+$/g,'')

const toNumberBR = (val) => {
  if (val == null) return null
  const s = String(val).trim()
  if (!s) return null
  // Detecta padrão de decimal: pt-BR (vírgula) vs en-US (ponto)
  // Casos:
  // 1) Tem vírgula: considera vírgula como decimal e ponto como milhar
  // 2) Sem vírgula e com ponto seguido de 1-3 dígitos: considera ponto como decimal
  // 3) Ambos presentes: trata vírgula como decimal, remove pontos
  let norm = s
  if (/,/.test(s)) {
    // pt-BR style
    norm = s.replace(/\./g, '') // remove milhares
    norm = norm.replace(/,/g, '.')
  } else {
    // Sem vírgula. Se houver múltiplos pontos, trate os primeiros como milhares
    const parts = s.split('.')
    if (parts.length > 2) {
      const last = parts.pop()
      norm = parts.join('') + '.' + last
    } else {
      norm = s
    }
  }
  norm = norm.replace(/[^0-9.\-]/g, '')
  if (!/[0-9]/.test(norm)) return null
  const n = Number(norm)
  return Number.isFinite(n) ? n : null
}

const loadJSON = async (p) => JSON.parse(await readFile(p,'utf8'))

const readCsvSmart = (buf) => {
  const text = typeof buf === 'string' ? buf : buf.toString('utf8')
  // tenta detectar separador por heurística simples
  const firstLine = text.split(/\r?\n/)[0] || ''
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : undefined
  return parse(text, { columns: true, skip_empty_lines: true, delimiter })
}

const firstTruthy = (row, keys=[]) => {
  for (const k of keys) {
    if (!k) continue
    if (k.includes('.')) continue // nested handled separately
    const v = row[k]
    if (v != null && String(v).trim() !== '') return v
  }
  return null
}

const splitList = (val) => {
  if (!val) return []
  const s = String(val)
  // separa por ; | , | | (pipe)
  return s.split(/\s*[;,|]\s*/g).map(x=>x.trim()).filter(Boolean)
}

const normalizeCategory = (category, subcategory, catMap) => {
  if (!category && !subcategory) return { category: null, subcategory: null }
  const srcCat = String(category || '').toLowerCase()
  const srcSub = String(subcategory || '').toLowerCase()
  let pickedRoot = null
  for (const [root, cfg] of Object.entries(catMap || {})) {
    const matches = (cfg.match || []).some(m => srcCat.includes(m) || srcSub.includes(m))
    if (matches) { pickedRoot = root; break }
  }
  if (!pickedRoot) {
    // heurísticas
    if (/drywall/.test(srcCat) || /drywall/.test(srcSub)) pickedRoot = 'drywall'
    else if (/steel/.test(srcCat) || /ciment/i.test(srcCat)) pickedRoot = 'steel-frame'
    else if (/forro|forros/.test(srcCat)) pickedRoot = 'forros-removiveis'
    else if (/argamassa|rejunte|impermeabiliza/i.test(srcCat)) pickedRoot = 'argamassas-impermeabilizantes'
    else if (/piso|vinilico/.test(srcCat)) pickedRoot = 'pisos'
    else if (/ferrament|parafus|bucha|chumbador|pino/.test(srcCat)) pickedRoot = 'ferramentas'
    else if (/telha|shingle|galvalume/.test(srcCat)) pickedRoot = 'telhados'
    else if (/acustic|ecophon|nexacust/.test(srcCat)) pickedRoot = 'acustica'
  }
  let pickedSub = null
  const subMap = catMap?.[pickedRoot]?.subcategory || {}
  for (const [k, v] of Object.entries(subMap)) {
    if (srcSub.includes(k) || srcCat.includes(k)) { pickedSub = v; break }
  }
  return { category: pickedRoot, subcategory: pickedSub }
}

const mapRow = (row, mapping, catMap) => {
  const get = (keyOrKeys) => Array.isArray(keyOrKeys) ? firstTruthy(row, keyOrKeys) : row[keyOrKeys]

  const name = get(mapping.name)
  const brand = get(mapping.brand)
  const sku = get(mapping.sku)
  const priceRaw = get(mapping.price)
  const price = toNumberBR(priceRaw)
  const currency = get(mapping.currency) || DEFAULT_CURRENCY
  const rawCategory = get(mapping.category)
  const rawSubcategory = get(mapping.subcategory)
  const gtin = get(mapping.gtin)
  const mpn = get(mapping.mpn)
  const shortDescription = get(mapping.shortDescription)
  const description = get(mapping.description) || shortDescription
  const weightValue = toNumberBR(get(mapping['weight.value']))
  const weightUnit = get(mapping['weight.unit']) || (weightValue != null ? 'kg' : null)
  const width = toNumberBR(get(mapping['dimensions.width']))
  const length = toNumberBR(get(mapping['dimensions.length']))
  const height = toNumberBR(get(mapping['dimensions.height']))
  const dimUnit = get(mapping['dimensions.unit']) || ((width||length||height) ? 'mm' : null)
  const imagesRaw = get(mapping.images)
  const additionalRaw = get(mapping.additionalImages)
  const stockRaw = get(mapping.stock)
  let stock = null
  if (stockRaw != null && String(stockRaw).trim() !== '') {
    const s = String(stockRaw).trim()
    const norm = s.replace(/[^0-9\-]/g,'')
    stock = /^-?\d+$/.test(norm) ? parseInt(norm, 10) : null
  }
  const availability = get(mapping.availability) || (stock > 0 ? 'in_stock' : null)
  const condition = get(mapping.condition) || 'new'

  const images = splitList(imagesRaw).map((url, idx) => ({ url, alt: `${name || sku || 'Produto'}${brand ? ` ${brand}` : ''}${idx ? ` (${idx+1})` : ''}` }))
  const additionalImages = splitList(additionalRaw).map((url, idx) => ({ url, alt: `${name || sku || 'Produto'} - extra ${idx+1}` }))

  const slugBase = name || sku || gtin || mpn || ''
  const slug = slugify(slugBase)

  const { category: normCat, subcategory: normSub } = normalizeCategory(rawCategory, rawSubcategory, catMap)

  const result = {
    slug,
    name: name || slug,
    price,
    currency,
    category: normCat || (rawCategory ? slugify(rawCategory) : null),
    subcategory: normSub || (rawSubcategory ? slugify(rawSubcategory) : null),
    brand: brand || null,
    sku: sku || null,
    gtin: gtin || null,
    mpn: mpn || null,
    availability: availability || null,
    condition: condition || null,
    shortDescription: shortDescription || null,
    description: description || null,
    longDescription: description || null,
    descriptionHtml: null,
    weight: (weightValue != null || weightUnit) ? { value: weightValue, unit: weightUnit || 'kg' } : null,
    dimensions: (width != null || length != null || height != null || dimUnit) ? { width, length, height, unit: dimUnit || 'mm' } : null,
    images: images.length ? images : null,
    additionalImages: additionalImages.length ? additionalImages : null,
    properties: null,
    units: null,
    measures: null,
    defaultMeasureId: null,
    shipping: null,
    seo: null,
    merchant: null,
    searchTerms: null,
    faqs: null,
    schemaOrg: null,
    stock: stock
  }
  return result
}

async function main(){
  const rawCsv = await readFile(csvPath)
  const rows = readCsvSmart(rawCsv)
  const mapping = await loadJSON(mappingPath)
  let categoryMap = {}
  try { categoryMap = await loadJSON(categoryMapPath) } catch (e) { /* optional */ }

  const products = rows.map(r => mapRow(r, mapping, categoryMap))

  const outPath = path.join(process.cwd(), 'src', 'data', 'products.json')
  await writeFile(outPath, JSON.stringify(products, null, 2), 'utf8')
  console.log(`Gerado ${products.length} produtos em ${outPath}`)
}

main().catch(err => { console.error(err); process.exit(1) })

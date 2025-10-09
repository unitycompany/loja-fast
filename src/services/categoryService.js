import { supabase, SUPABASE_ENABLED } from './supabase'
import localCategories from '../data/categories.json'

const normalizeKey = (value) => {
  if (value == null) return null
  if (typeof value === 'object') {
    // try common fields
    return normalizeKey(value.slug || value.id || value.name || value.label)
  }
  return String(value).trim().toLowerCase() || null
}

const CATEGORY_COLUMN_PRIORITIES = [
  ['category', 'category_slug', 'subcategory', 'sub_category', 'category_path'],
  ['category', 'subcategory', 'sub_category', 'category_path'],
  ['category', 'subcategory', 'category_path'],
  ['category', 'subcategory'],
  ['category']
]

async function fetchProductCategoryRows() {
  if (!SUPABASE_ENABLED) {
    // approximate stats from local products.json is not available here, so return empty counts
    return []
  }
  let lastError = null
  for (const columns of CATEGORY_COLUMN_PRIORITIES) {
    try {
      const select = columns.join(',')
      const { data, error } = await supabase.from('products').select(select)
      if (error) {
        if (error.code === '42703') {
          lastError = error
          continue
        }
        throw error
      }
      return Array.isArray(data) ? data : []
    } catch (err) {
      if (err?.code === '42703') {
        lastError = err
        continue
      }
      throw err
    }
  }
  if (lastError) {
    console.warn('Falling back to empty product category set due to missing columns', lastError)
  }
  return []
}

const extractPathEntries = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch (err) {
      // treat plain string as single path entry
      return [value]
    }
    return [value]
  }
  return []
}

async function buildCategoryStats() {
  const categoryTotals = new Map()
  const subcategoryTotals = new Map()

  const rows = await fetchProductCategoryRows()

  const increment = (map, key, amount = 1) => {
    if (!key) return
    map.set(key, (map.get(key) || 0) + amount)
  }

  for (const row of rows || []) {
    const catKey = normalizeKey(row.category_slug || row.category)
    const subKey = normalizeKey(row.subcategory || row.sub_category)

    const categoryKeys = new Set()
    if (catKey) categoryKeys.add(catKey)
    if (subKey) categoryKeys.add(subKey)
    for (const pathEntry of extractPathEntries(row.category_path)) {
        const key = normalizeKey(pathEntry)
        if (key) categoryKeys.add(key)
      }

    for (const key of categoryKeys) increment(categoryTotals, key)

    if (catKey && subKey) {
      increment(subcategoryTotals, `${catKey}::${subKey}`)
    }
  }

  return { categoryTotals, subcategoryTotals }
}

function applyCountsToCategory(rawCategory, stats) {
  const { categoryTotals, subcategoryTotals } = stats
  const catKey = normalizeKey(rawCategory.slug || rawCategory.id || rawCategory.name)
  const numberProducts = categoryTotals.get(catKey) || 0

  const children = Array.isArray(rawCategory.children)
    ? rawCategory.children.map((child) => {
        const childKey = normalizeKey(child.slug || child.id || child.name)
        const combinedKey = catKey && childKey ? `${catKey}::${childKey}` : null
        const childCount = (combinedKey && subcategoryTotals.get(combinedKey))
          || categoryTotals.get(childKey)
          || 0
        return { ...child, numberProducts: childCount }
      })
    : []

  return {
    ...rawCategory,
    numberProducts,
    children,
  }
}

export async function fetchCategories({ includeEmpty = false } = {}) {
  if (!SUPABASE_ENABLED) {
    const stats = await buildCategoryStats()
    const items = (Array.isArray(localCategories) ? localCategories : []).map((raw) => applyCountsToCategory(raw, stats))
    if (includeEmpty) return items
    return items
      .map(cat => ({
        ...cat,
        children: Array.isArray(cat.children) ? cat.children.filter(ch => (ch.numberProducts || 0) > 0) : []
      }))
      .filter(cat => (cat.numberProducts || 0) > 0 || (Array.isArray(cat.children) && cat.children.length > 0))
  }
  const { data, error } = await supabase.from('categories').select('id, data').order('id', { ascending: true })
  if (error) throw error

  const stats = await buildCategoryStats()

  const items = (data || []).map((row) => {
    const enriched = applyCountsToCategory(row.data || {}, stats)
    return { id: row.id, ...enriched }
  })

  if (includeEmpty) return items
  // filter out categories and subcategories with 0 products
  return items
    .map(cat => ({
      ...cat,
      children: Array.isArray(cat.children) ? cat.children.filter(ch => (ch.numberProducts || 0) > 0) : []
    }))
    .filter(cat => (cat.numberProducts || 0) > 0 || (Array.isArray(cat.children) && cat.children.length > 0))
}

// Returns the raw `data` object from each row exactly as stored in the DB
export async function fetchCategoriesRaw({ includeEmpty = true } = {}) {
  if (!SUPABASE_ENABLED) {
    const stats = await buildCategoryStats()
    const items = (Array.isArray(localCategories) ? localCategories : []).map((raw) => ({ id: raw.id || raw.slug, data: applyCountsToCategory(raw, stats) }))
    if (includeEmpty) return items
    return items
      .map(row => ({
        id: row.id,
        data: {
          ...row.data,
          children: Array.isArray(row.data.children) ? row.data.children.filter(ch => (ch.numberProducts || 0) > 0) : []
        }
      }))
      .filter(row => (row.data.numberProducts || 0) > 0 || (Array.isArray(row.data.children) && row.data.children.length > 0))
  }
  const { data, error } = await supabase.from('categories').select('id, data').order('id', { ascending: true })
  if (error) throw error

  const stats = await buildCategoryStats()

  const items = (data || []).map((row) => ({
    id: row.id,
    data: applyCountsToCategory(row.data || {}, stats)
  }))

  if (includeEmpty) return items
  return items
    .map(row => ({
      id: row.id,
      data: {
        ...row.data,
        children: Array.isArray(row.data.children) ? row.data.children.filter(ch => (ch.numberProducts || 0) > 0) : []
      }
    }))
    .filter(row => (row.data.numberProducts || 0) > 0 || (Array.isArray(row.data.children) && row.data.children.length > 0))
}

export async function fetchCategoryById(id) {
  if (!SUPABASE_ENABLED) {
    const stats = await buildCategoryStats()
    const raw = (Array.isArray(localCategories) ? localCategories : []).find(c => (c.id || c.slug) === id)
    if (!raw) throw new Error('Categoria não encontrada')
    return { id: raw.id || raw.slug, ...applyCountsToCategory(raw, stats) }
  }
  const { data, error } = await supabase.from('categories').select('id, data').eq('id', id).single()
  if (error) throw error

  const stats = await buildCategoryStats()
  return { id: data.id, ...applyCountsToCategory(data.data || {}, stats) }
}

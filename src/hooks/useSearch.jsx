import { useMemo } from 'react'
import { supabase } from '../services/supabase'
import { fetchProductsBySlugs } from '../services/productService'

// Basic diacritics map (enough for pt-BR common chars)
const from = 'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ'
const to   = 'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
const DIACRITICS = new Map(from.split('').map((c, i) => [c, to[i]]))

function stripDiacritics(str) {
  if (!str) return ''
  let out = ''
  for (const ch of String(str)) out += DIACRITICS.get(ch) || ch
  return out
}

function normalize(str) {
  return stripDiacritics(String(str || '')).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/[\s_-]+/g, ' ').trim()
}

// Very lightweight plural -> singular heuristics for pt-BR nouns
function singularizeToken(tok) {
  if (!tok) return tok
  // common endings: "ções"->"ção", "ões"->"ão"
  if (tok.endsWith('coes')) return tok.slice(0, -4) + 'cao'
  if (tok.endsWith('soes')) return tok.slice(0, -4) + 'sao'
  if (tok.endsWith('oes')) return tok.slice(0, -3) + 'ao'
  if (tok.endsWith('ais')) return tok.slice(0, -3) + 'al'
  if (tok.endsWith('eis')) return tok.slice(0, -3) + 'el'
  if (tok.endsWith('is')) return tok.slice(0, -2) // e.g., "vinilicos" -> "vinilico"
  if (tok.endsWith('ns')) return tok.slice(0, -1) // "liens" -> "lien" (rare)
  if (tok.endsWith('s') && tok.length > 3) return tok.slice(0, -1)
  return tok
}

const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'por', 'em', 'no', 'na', 'e', 'ou', 'a', 'o', 'as', 'os'])

// Simple synonyms mapping (normalized keys -> array of normalized alternatives)
const SYNONYMS = {
  'piso vinilico': ['pisos vinilico', 'pisos vinilicos', 'piso vinilicos', 'vinilico', 'vinilicos', 'vinilico piso'],
  'drywall': ['gesso acartonado', 'parede seca'],
  'steel frame': ['aço leve', 'aco leve', 'sistema steel frame', 'estrutura metalica leve'],
}

function tokenizeAndNormalize(q) {
  const base = normalize(q)
  const raw = base.split(' ').filter(Boolean)
  const tokens = raw
    .filter(t => !STOPWORDS.has(t))
    .map(singularizeToken)
  return { base, tokens }
}

function expandWithSynonyms(base) {
  const out = new Set([base])
  for (const [key, alts] of Object.entries(SYNONYMS)) {
    if (base.includes(key)) {
      out.add(key)
      for (const alt of alts) out.add(normalize(alt))
    }
  }
  return [...out]
}

function scoreProduct(product, queryTokens) {
  // fields to search
  const fields = [
    product.name,
    product.shortDescription,
    product.description,
    product.category,
    product.subcategory,
    product.brandName,
    product.sku,
  ]
  const text = normalize(fields.filter(Boolean).join(' '))
  if (!text) return 0
  let score = 0
  for (const t of queryTokens) {
    if (!t) continue
    if (text.includes(t)) score += 3 // full token
    // partial/fuzzy: allow 1 substitution within 5+ chars
    if (t.length >= 5) {
      const idx = text.indexOf(t.slice(0, Math.max(3, Math.floor(t.length * 0.6))))
      if (idx >= 0) score += 1
    }
  }
  return score
}

export function useSearch() {
  // Provide a single method for client-side fallback ranking
  const api = useMemo(() => ({
    async searchFallback(q, { limit = 9, brand = null, category = null, subcategory = null } = {}) {
      const { base, tokens } = tokenizeAndNormalize(q)
      if (tokens.length === 0) return []

      // Try a light server search first with relaxed name ilike using normalized base
      const patterns = expandWithSynonyms(base).map(s => `%${s}%`)
      try {
        let query = supabase.from('products').select('*').limit(300)
        // Apply filters if present
        if (brand) {
          query = query.or(`brand_slug.eq.${brand},brandName.eq.${brand}`)
        }
        if (category) query = query.eq('category', category)
        if (subcategory) query = query.eq('subcategory', subcategory)
        // Try multiple or(...) ilike on name/description; if fails we catch and continue
        try {
          const ilikes = patterns.map(p => `name.ilike.${p}`).join(',')
          query = query.or(ilikes)
        } catch (_) {}
        const { data, error } = await query
        const pool = (error || !Array.isArray(data)) ? [] : data
        if (pool.length > 0) {
          // Rank client-side
          const scored = pool
            .map(p => ({ ...p, _score: scoreProduct(p, tokens) }))
            .filter(p => p._score > 0)
            .sort((a, b) => b._score - a._score)
            .slice(0, limit)
          const slugs = scored.map(p => p.slug).filter(Boolean)
          return await fetchProductsBySlugs(slugs)
        }
      } catch (_) {
        // ignore and continue to heavy fallback
      }

      // Heavy fallback: fetch a pool then rank
      const { data: pool, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(400)
      if (error || !Array.isArray(pool) || pool.length === 0) return []

      const scored = pool
        .map(p => ({ ...p, _score: scoreProduct(p, tokens) }))
        .filter(p => p._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, limit)
      const slugs = scored.map(p => p.slug).filter(Boolean)
      return await fetchProductsBySlugs(slugs)
    }
  }), [])

  return api
}

export default useSearch

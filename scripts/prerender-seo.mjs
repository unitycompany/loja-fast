#!/usr/bin/env node
/*
  Prerender minimal static HTML for product pages with full SEO meta tags.
  Output: public/produto/<slug>/index.html (copied by Vite to dist)

  Data sources (in order):
  - Supabase (SERVICE ROLE) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
  - Local JSON file at src/data/products.json

  Configure site origin via env SITE_ORIGIN. Defaults to production domain.
*/

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const PRODUCTS_JSON = path.join(ROOT, 'src', 'data', 'products.json')

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://loja.fastsistemasconstrutivos.com.br'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEFAULT_OG_IMAGE = process.env.DEFAULT_OG_IMAGE || `${SITE_ORIGIN}/vite.svg`

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function stripHtml(html) {
  try { return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() } catch { return '' }
}

function absoluteUrl(urlOrPath) {
  if (!urlOrPath) return null
  try {
    if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath
    const clean = String(urlOrPath).replace(/^\//, '')
    return new URL(`/${clean}`, SITE_ORIGIN).toString()
  } catch { return null }
}

async function fetchFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return []
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await supabase
      .from('products')
      .select('slug, name, price, currency, description, shortDescription, images, image, brand, brandName, sku, gtin, mpn, availability, seo')
      .neq('slug', null)
      .limit(5000)
    if (error) throw error
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.warn('[prerender-seo] Supabase fetch failed, will fallback:', e?.message || e)
    return []
  }
}

function readLocalProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_JSON, 'utf-8')
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function firstImage(p) {
  const imgs = Array.isArray(p?.images) ? p.images
    : (p?.images && Array.isArray(p.images.url) ? p.images.url : null)
  const all = imgs || (p?.image ? [p.image] : [])
  const first = (all || []).find(Boolean)
  return first ? absoluteUrl(first) : null
}

function buildHead({ title, description, canonical, image, product }) {
  const desc = stripHtml(description).slice(0, 300)
  const price = product?.price
  const currency = product?.currency || 'BRL'
  const brand = product?.brand || product?.brandName

  return `
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />

    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Fast Sistemas Construtivos" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${image || DEFAULT_OG_IMAGE}" />
    ${brand ? `<meta property="product:brand" content="${escapeHtml(brand)}" />` : ''}
    ${price != null ? `<meta property="product:price:amount" content="${price}" />` : ''}
  <meta property="product:price:currency" content="${currency}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${image || DEFAULT_OG_IMAGE}" />

    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/vite.svg" type="image/svg+xml" />
  `
}

function buildJsonLd(p, canonical, image) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p?.name || '',
    image: image ? [image] : undefined,
    description: stripHtml(p?.shortDescription || p?.description || ''),
    sku: p?.sku,
    mpn: p?.mpn,
    brand: p?.brand || p?.brandName ? { '@type': 'Brand', name: p?.brand || p?.brandName } : undefined,
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: p?.currency || 'BRL',
      price: p?.price,
      availability: 'https://schema.org/InStock'
    }
  }
  const json = JSON.stringify(data)
  return `<script type="application/ld+json">${json}</script>`
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHtml({ head, jsonld }) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
${head}
    <meta name="theme-color" content="#0a3d62" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    ${jsonld}
  </body>
</html>`
}

async function main() {
  // Load products
  let products = await fetchFromSupabase()
  if (!products?.length) products = readLocalProducts()
  if (!products?.length) {
    console.warn('[prerender-seo] No products found. Skipping.')
    return
  }

  let count = 0
  for (const p of products) {
    if (!p?.slug) continue
    const canonical = `${SITE_ORIGIN}/produto/${p.slug}`
    const title = (p?.seo?.title || p?.name || 'Produto') + ' | Fast Sistemas Construtivos'
    const description = p?.seo?.description || p?.shortDescription || p?.description || ''
    const image = absoluteUrl(p?.seo?.ogImage) || firstImage(p)

    const head = buildHead({ title, description, canonical, image, product: p })
    const jsonld = buildJsonLd(p, canonical, image)
    const html = buildHtml({ head, jsonld })

    const outDir = path.join(PUBLIC_DIR, 'produto', p.slug)
    ensureDir(outDir)
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8')
    count++
  }

  console.log(`[prerender-seo] Wrote ${count} product pages to public/produto/*/index.html`)
}

main().catch((e) => { console.error('[prerender-seo] Failed:', e); process.exit(1) })

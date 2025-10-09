#!/usr/bin/env node
/*
	Generate sitemap.xml for GitHub Pages hosting.
	- Tries Supabase (SERVICE ROLE) to fetch latest products/categories
	- Falls back to local src/data/*.json when env not provided
	- Writes to public/sitemap.xml so Vite copies it to dist
*/

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const PUBLIC_DIR = path.join(ROOT, 'public')
const PRODUCTS_JSON = path.join(ROOT, 'src', 'data', 'products.json')
const CATEGORIES_JSON = path.join(ROOT, 'src', 'data', 'categories.json')

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://unitycompany.github.io'
const BASE_PATH = process.env.BASE_PATH || '/loja-fast/'
const BASE_URL = new URL(BASE_PATH, SITE_ORIGIN).toString()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function isoDate(d) {
	try { return new Date(d).toISOString() } catch { return new Date().toISOString() }
}

async function fetchFromSupabase() {
	const rows = { products: [], categories: [] }
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return rows
	try {
		const { createClient } = await import('@supabase/supabase-js')
		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
		// products: slug, updated_at, images
		const { data: p, error: pe } = await supabase
			.from('products')
			.select('slug, updated_at, images')
			.neq('slug', null)
			.limit(5000)
		if (pe) throw pe
		rows.products = Array.isArray(p) ? p : []
		// categories: slug, updated_at
		const { data: c, error: ce } = await supabase
			.from('categories')
			.select('slug, updated_at')
			.neq('slug', null)
			.limit(2000)
		if (ce) throw ce
		rows.categories = Array.isArray(c) ? c : []
	} catch (e) {
		console.warn('Sitemap: Supabase fetch failed, will fallback. Reason:', e?.message || e)
	}
	return rows
}

function readLocalJSON(file) {
	try {
		const raw = fs.readFileSync(file, 'utf-8')
		return JSON.parse(raw)
	} catch {
		return []
	}
}

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function absoluteUrl(pathnameOrUrl) {
	try {
		if (/^https?:\/\//i.test(pathnameOrUrl)) return pathnameOrUrl
		const clean = String(pathnameOrUrl || '').replace(/^\//, '')
		return new URL(clean, BASE_URL).toString()
	} catch { return BASE_URL }
}

function buildXML(urlset) {
	const header = `<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`
	const footer = `</urlset>\n`
		const items = urlset.map(u => {
		const lines = []
		lines.push('  <url>')
		lines.push(`    <loc>${u.loc}</loc>`) // required
		if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
		if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`)
		if (u.priority != null) lines.push(`    <priority>${u.priority}</priority>`)
		if (Array.isArray(u.images)) {
			for (const img of u.images) {
				if (!img) continue
				lines.push('    <image:image>')
					lines.push(`      <image:loc>${img}</image:loc>`)
				lines.push('    </image:image>')
			}
		}
		lines.push('  </url>')
		return lines.join('\n')
	}).join('\n')
	return header + items + '\n' + footer
}

async function main() {
	const urlset = []
	// Home
	urlset.push({
		loc: absoluteUrl('/'),
		lastmod: isoDate(new Date()),
		changefreq: 'weekly',
		priority: 1.0,
	})

	// Try Supabase first
	const { products: spProducts, categories: spCategories } = await fetchFromSupabase()
	let products = spProducts
	let categories = spCategories

	// Fallback to local JSON if needed
	if (!products?.length) {
		const localProducts = readLocalJSON(PRODUCTS_JSON)
		products = Array.isArray(localProducts)
			? localProducts.map(p => ({ slug: p.slug, updated_at: p.updated_at || null, images: p.images || [] }))
			: []
	}
	if (!categories?.length) {
		const localCats = readLocalJSON(CATEGORIES_JSON)
		categories = Array.isArray(localCats) ? localCats.map(c => ({ slug: c.slug, updated_at: c.updated_at || null })) : []
	}

	// Categories to /pesquisa?category=slug
	for (const c of categories) {
		if (!c?.slug) continue
		urlset.push({
			loc: absoluteUrl(`/pesquisa?category=${encodeURIComponent(c.slug)}`),
			lastmod: isoDate(c.updated_at || new Date()),
			changefreq: 'daily',
			priority: 0.7,
		})
	}

	// Products to /produto/slug (include first valid image if absolute)
	for (const p of products) {
		if (!p?.slug) continue
		let images = []
		const imgs = Array.isArray(p.images) ? p.images : (p.images && Array.isArray(p.images.url) ? p.images.url : [])
		if (Array.isArray(imgs)) {
			const first = imgs.find(i => i && typeof i === 'string')
			if (first) {
				if (/^https?:\/\//i.test(first)) images.push(first)
				else if (first.startsWith('/')) images.push(absoluteUrl(first))
			}
		}
		urlset.push({
			loc: absoluteUrl(`/produto/${p.slug}`),
			lastmod: isoDate(p.updated_at || new Date()),
			changefreq: 'daily',
			priority: 0.9,
			images
		})
	}

	ensureDir(PUBLIC_DIR)
	const xml = buildXML(urlset)
	const out = path.join(PUBLIC_DIR, 'sitemap.xml')
	fs.writeFileSync(out, xml, 'utf-8')
	console.log(`[sitemap] Wrote ${out} with ${urlset.length} urls`)
}

main().catch((e) => { console.error('sitemap generation failed:', e); process.exit(1) })


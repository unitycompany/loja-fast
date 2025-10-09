import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { readFile } from 'fs/promises'

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
    // ignore
  }
}

await loadDotEnvIfExists()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  const file = path.join(process.cwd(), 'src', 'data', 'brands.json')
  const raw = await readFile(file, 'utf8')
  const brands = JSON.parse(raw)
  console.log(`Importing ${brands.length} brands...`)

  for (const b of brands) {
    // Prepare payload mapping to brands table
    const safePayload = {
      name: b.companyName || b.name || null,
      slug: b.slug || (b.companyName ? b.companyName.toLowerCase().replace(/\s+/g, '-') : null),
      meta: {
        description: b.description || null,
        bgColor: b.bgColor || null
      },
      logo: b.imageCompany ? { public_url: b.imageCompany } : null
    }

    // If the provided id looks like a UUID, include it; otherwise skip (brands.id is uuid in schema)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (b.id && uuidRegex.test(b.id)) {
      safePayload.id = b.id
    }

    const { data: upserted, error } = await supabase.from('brands').upsert(safePayload, { onConflict: ['slug'], returning: 'representation' })
    if (error) {
      console.error('Upsert error for', b.slug || b.companyName, error.message || error)
      continue
    }

    const brandRecord = upserted && upserted[0] ? upserted[0] : null
    const brandId = brandRecord ? brandRecord.id : null
    console.log('Upserted brand', brandRecord ? `${brandRecord.name} (${brandId})` : b.slug)

    // If products table exists and products.brand contains names, link products.brand_id to this brand
    if (brandId) {
      const brandName = brandRecord?.name || safePayload.name
      const brandSlug = brandRecord?.slug || safePayload.slug

      // Try several matching strategies to find products referencing this brand
      let matched = []
      try {
        // 1) Match by brand->>name exactly
        const { data: byName, error: errName } = await supabase.from('products').select('id').eq("brand->>name", brandName)
        if (!errName && byName && byName.length) matched = byName.map(r => r.id)

        // 2) If none, match by brand->>slug
        if (!matched.length) {
          const { data: bySlug, error: errSlug } = await supabase.from('products').select('id').eq("brand->>slug", brandSlug)
          if (!errSlug && bySlug && bySlug.length) matched = bySlug.map(r => r.id)
        }

        // 3) If still none, match where brand is a plain string equal to name
        if (!matched.length) {
          const { data: byPlain, error: errPlain } = await supabase.from('products').select('id').eq('brand', brandName)
          if (!errPlain && byPlain && byPlain.length) matched = byPlain.map(r => r.id)
        }

        // Update matched products in batch
        if (matched.length) {
          // supabase-js supports .in for batching
          const { error: updateErr } = await supabase.from('products').update({ brand_id: brandId }).in('id', matched)
          if (updateErr) console.warn('Failed to update products brand_id for', brandName, updateErr)
          else console.log(`Linked ${matched.length} products to brand ${brandName}`)
        }
      } catch (e) {
        // ignore matching errors
      }
    }
  }

  // Recalculate number_products for each brand by counting products with brand_id
  console.log('Recalculating number_products for all brands...')
  // We'll fetch all brands and update counts
  const { data: allBrands, error: brandsErr } = await supabase.from('brands').select('id, slug')
  if (brandsErr) {
    console.error('Error fetching brands to recalc counts', brandsErr)
  } else {
    for (const br of allBrands) {
      const { data: rows, error: cntErr, count } = await supabase.from('products').select('id', { count: 'exact' }).eq('brand_id', br.id)
      if (cntErr) {
        console.warn('Count error for brand', br.slug, cntErr)
        continue
      }
      const number = typeof count === 'number' ? count : (rows ? rows.length : 0)
      // Using PostgREST/JS client: update brand
      const { error: up } = await supabase.from('brands').update({ number_products: number }).eq('id', br.id)
      if (up) console.warn('Failed update count for', br.slug, up)
      console.log(`Updated ${br.slug}: ${number}`)
    }
  }

  console.log('Brands import complete')
}

main().catch(err => { console.error(err); process.exit(1) })

/**
 * API endpoint para Google Merchant Center Product Feed
 * Retorna feed XML de produtos em formato RSS 2.0 com namespace g:
 * URL: /api/product-feed.xml
 */

import { createClient } from '@supabase/supabase-js'

const SITE_URL = process.env.VITE_SITE_URL || 'https://unitycompany.github.io/loja-fast'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

function escapeXml(unsafe) {
  if (!unsafe) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html) {
  if (!html) return ''
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatPrice(price, currency = 'BRL') {
  if (!price || isNaN(price)) return null
  return `${parseFloat(price).toFixed(2)} ${currency}`
}

function resolveImageUrl(product) {
  if (product.imageUrl && product.imageUrl.startsWith('http')) {
    return product.imageUrl
  }
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0]
    if (img.startsWith('http')) return img
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${img}`
  }
  
  return `${SITE_URL}/placeholder-product.jpg`
}

function mapAvailability(availability, stock) {
  if (stock !== undefined && stock !== null && stock <= 0) {
    return 'out_of_stock'
  }
  
  const normalizedAvail = String(availability || 'in_stock').toLowerCase()
  
  if (normalizedAvail.includes('in_stock') || normalizedAvail.includes('in stock')) {
    return 'in_stock'
  }
  if (normalizedAvail.includes('out_of_stock') || normalizedAvail.includes('out of stock')) {
    return 'out_of_stock'
  }
  if (normalizedAvail.includes('preorder') || normalizedAvail.includes('pre-order')) {
    return 'preorder'
  }
  
  return 'in_stock'
}

function mapCondition(condition) {
  const normalized = String(condition || 'new').toLowerCase()
  
  if (normalized.includes('new') || normalized.includes('novo')) return 'new'
  if (normalized.includes('refurbished') || normalized.includes('recondicionado')) return 'refurbished'
  if (normalized.includes('used') || normalized.includes('usado')) return 'used'
  
  return 'new'
}

function generateProductItem(product) {
  const id = product.id || product.slug || product.sku
  const title = escapeXml(product.name || 'Produto sem nome')
  const description = stripHtml(product.description || product.shortDescription || product.longDescription || '')
  const link = `${SITE_URL}/produto/${product.slug || id}`
  const imageLink = resolveImageUrl(product)
  const price = formatPrice(product.price, product.currency || 'BRL')
  const availability = mapAvailability(product.availability, product.stock)
  const condition = mapCondition(product.condition)
  const brand = escapeXml(product.brand || product.brandName || '')
  const gtin = product.gtin || product.ean || product.ean13 || ''
  const mpn = product.mpn || product.sku || ''
  const category = escapeXml(product.category || '')
  
  const limitedDescription = description.substring(0, 5000)

  return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${escapeXml(limitedDescription)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>${brand ? `
      <g:brand>${brand}</g:brand>` : ''}${gtin ? `
      <g:gtin>${escapeXml(gtin)}</g:gtin>` : ''}${mpn ? `
      <g:mpn>${escapeXml(mpn)}</g:mpn>` : ''}${category ? `
      <g:product_type>${category}</g:product_type>` : ''}
    </item>`
}

export default async function handler(req, res) {
  try {
    // Busca produtos do Supabase
    let products = []
    
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000) // Limite de produtos
      
      if (error) {
        console.error('Erro ao buscar produtos:', error)
      } else {
        products = data || []
      }
    }
    
    // Filtra produtos válidos
    const validProducts = products.filter(p => p.price && p.name)
    
    // Gera itens XML
    const items = validProducts.map(generateProductItem).join('\n')
    
    // Monta XML completo
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Loja Fast - Feed de Produtos</title>
    <link>${SITE_URL}</link>
    <description>Feed de produtos para Google Merchant Center</description>
${items}
  </channel>
</rss>`
    
    // Define headers corretos
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.status(200).send(xml)
    
  } catch (error) {
    console.error('Erro ao gerar feed:', error)
    res.status(500).send('Erro ao gerar feed de produtos')
  }
}

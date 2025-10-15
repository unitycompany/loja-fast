#!/usr/bin/env node
/**
 * Gera o feed de produtos para Google Merchant Center em formato XML (RSS 2.0 + namespace g:)
 * Compatível com a especificação: https://support.google.com/merchants/answer/7052112
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurações
const SITE_URL = process.env.VITE_SITE_URL || 'https://unitycompany.github.io/loja-fast'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

// Fallback para dados locais se Supabase não estiver configurado
const useLocal = !SUPABASE_URL || !SUPABASE_ANON_KEY

let supabase
if (!useLocal) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Remove HTML tags from description
 */
function stripHtml(html) {
  if (!html) return ''
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Formata preço no padrão do Google Merchant (ex: 25.90 BRL)
 */
function formatPrice(price, currency = 'BRL') {
  if (!price || isNaN(price)) return null
  return `${parseFloat(price).toFixed(2)} ${currency}`
}

/**
 * Resolve URL da imagem do produto
 */
function resolveImageUrl(product) {
  // Se tem URL completa, usa ela
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.startsWith('http')) {
    return product.imageUrl
  }
  
  // Se tem imagem no Supabase storage
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0]
    
    // Verifica se é string antes de usar startsWith
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img
      return `${SUPABASE_URL || SITE_URL}/storage/v1/object/public/product-images/${img}`
    }
    
    // Se for objeto com propriedade url ou src
    if (img && typeof img === 'object') {
      const imgUrl = img.url || img.src || img.path
      if (imgUrl && typeof imgUrl === 'string') {
        if (imgUrl.startsWith('http')) return imgUrl
        return `${SUPABASE_URL || SITE_URL}/storage/v1/object/public/product-images/${imgUrl}`
      }
    }
  }
  
  // Imagem padrão ou placeholder
  return `${SITE_URL}/placeholder-product.jpg`
}

/**
 * Mapeia availability para formato Google Merchant
 */
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
  
  return 'in_stock' // padrão
}

/**
 * Mapeia condition para formato Google Merchant
 */
function mapCondition(condition) {
  const normalized = String(condition || 'new').toLowerCase()
  
  if (normalized.includes('new') || normalized.includes('novo')) return 'new'
  if (normalized.includes('refurbished') || normalized.includes('recondicionado')) return 'refurbished'
  if (normalized.includes('used') || normalized.includes('usado')) return 'used'
  
  return 'new' // padrão
}

/**
 * Busca produtos do Supabase
 */
async function fetchProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar produtos do Supabase:', error)
    return []
  }
}

/**
 * Busca produtos do arquivo local
 */
function fetchProductsFromLocal() {
  try {
    const productsPath = path.join(__dirname, '../src/data/products.json')
    const data = fs.readFileSync(productsPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao ler produtos.json:', error)
    return []
  }
}

/**
 * Gera o item XML para um produto
 */
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
  
  // Limita descrição a 5000 caracteres (limite do Google)
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

/**
 * Gera o feed XML completo
 */
async function generateFeed() {
  console.log('🚀 Gerando feed de produtos para Google Merchant Center...')
  
  // Busca produtos
  const products = useLocal 
    ? fetchProductsFromLocal() 
    : await fetchProductsFromSupabase()
  
  console.log(`📦 ${products.length} produtos encontrados`)
  
  if (products.length === 0) {
    console.warn('⚠️  Nenhum produto encontrado!')
  }
  
  // Filtra apenas produtos válidos (com preço e nome)
  const validProducts = products.filter(p => p.price && p.name)
  console.log(`✅ ${validProducts.length} produtos válidos`)
  
  // Gera os itens XML
  const items = validProducts.map(generateProductItem).join('\n')
  
  // Monta o XML completo
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Loja Fast - Feed de Produtos</title>
    <link>${SITE_URL}</link>
    <description>Feed de produtos para Google Merchant Center</description>
${items}
  </channel>
</rss>`
  
  // Salva o arquivo
  const outputPath = path.join(__dirname, '../public/product-feed.xml')
  fs.writeFileSync(outputPath, xml, 'utf-8')
  
  console.log(`✨ Feed gerado com sucesso: ${outputPath}`)
  console.log(`🔗 URL do feed: ${SITE_URL}/product-feed.xml`)
}

// Executa
generateFeed().catch(error => {
  console.error('❌ Erro ao gerar feed:', error)
  process.exit(1)
})

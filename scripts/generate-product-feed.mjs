#!/usr/bin/env node
/**
 * Gera o feed de produtos para Google Merchant Center em formato XML (RSS 2.0 + namespace g:)
 * Compatível com a especificação: https://support.google.com/merchants/answer/7052112
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createMerchantFeed } from '../shared/merchant-feed.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_BUCKET = process.env.MERCHANT_SUPABASE_BUCKET || 'product-images'

const useLocal = !SUPABASE_URL || !SUPABASE_ANON_KEY

let supabase
if (!useLocal) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
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

  const feed = createMerchantFeed(products, {
    siteUrl: process.env.VITE_SITE_URL || process.env.SITE_URL,
    supabaseUrl: SUPABASE_URL,
    supabaseBucket: SUPABASE_BUCKET,
    defaultImageUrl: process.env.MERCHANT_DEFAULT_IMAGE_URL,
    defaultShippingCountry: process.env.MERCHANT_DEFAULT_SHIPPING_COUNTRY,
    defaultShippingService: process.env.MERCHANT_DEFAULT_SHIPPING_SERVICE,
    defaultShippingPriceValue: process.env.MERCHANT_DEFAULT_SHIPPING_PRICE ?? process.env.VITE_DEFAULT_SHIPPING_PRICE,
    quotePriceValue: process.env.MERCHANT_QUOTE_PRICE ?? process.env.VITE_QUOTE_PRICE,
    quoteAvailability: process.env.MERCHANT_QUOTE_AVAILABILITY,
    quoteLabel: process.env.MERCHANT_QUOTE_LABEL,
    quoteLabelIndex: process.env.MERCHANT_QUOTE_LABEL_INDEX,
  })

  console.log(`✅ ${feed.stats.valid} produtos válidos (ignorados: ${feed.stats.skipped})`)

  if (feed.warnings.length) {
    for (const warning of feed.warnings) {
      console.warn(`⚠️  [feed] ${warning.code}: ${warning.message}${warning.ref ? ` (${warning.ref})` : ''}`)
    }
  }

  const outputPath = path.join(__dirname, '../public/product-feed.xml')
  fs.writeFileSync(outputPath, feed.xml, 'utf-8')

  console.log(`✨ Feed gerado com sucesso: ${outputPath}`)
  console.log(`🔗 URL do feed: ${feed.settings.siteUrl}/product-feed.xml`)
}

// Executa
generateFeed().catch(error => {
  console.error('❌ Erro ao gerar feed:', error)
  process.exit(1)
})

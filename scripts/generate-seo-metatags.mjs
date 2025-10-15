#!/usr/bin/env node
/**
 * Script para adicionar/atualizar meta tags SEO em produtos do Supabase
 * Gera automaticamente meta tags otimizadas para produtos que não têm
 * 
 * Uso:
 *   node scripts/generate-seo-metatags.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessários no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Função para limpar e truncar texto
function truncate(text, maxLength) {
  if (!text) return ''
  const clean = String(text).trim()
  if (clean.length <= maxLength) return clean
  return clean.substring(0, maxLength - 3) + '...'
}

// Função para gerar meta tags SEO automaticamente
function generateSeoMetaTags(product) {
  const origin = 'https://loja-fast.vercel.app' // Ajuste para seu domínio
  
  // Meta Title: Nome do produto + Marca (se existir) - máx 60 caracteres
  let metaTitle = product.name || ''
  if (product.brandName && !metaTitle.includes(product.brandName)) {
    metaTitle = `${metaTitle} ${product.brandName}`
  }
  metaTitle = truncate(metaTitle, 60)
  
  // Meta Description: Descrição curta + categoria - máx 160 caracteres
  let metaDescription = product.shortdescription || product.description || ''
  if (product.category && !metaDescription.toLowerCase().includes(product.category.toLowerCase())) {
    metaDescription = `${metaDescription}. Categoria: ${product.category}`
  }
  metaDescription = truncate(metaDescription, 160)
  
  // Canonical URL
  const canonicalUrl = product.slug ? `${origin}/produto/${product.slug}` : null
  
  // Open Graph Image: primeira imagem do produto
  let ogImage = null
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    ogImage = product.images[0]?.url || product.images[0] || null
  }
  
  // Keywords: combina termos de busca, marca, categoria
  const keywords = [
    product.brandName,
    product.category,
    product.subcategory,
    ...(product.search_terms || [])
  ].filter(Boolean)
  
  return {
    title: metaTitle,
    meta_title: metaTitle,
    description: metaDescription,
    meta_description: metaDescription,
    canonical_url: canonicalUrl,
    canonicalUrl: canonicalUrl,
    og_title: metaTitle,
    ogTitle: metaTitle,
    og_description: metaDescription,
    ogDescription: metaDescription,
    og_image: ogImage,
    ogImage: ogImage,
    og_type: 'product',
    ogType: 'product',
    image_alt: `${product.name}${product.brandName ? ` ${product.brandName}` : ''}`,
    imageAlt: `${product.name}${product.brandName ? ` ${product.brandName}` : ''}`,
    twitter_card: 'summary_large_image',
    twitterCard: 'summary_large_image',
    twitter_title: metaTitle,
    twitterTitle: metaTitle,
    twitter_description: metaDescription,
    twitterDescription: metaDescription,
    twitter_image: ogImage,
    twitterImage: ogImage,
    keywords: keywords,
    search_terms: keywords,
    noindex: false
  }
}

async function main() {
  console.log('🔍 Buscando produtos sem meta tags SEO...\n')
  
  // Busca produtos que não têm campo SEO ou têm SEO vazio
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .or('seo.is.null,seo.eq.{}')
    .limit(1000)
  
  if (error) {
    console.error('❌ Erro ao buscar produtos:', error)
    return
  }
  
  if (!products || products.length === 0) {
    console.log('✅ Todos os produtos já têm meta tags SEO!')
    return
  }
  
  console.log(`📦 Encontrados ${products.length} produtos sem meta tags SEO\n`)
  
  let updated = 0
  let failed = 0
  
  for (const product of products) {
    try {
      const seoMetaTags = generateSeoMetaTags(product)
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ seo: seoMetaTags })
        .eq('id', product.id)
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar produto ${product.slug}:`, updateError.message)
        failed++
      } else {
        console.log(`✅ Meta tags geradas para: ${product.name} (${product.slug})`)
        updated++
      }
      
      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (err) {
      console.error(`❌ Erro ao processar produto ${product.slug}:`, err.message)
      failed++
    }
  }
  
  console.log(`\n📊 Resumo:`)
  console.log(`   ✅ Atualizados: ${updated}`)
  console.log(`   ❌ Falhas: ${failed}`)
  console.log(`   📦 Total: ${products.length}`)
}

main().catch(console.error)

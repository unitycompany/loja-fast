#!/usr/bin/env node
/**
 * Gera páginas HTML pré-renderizadas para produtos principais
 * Isso permite que o WhatsApp/Facebook leiam as meta tags corretas
 */

import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carrega variáveis de ambiente do .env
dotenv.config({ path: join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SITE_URL = process.env.VITE_SITE_URL || 'https://loja-fast.vercel.app'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessários no .env')
  console.error('⚠️  Pulando pré-renderização de produtos...')
  process.exit(0) // Exit com sucesso para não quebrar o build
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function generateProductHTML(product, template) {
  const seo = product.seo || {}
  
  const title = seo.title || product.name || 'Produto'
  const description = (seo.description || product.shortdescription || 'Produto de qualidade').replace(/"/g, '&quot;')
  const canonicalUrl = `${SITE_URL}/produto/${product.slug}`
  
  let ogImage = seo.ogImage || seo.og_image || (product.images?.[0]?.url || product.images?.[0])
  if (ogImage && !ogImage.startsWith('http')) {
    ogImage = `${SUPABASE_URL}/storage/v1/object/public/${ogImage}`
  }

  const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    
    <!-- Open Graph -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage || ''}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Fast Sistemas Construtivos" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage || ''}" />
    
    <!-- Product Info -->
    ${product.brandName ? `<meta property="product:brand" content="${product.brandName}" />` : ''}
    ${product.price ? `<meta property="product:price:amount" content="${product.price}" />` : ''}
    <meta property="product:price:currency" content="${product.currency || 'BRL'}" />
    <meta property="product:availability" content="${product.availability || 'in stock'}" />
  `

  return template.replace(
    /<title>.*?<\/title>/s,
    metaTags
  )
}

async function main() {
  console.log('🔄 Gerando páginas HTML pré-renderizadas...\n')

  // Lê o template HTML base
  const distPath = join(__dirname, '../dist')
  const templatePath = join(distPath, 'index.html')
  const template = await readFile(templatePath, 'utf-8')

  // Busca os 50 produtos mais importantes
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('❌ Erro ao buscar produtos:', error)
    return
  }

  console.log(`📦 Gerando HTML para ${products.length} produtos...\n`)

  let generated = 0
  for (const product of products) {
    try {
      const html = await generateProductHTML(product, template)
      const outputDir = join(distPath, 'produto', product.slug)
      await mkdir(outputDir, { recursive: true })
      await writeFile(join(outputDir, 'index.html'), html, 'utf-8')
      console.log(`✅ ${product.slug}`)
      generated++
    } catch (err) {
      console.error(`❌ Erro ao gerar ${product.slug}:`, err.message)
    }
  }

  console.log(`\n✅ ${generated} páginas geradas com sucesso!`)
  console.log('\n📝 Para atualizar meta tags no WhatsApp/Facebook:')
  console.log('   1. Facebook: https://developers.facebook.com/tools/debug/')
  console.log('   2. LinkedIn: https://www.linkedin.com/post-inspector/')
  console.log('   Cole a URL do produto e clique em "Scrape Again" ou "Inspect"')
}

main().catch(console.error)

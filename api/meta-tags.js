import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

export const config = {
  runtime: 'edge',
  regions: ['gru1'], // São Paulo
}

export default async function handler(request) {
  const url = new URL(request.url)
  
  // Se não for uma página de produto, retorna o index.html normal
  if (!url.pathname.startsWith('/produto/')) {
    return fetch(new URL('/index.html', url.origin))
  }

  try {
    // Extrai o slug do produto da URL
    const slug = url.pathname.replace('/produto/', '')
    
    // Busca o produto no Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!product) {
      return fetch(new URL('/index.html', url.origin))
    }

    // Extrai dados SEO
    const seo = product.seo || {}
    const title = seo.title || product.name || 'Produto'
    const description = seo.description || product.shortdescription || 'Produto de qualidade'
    const canonicalUrl = `${url.origin}/produto/${slug}`
    
    // Resolve URL da imagem
    let ogImage = seo.ogImage || seo.og_image || (product.images?.[0]?.url || product.images?.[0])
    if (ogImage && !ogImage.startsWith('http')) {
      ogImage = `${SUPABASE_URL}/storage/v1/object/public/${ogImage}`
    }

    // Busca o HTML base
    const baseHtml = await fetch(new URL('/index.html', url.origin)).then(r => r.text())

    // Injeta as meta tags específicas do produto
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

    // Injeta as meta tags no head (substitui as meta tags padrão)
    const htmlWithMeta = baseHtml.replace(
      /<title>.*?<\/title>/,
      metaTags
    )

    return new Response(htmlWithMeta, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating meta tags:', error)
    return fetch(new URL('/index.html', url.origin))
  }
}

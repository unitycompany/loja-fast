// Helpers to build consistent SEO data objects across pages

export function buildProductSeo({ product, selection }){
	// selection: { unit, measure, price }
	
	// Extrai dados SEO do produto (vindos do Supabase)
	const seo = product?.seo || {}
	
	// Debug: log para verificar se o produto tem meta tags
	console.log('🔍 SEO Debug:', {
		productName: product?.name,
		hasSeoField: !!product?.seo,
		seoKeys: Object.keys(seo),
		seoTitle: seo.title || seo.meta_title,
		seoDescription: seo.description || seo.meta_description,
		seoImage: seo.og_image || seo.ogImage
	})
	
	// Title: prioriza seo.title, depois seo.meta_title, depois nome do produto
	const titleBase = seo.title || seo.meta_title || seo.metaTitle || product?.name || ''
	const parts = [titleBase]
	if (selection?.unit?.label) parts.push(selection.unit.label)
	if (selection?.measure?.label) parts.push(selection.measure.label)
	let title = parts.join(' | ')
	
	// Não adiciona sufixo se o título já for completo (mais de 50 caracteres indica título já otimizado)
	// Ou se já contém "Fast Sistemas"
	if (title && !title.includes('Fast Sistemas') && title.length < 50) {
		title = `${title} | Fast Sistemas Construtivos`
	}

	// Description: prioriza seo.description, depois seo.meta_description
	const description = seo.description || seo.meta_description || seo.metaDescription || product?.shortDescription || product?.description || ''
	
	// URL: prioriza seo.canonical_url ou seo.canonicalUrl
	const origin = (typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.origin) ? globalThis.location.origin : ''
	const canonicalUrl = seo.canonical_url || seo.canonicalUrl || (product?.slug ? `${origin}/produto/${product.slug}` : undefined)
	
	// Open Graph Image: prioriza seo.og_image, depois seo.ogImage, depois primeira imagem
	let ogImage = seo.og_image || seo.ogImage || seo.image || (product?.images?.[0]?.url || product?.images?.[0] || product?.image)
	
	// Se a imagem for um caminho relativo (do Supabase Storage), converte para URL completa
	if (ogImage && !ogImage.startsWith('http')) {
		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
		if (supabaseUrl) {
			ogImage = `${supabaseUrl}/storage/v1/object/public/${ogImage}`
		}
	}
	
	// Open Graph específicos do produto (se existirem no objeto seo)
	const ogTitle = seo.og_title || seo.ogTitle || title
	const ogDescription = seo.og_description || seo.ogDescription || description
	const ogType = seo.og_type || seo.ogType || 'product'
	
	// Twitter Card
	const twitterCard = seo.twitter_card || seo.twitterCard || 'summary_large_image'
	const twitterTitle = seo.twitter_title || seo.twitterTitle || title
	const twitterDescription = seo.twitter_description || seo.twitterDescription || description
	const twitterImage = seo.twitter_image || seo.twitterImage || ogImage

	const price = selection?.price ?? product?.price
	const currency = product?.currency || 'BRL'
	const availability = (product?.availability === 'in_stock') ? 'in stock' : (product?.availability || 'in stock')
	const condition = product?.condition || 'new'

	// Build identifiers
	const baseSku = product?.sku
	const sku = (() => {
		const us = selection?.unit?.sku
		const ms = selection?.measure?.sku
		if (us && ms) return `${baseSku}-${us}-${ms}`
		if (us) return `${baseSku}-${us}`
		if (ms) return `${baseSku}-${ms}`
		return baseSku
	})()
	const gtin = selection?.unit?.gtin || selection?.measure?.gtin || product?.gtin
	const mpn = selection?.unit?.mpn || selection?.measure?.mpn || product?.mpn

	// Keywords: combina metaKeywords do SEO + searchTerms do produto + outros
	const seoKeywords = seo.keywords || seo.metaKeywords || seo.meta_keywords || seo.search_terms || seo.searchTerms || []
	const keywords = Array.from(new Set([
		...(Array.isArray(seoKeywords) ? seoKeywords : (typeof seoKeywords === 'string' ? seoKeywords.split(',').map(k => k.trim()) : [])),
		...(product?.searchTerms || []),
		product?.brandName,
		product?.category,
		selection?.unit?.key,
		selection?.unit?.label,
		selection?.measure?.id,
		selection?.measure?.label
	].filter(Boolean)))

	const finalResult = {
		title,
		description,
		canonicalUrl,
		image: ogImage,
		imageAlt: seo.image_alt || seo.imageAlt || product?.name,
		noindex: seo.noindex || false,
		keywords,
		type: 'product',
		openGraph: {
			'og:title': ogTitle,
			'og:description': ogDescription,
			'og:type': ogType,
		},
		twitter: {
			card: twitterCard,
			title: twitterTitle,
			description: twitterDescription,
			image: twitterImage,
		},
		product: { 
			price, 
			currency, 
			availability, 
			condition, 
			sku, 
			gtin, 
			mpn, 
			brand: product?.brandName 
		}
	}
	
	// Debug: log resultado final
	console.log('✅ SEO Resultado Final:', {
		title: finalResult.title,
		description: finalResult.description?.substring(0, 100) + '...',
		canonicalUrl: finalResult.canonicalUrl,
		image: finalResult.image,
		ogTitle: finalResult.openGraph['og:title'],
		twitterCard: finalResult.twitter.card
	})
	
	return finalResult
}

export function buildCategorySeo({ name, slug, description, image }){
		const title = name ? `${name} | Fast Sistemas Construtivos` : 'Produtos | Fast Sistemas Construtivos'
		const origin = (typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.origin) ? globalThis.location.origin : ''
		const canonicalUrl = slug ? `${origin}/search?category=${encodeURIComponent(slug)}` : undefined
	return {
		title,
		description: description || 'Veja produtos, preços e disponibilidade',
		canonicalUrl,
		image,
		type: 'website'
	}
}


// Helpers to build consistent SEO data objects across pages

export function buildProductSeo({ product, selection }){
	// selection: { unit, measure, price }
	const titleBase = product?.seo?.title || product?.name || ''
	const parts = [titleBase]
	if (selection?.unit?.label) parts.push(selection.unit.label)
	if (selection?.measure?.label) parts.push(selection.measure.label)
	const title = parts.join(' | ')

	const description = product?.seo?.description || product?.shortDescription || product?.description || ''
		const origin = (typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.origin) ? globalThis.location.origin : ''
		const canonicalUrl = product?.seo?.canonicalUrl || (product?.slug ? `${origin}/produto/${product.slug}` : undefined)
	const ogImage = product?.seo?.ogImage || (product?.images?.[0]?.url || product?.images?.[0] || product?.image)

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

	const keywords = Array.from(new Set([
		...(product?.searchTerms || []),
		product?.brandName,
		product?.category,
		selection?.unit?.key,
		selection?.unit?.label,
		selection?.measure?.id,
		selection?.measure?.label
	].filter(Boolean)))

	return {
		title,
		description,
		canonicalUrl,
		image: ogImage,
		noindex: false,
		keywords,
		type: 'product',
		openGraph: {},
		twitter: {},
		product: { price, currency, availability, condition, sku, gtin, mpn, brand: product?.brandName }
	}
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


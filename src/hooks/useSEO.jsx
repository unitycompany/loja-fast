import { useMemo } from 'react'

/**
 * Hook para gerar dados de SEO de forma consistente
 * @param {Object} options - Opções para configuração do SEO
 * @returns {Object} Dados de SEO formatados
 */
export function useSEO(options = {}) {
	const {
		title,
		description,
		path = '',
		image,
		type = 'website',
		keywords = [],
		noindex = false,
		product = null,
		category = null,
		brand = null,
	} = options

	const origin = typeof window !== 'undefined' ? window.location.origin : ''
	const canonicalUrl = `${origin}${path}`

	return useMemo(() => {
		const siteName = 'Fast Sistemas Construtivos'
		
		// Build dynamic title
		let fullTitle = title || siteName
		if (title && !title.includes(siteName)) {
			fullTitle = `${title} | ${siteName}`
		}

		// Build description
		const fullDescription = description || 'Encontre os melhores produtos para construção civil. Argamassas, impermeabilizantes, aditivos, ferramentas e muito mais.'

		// Build keywords array
		const allKeywords = [
			...keywords,
			'materiais de construção',
			'construção civil',
			'Fast Sistemas Construtivos'
		].filter(Boolean)

		// Build image URL
		const imageUrl = image || `${origin}/og-default.jpg`

		// Build product data if available
		let productData = null
		if (product) {
			productData = {
				brand: product.brand || product.brandName,
				price: product.price,
				currency: product.currency || 'BRL',
				availability: product.availability || 'in stock',
				condition: product.condition || 'new',
				sku: product.sku,
				gtin: product.gtin,
				mpn: product.mpn,
			}
		}

		return {
			title: fullTitle,
			description: fullDescription,
			canonicalUrl,
			image: imageUrl,
			type,
			keywords: allKeywords,
			noindex,
			product: productData,
			siteName,
		}
	}, [title, description, path, image, type, JSON.stringify(keywords), noindex, product, category, brand, origin])
}

/**
 * Hook para gerar Schema.org JSON-LD
 */
export function useSchema(type, data) {
	return useMemo(() => {
		const origin = typeof window !== 'undefined' ? window.location.origin : ''

		switch (type) {
			case 'WebSite':
				return {
					"@context": "https://schema.org",
					"@type": "WebSite",
					"name": "Fast Sistemas Construtivos",
					"url": origin,
					"potentialAction": {
						"@type": "SearchAction",
						"target": `${origin}/search?q={search_term_string}`,
						"query-input": "required name=search_term_string"
					}
				}

			case 'Organization':
				return {
					"@context": "https://schema.org",
					"@type": "Organization",
					"name": "Fast Sistemas Construtivos",
					"url": origin,
					"logo": `${origin}/logo.png`,
					"sameAs": []
				}

			case 'BreadcrumbList':
				return {
					"@context": "https://schema.org",
					"@type": "BreadcrumbList",
					"itemListElement": (data?.items || []).map((item, index) => ({
						"@type": "ListItem",
						"position": index + 1,
						"name": item.name,
						"item": item.url
					}))
				}

			case 'Product':
				return {
					"@context": "https://schema.org",
					"@type": "Product",
					"name": data?.name,
					"image": data?.image,
					"description": data?.description,
					"brand": {
						"@type": "Brand",
						"name": data?.brand
					},
					"offers": {
						"@type": "Offer",
						"price": data?.price,
						"priceCurrency": data?.currency || "BRL",
						"availability": data?.availability ? `https://schema.org/${data.availability.replace(' ', '')}` : "https://schema.org/InStock",
						"itemCondition": "https://schema.org/NewCondition"
					}
				}

			default:
				return null
		}
	}, [type, JSON.stringify(data)])
}

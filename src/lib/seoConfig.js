/**
 * Configurações de SEO por rota
 * Este arquivo centraliza todas as estratégias de SEO do site
 */

export const SITE_CONFIG = {
	name: 'Fast Sistemas Construtivos',
	tagline: 'Materiais de Construção e Sistemas Construtivos',
	description: 'Encontre os melhores produtos para construção civil. Argamassas, impermeabilizantes, drywall, steel frame, forros, telhas e muito mais.',
	url: 'https://loja-fast.vercel.app',
	logo: '/logo.png',
	locale: 'pt_BR',
	type: 'website',
	twitterHandle: '@fastsistemas',
	facebookAppId: '',
}

export const ROUTE_SEO = {
	home: {
		path: '/',
		title: 'Fast Sistemas Construtivos | Materiais de Construção e Sistemas Construtivos',
		description: 'Encontre os melhores produtos para construção civil. Argamassas, impermeabilizantes, drywall, steel frame, forros, acessórios e ferramentas. Qualidade, variedade e preço justo.',
		keywords: [
			'materiais de construção',
			'sistemas construtivos',
			'drywall',
			'steel frame',
			'argamassa',
			'impermeabilizante',
			'forro removível',
			'forro de gesso',
			'forro pvc',
			'telhas',
			'construção civil',
			'acabamento',
			'ferramentas',
			'acessórios construção',
		],
		schema: 'WebSite',
	},
	pesquisa: {
		path: '/pesquisa',
		title: 'Buscar Produtos | Fast Sistemas Construtivos',
		description: 'Navegue por nosso catálogo completo de produtos para construção. Filtre por categoria, marca, preço e encontre exatamente o que precisa.',
		keywords: [
			'busca produtos',
			'catálogo construção',
			'pesquisar materiais',
			'filtrar produtos',
			'encontrar produtos',
		],
		schema: 'SearchResultsPage',
	},
	produto: {
		path: '/produto/:slug',
		title: '{productName} | Fast Sistemas Construtivos',
		description: '{productDescription}',
		keywords: [], // Dinâmico por produto
		schema: 'Product',
	},
	orcamento: {
		path: '/orcamento',
		title: 'Orçamento | Solicite seu Orçamento | Fast Sistemas Construtivos',
		description: 'Revise seus produtos selecionados e solicite um orçamento personalizado. Atendimento rápido, preços competitivos e entrega para todo Brasil.',
		keywords: [
			'orçamento construção',
			'solicitar orçamento',
			'pedido orçamento',
			'cotação materiais',
			'preço materiais construção',
		],
		noindex: true,
		schema: null,
	},
	favoritos: {
		path: '/favoritos',
		title: 'Meus Favoritos | Lista de Desejos | Fast Sistemas Construtivos',
		description: 'Seus produtos favoritos salvos para compra futura. Organize sua lista de materiais de construção e compare preços.',
		keywords: [
			'lista desejos',
			'favoritos',
			'produtos salvos',
			'wishlist',
		],
		noindex: true,
		schema: null,
	},
	admin: {
		path: '/admin',
		title: 'Painel Administrativo | Fast Sistemas Construtivos',
		description: 'Área administrativa',
		keywords: [],
		noindex: true,
		schema: null,
	},
}

// Keywords por categoria (para busca por categoria)
export const CATEGORY_KEYWORDS = {
	'drywall': [
		'gesso acartonado',
		'parede drywall',
		'forro drywall',
		'placa drywall',
		'perfil drywall',
		'montante',
		'guia',
		'parafuso drywall',
		'massa drywall',
		'fita drywall',
		'sistema light steel',
	],
	'steel-frame': [
		'steel frame',
		'estrutura metálica',
		'perfil estrutural',
		'montante steel',
		'guia steel',
		'steel framing',
		'construção metálica',
		'lsf',
		'light steel frame',
	],
	'forros-removiveis': [
		'forro removível',
		'forro modular',
		'placa forro',
		'perfil t',
		'travessa',
		'cantoneira',
		'forro suspenso',
		'forro falso',
		'sistema armstrong',
	],
	'argamassas-impermeabilizantes': [
		'argamassa',
		'argamassa colante',
		'argamassa ac1',
		'argamassa ac2',
		'argamassa ac3',
		'rejunte',
		'impermeabilizante',
		'manta líquida',
		'vedapren',
		'silicone',
		'massa corrida',
	],
	'pisos': [
		'piso vinílico',
		'piso laminado',
		'piso cerâmico',
		'piso porcelanato',
		'rodapé',
		'soleira',
		'acabamento piso',
	],
	'telhados': [
		'telha',
		'telha metálica',
		'telha galvanizada',
		'telha galvalume',
		'telha sandwich',
		'telha colonial',
		'calha',
		'rufo',
		'cumeeira',
	],
	'ferramentas': [
		'ferramenta construção',
		'parafuso',
		'bucha',
		'prego',
		'chumbador',
		'furadeira',
		'serra',
		'alicate',
		'martelo',
		'espátula',
		'desempenadeira',
	],
	'acustica': [
		'isolamento acústico',
		'tratamento acústico',
		'lã mineral',
		'lã de vidro',
		'lã de rocha',
		'isover',
		'ecophon',
		'painel acústico',
	],
	'pvc': [
		'forro pvc',
		'painel pvc',
		'régua pvc',
		'rodaforro pvc',
		'acabamento pvc',
	],
}

// Keywords por marca (para busca por marca)
export const BRAND_KEYWORDS = {
	'knauf': ['placo', 'drywall knauf', 'gesso knauf', 'qualidade alemã'],
	'quartzolit': ['argamassa quartzolit', 'rejunte quartzolit', 'weber', 'saint-gobain'],
	'brasilit': ['telha brasilit', 'eternit', 'fibrocimento'],
	'isover': ['lã de vidro', 'isolamento térmico', 'isolamento acústico', 'saint-gobain'],
	'ecophon': ['forro acústico', 'absorção sonora', 'saint-gobain'],
	'armstrong': ['forro armstrong', 'forro comercial', 'ceiling'],
	'gyprex': ['drywall gyprex', 'placa gesso'],
	'ourofix': ['parafuso ourofix', 'fixação'],
	'biancogress': ['porcelanato', 'revestimento'],
}

/**
 * Gera dados SEO para categoria
 */
export function getCategorySEO(categorySlug, categoryName, subcategory = null) {
	const keywords = CATEGORY_KEYWORDS[categorySlug] || []
	const title = subcategory
		? `${subcategory} em ${categoryName} | Fast Sistemas Construtivos`
		: `${categoryName} | Produtos e Materiais | Fast Sistemas Construtivos`
	
	const description = subcategory
		? `Encontre ${subcategory.toLowerCase()} em ${categoryName.toLowerCase()}. Variedade, qualidade e melhor preço. Entrega para todo Brasil.`
		: `Navegue por produtos de ${categoryName.toLowerCase()}. ${keywords.slice(0, 5).join(', ')}. Qualidade garantida e preços competitivos.`

	return {
		title,
		description,
		keywords: [...keywords, categoryName, subcategory].filter(Boolean),
		type: 'website',
		canonicalUrl: `${SITE_CONFIG.url}/pesquisa?category=${encodeURIComponent(categorySlug)}`,
	}
}

/**
 * Gera dados SEO para marca
 */
export function getBrandSEO(brandSlug, brandName) {
	const keywords = BRAND_KEYWORDS[brandSlug.toLowerCase()] || []
	const title = `${brandName} | Produtos e Materiais | Fast Sistemas Construtivos`
	const description = `Produtos da marca ${brandName}. ${keywords.slice(0, 5).join(', ')}. Qualidade garantida, preços competitivos e entrega rápida.`

	return {
		title,
		description,
		keywords: [...keywords, brandName, `produtos ${brandName}`, `comprar ${brandName}`],
		type: 'website',
		canonicalUrl: `${SITE_CONFIG.url}/pesquisa?brand=${encodeURIComponent(brandSlug)}`,
	}
}

/**
 * Gera dados SEO para busca por termo
 */
export function getSearchSEO(searchTerm) {
	const title = `Busca: ${searchTerm} | Fast Sistemas Construtivos`
	const description = `Resultados de busca para "${searchTerm}". Encontre produtos de construção, compare preços e solicite orçamento.`

	return {
		title,
		description,
		keywords: [searchTerm, 'busca', 'produtos', 'construção'],
		type: 'website',
		canonicalUrl: `${SITE_CONFIG.url}/pesquisa?q=${encodeURIComponent(searchTerm)}`,
	}
}

/**
 * Gera Schema.org baseado no tipo
 */
export function generateSchema(type, data = {}) {
	const origin = SITE_CONFIG.url

	const schemas = {
		WebSite: {
			"@context": "https://schema.org",
			"@type": "WebSite",
			"name": SITE_CONFIG.name,
			"url": origin,
			"description": SITE_CONFIG.description,
			"potentialAction": {
				"@type": "SearchAction",
				"target": {
					"@type": "EntryPoint",
					"urlTemplate": `${origin}/pesquisa?q={search_term_string}`
				},
				"query-input": "required name=search_term_string"
			}
		},
		Organization: {
			"@context": "https://schema.org",
			"@type": "Organization",
			"name": SITE_CONFIG.name,
			"url": origin,
			"logo": `${origin}${SITE_CONFIG.logo}`,
			"description": SITE_CONFIG.description,
			"contactPoint": {
				"@type": "ContactPoint",
				"contactType": "Sales",
				"areaServed": "BR",
				"availableLanguage": "Portuguese"
			}
		},
		SearchResultsPage: {
			"@context": "https://schema.org",
			"@type": "SearchResultsPage",
			"url": data.url || origin,
			"name": data.title || "Resultados de Busca"
		},
		BreadcrumbList: {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": (data.items || []).map((item, index) => ({
				"@type": "ListItem",
				"position": index + 1,
				"name": item.name,
				"item": item.url
			}))
		},
		Product: {
			"@context": "https://schema.org",
			"@type": "Product",
			"name": data.name,
			"description": data.description,
			"image": data.image,
			"brand": data.brand ? {
				"@type": "Brand",
				"name": data.brand
			} : undefined,
			"offers": {
				"@type": "Offer",
				"price": data.price,
				"priceCurrency": data.currency || "BRL",
				"availability": data.availability ? `https://schema.org/${data.availability.replace(' ', '')}` : "https://schema.org/InStock",
				"itemCondition": "https://schema.org/NewCondition",
				"url": data.url
			},
			"sku": data.sku,
			"gtin": data.gtin,
			"mpn": data.mpn
		}
	}

	return schemas[type]
}

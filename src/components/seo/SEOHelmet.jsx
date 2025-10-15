import React from 'react'
import { Helmet } from 'react-helmet-async'

/**
 * SEOHelmet - Componente SEO com React Helmet para gerenciar meta tags
 * Suporta Open Graph, Twitter Cards, Schema.org e canonical URLs
 */
export default function SEOHelmet({
	title,
	description,
	canonicalUrl,
	image,
	imageAlt,
	noindex = false,
	keywords = [],
	type = 'website',
	siteName = 'Fast Sistemas Construtivos',
	locale = 'pt_BR',
	author,
	publishedTime,
	modifiedTime,
	section,
	tags = [],
	// Twitter
	twitterCard = 'summary_large_image',
	twitterSite,
	twitterCreator,
	// Product specific
	product = {},
	// Schema.org JSON-LD
	schema,
	// Additional meta tags
	additionalMeta = []
}) {
	const fullTitle = title || 'Fast Sistemas Construtivos'
	const fullDescription = description || 'Soluções completas em sistemas construtivos'
	const ogImage = image || '/og-default.jpg'
	const ogImageAlt = imageAlt || title || 'Fast Sistemas Construtivos'

	// Open Graph específicos (usa valores customizados ou fallback para os padrões)
	const ogTitle = openGraph?.['og:title'] || fullTitle
	const ogDescription = openGraph?.['og:description'] || fullDescription
	const ogType = openGraph?.['og:type'] || type

	// Twitter específicos
	const finalTwitterCard = twitter?.card || twitterCard
	const twitterTitleFinal = twitter?.title || fullTitle
	const twitterDescriptionFinal = twitter?.description || fullDescription
	const twitterImageFinal = twitter?.image || ogImage

	// Build robots directive
	const robotsContent = noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'

	return (
		<Helmet>
			{/* Primary Meta Tags */}
			<title>{fullTitle}</title>
			<meta name="title" content={fullTitle} />
			<meta name="description" content={fullDescription} />
			{keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
			<meta name="robots" content={robotsContent} />
			{author && <meta name="author" content={author} />}

			{/* Canonical URL */}
			{canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

			{/* Open Graph / Facebook */}
			<meta property="og:type" content={ogType} />
			<meta property="og:site_name" content={siteName} />
			<meta property="og:locale" content={locale} />
			<meta property="og:title" content={ogTitle} />
			<meta property="og:description" content={ogDescription} />
			{canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
			{ogImage && (
				<>
					<meta property="og:image" content={ogImage} />
					<meta property="og:image:alt" content={ogImageAlt} />
					<meta property="og:image:width" content="1200" />
					<meta property="og:image:height" content="630" />
					<meta property="og:image:type" content="image/jpeg" />
				</>
			)}

			{/* Article specific meta tags */}
			{type === 'article' && (
				<>
					{publishedTime && <meta property="article:published_time" content={publishedTime} />}
					{modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
					{author && <meta property="article:author" content={author} />}
					{section && <meta property="article:section" content={section} />}
					{tags.map((tag, idx) => (
						<meta key={idx} property="article:tag" content={tag} />
					))}
				</>
			)}

			{/* Product specific Open Graph tags */}
			{type === 'product' && (
				<>
					{product.brand && <meta property="product:brand" content={product.brand} />}
					{product.availability && <meta property="product:availability" content={product.availability} />}
					{product.condition && <meta property="product:condition" content={product.condition} />}
					{product.price != null && (
						<>
							<meta property="product:price:amount" content={String(product.price)} />
							<meta property="product:price:currency" content={product.currency || 'BRL'} />
						</>
					)}
					{product.sku && <meta property="product:retailer_item_id" content={product.sku} />}
					{product.gtin && <meta property="product:gtin" content={product.gtin} />}
					{product.mpn && <meta property="product:mpn" content={product.mpn} />}
				</>
			)}

			{/* Twitter Card */}
			<meta name="twitter:card" content={finalTwitterCard} />
			<meta name="twitter:title" content={twitterTitleFinal} />
			<meta name="twitter:description" content={twitterDescriptionFinal} />
			{twitterImageFinal && <meta name="twitter:image" content={twitterImageFinal} />}
			{ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
			{twitterSite && <meta name="twitter:site" content={twitterSite} />}
			{twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

			{/* Additional SEO enhancements */}
			<meta name="format-detection" content="telephone=no" />
			<meta name="theme-color" content="#ffffff" />

			{/* Additional custom meta tags */}
			{additionalMeta.map((meta, idx) => (
				<meta key={idx} {...meta} />
			))}

			{/* Schema.org JSON-LD */}
			{schema && (
				<script type="application/ld+json">
					{JSON.stringify(schema)}
				</script>
			)}
		</Helmet>
	)
}

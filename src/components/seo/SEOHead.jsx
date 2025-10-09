import React, { useEffect } from 'react'

function upsertMetaByName(name, content){
	if (!name || content == null) return
	let el = document.head.querySelector(`meta[name="${name}"]`)
	if (!el){
		el = document.createElement('meta')
		el.setAttribute('name', name)
		document.head.appendChild(el)
	}
	el.setAttribute('content', content)
}

function upsertMetaByProperty(property, content){
	if (!property || content == null) return
	let el = document.head.querySelector(`meta[property="${property}"]`)
	if (!el){
		el = document.createElement('meta')
		el.setAttribute('property', property)
		document.head.appendChild(el)
	}
	el.setAttribute('content', content)
}

function upsertLink(rel, href){
	if (!rel || !href) return
	let el = document.head.querySelector(`link[rel="${rel}"]`)
	if (!el){
		el = document.createElement('link')
		el.setAttribute('rel', rel)
		document.head.appendChild(el)
	}
	el.setAttribute('href', href)
}

export default function SEOHead({
	title,
	description,
	canonicalUrl,
	image,
	noindex = false,
	keywords = [],
	type = 'product',
	siteName = 'Fast Sistemas Construtivos',
	openGraph = {},
	twitter = {},
	product = {} // { price, currency, availability, condition, sku, gtin, mpn, brand }
}){
	useEffect(() => {
		if (title) document.title = title
		if (description) upsertMetaByName('description', description)
		if (Array.isArray(keywords) && keywords.length) upsertMetaByName('keywords', keywords.join(', '))
		upsertMetaByName('robots', noindex ? 'noindex,nofollow' : 'index,follow')

		// Canonical
		if (canonicalUrl) upsertLink('canonical', canonicalUrl)

		// Open Graph
		upsertMetaByProperty('og:type', type)
		if (title) upsertMetaByProperty('og:title', title)
		if (description) upsertMetaByProperty('og:description', description)
		if (image) upsertMetaByProperty('og:image', image)
		if (canonicalUrl) upsertMetaByProperty('og:url', canonicalUrl)
		if (siteName) upsertMetaByProperty('og:site_name', siteName)
		// Extra OG overrides
		Object.entries(openGraph || {}).forEach(([k, v]) => {
			if (v != null) upsertMetaByProperty(k, String(v))
		})

		// Product OG tags
		if (type === 'product'){
			const { price, currency, availability, condition, sku, brand, gtin, mpn } = product || {}
			if (brand) upsertMetaByProperty('product:brand', brand)
			if (availability) upsertMetaByProperty('product:availability', availability)
			if (condition) upsertMetaByProperty('product:condition', condition)
			if (price != null) upsertMetaByProperty('product:price:amount', price)
			if (currency) upsertMetaByProperty('product:price:currency', currency)
			if (sku) upsertMetaByProperty('product:retailer_item_id', sku)
			if (gtin) upsertMetaByProperty('product:gtin', gtin)
			if (mpn) upsertMetaByProperty('product:mpn', mpn)
		}

		// Twitter Card
		const card = twitter.card || (image ? 'summary_large_image' : 'summary')
		upsertMetaByName('twitter:card', card)
		if (title) upsertMetaByName('twitter:title', title)
		if (description) upsertMetaByName('twitter:description', description)
		if (image) upsertMetaByName('twitter:image', image)
		if (twitter.site) upsertMetaByName('twitter:site', twitter.site)
		if (twitter.creator) upsertMetaByName('twitter:creator', twitter.creator)
	}, [title, description, canonicalUrl, image, noindex, JSON.stringify(keywords), type, siteName, JSON.stringify(openGraph), JSON.stringify(twitter), JSON.stringify(product)])

	return null
}


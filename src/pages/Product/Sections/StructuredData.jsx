import React from 'react'
import JsonLd from '../../../components/seo/JsonLd'

export default function StructuredData({ product }){
  if (!product) return null

  const images = product.images || (product.image ? [product.image] : [])
  const brand = product.brand || { name: product.brandName, logo: product.imageBrand }

  const additionalProperty = (product.properties || []).map(p=>({
    '@type':'PropertyValue',
    name: p.name,
    value: p.value
  }))

  // Build offers per unit x measure combination
  const measures = Array.isArray(product.measures) ? product.measures : []
  const units = Array.isArray(product.units) ? product.units : []
  const offersList = []
  const mList = measures.length ? measures : [null]

  const gtinProps = (gtin) => {
    if (!gtin) return {}
    const s = String(gtin)
    const len = s.length
    if (len === 8) return { gtin8: s, gtin: s }
    if (len === 12) return { gtin12: s, gtin: s }
    if (len === 13) return { gtin13: s, gtin: s }
    if (len === 14) return { gtin14: s, gtin: s }
    return { gtin: s }
  }
  for (const u of units) {
    for (const m of mList) {
      const override = (u && m) ? (u.measurePrices && u.measurePrices[m.id]) : null
      const price = (override != null) ? override : (u?.price ?? m?.price ?? product.price)
      const unitSku = u?.sku ? `${product.sku}-${u.sku}` : null
      const measureSku = m?.sku ? `${product.sku}-${m.sku}` : null
      const sku = unitSku && measureSku ? `${unitSku}-${m.sku}` : (unitSku || measureSku || product.sku)
      const gtin = u?.gtin || m?.gtin || product.gtin
      const mpn = u?.mpn || m?.mpn || product.mpn
      const offerNameParts = [product.name]
      if (u?.key) offerNameParts.push(u.key)
      if (m?.label) offerNameParts.push(m.label)
      offersList.push({
        '@type': 'Offer', price, priceCurrency: 'BRL', availability: 'https://schema.org/InStock', sku, name: offerNameParts.join(' - '),
        ...gtinProps(gtin),
        ...(mpn ? { mpn } : {})
      })
    }
  }

  const fullSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.filter(Boolean),
    description: product.shortDescription || product.description || product.longDescription || '',
  sku: product.sku,
  ...gtinProps(product.gtin),
    mpn: product.mpn,
    brand: brand?.name ? { '@type': 'Brand', name: brand.name, logo: brand.logo } : undefined,
    category: product.category,
    additionalProperty,
    dimensions: product.dimensions ? {
      '@type': 'SizeSpecification',
      height: product.dimensions.height,
      width: product.dimensions.width,
      depth: product.dimensions.depth,
      unitCode: product.dimensions.unit
    } : undefined,
    weight: product.weight ? { '@type': 'QuantitativeValue', value: product.weight.value, unitText: product.weight.unit } : undefined,
    aggregateRating: product.aggregateRating ? { '@type': 'AggregateRating', ratingValue: product.aggregateRating.ratingValue, reviewCount: product.aggregateRating.reviewCount } : undefined,
    review: (product.reviews || []).map(r=>({
      '@type': 'Review',
      author: r.author,
      datePublished: r.datePublished,
      reviewBody: r.reviewBody,
      reviewRating: r.reviewRating
    })),
    offers: offersList.length ? ({ '@type': 'AggregateOffer', lowPrice: Math.min(...offersList.map(o=>o.price||product.price)), priceCurrency: 'BRL', offerCount: offersList.length, offers: offersList }) : undefined,
    // Optionally keep variants by measure for richer SERP
    hasVariant: measures.map(m=>({
      '@type': 'Product',
      name: `${product.name} - ${m.label}`,
      sku: m.sku ? `${product.sku}-${m.sku}` : `${product.sku}-${m.id}`,
      description: product.shortDescription || product.description || '',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'length', value: `${m.length}${m.unit}` },
        { '@type': 'PropertyValue', name: 'width', value: `${m.width}${m.unit}` },
        { '@type': 'PropertyValue', name: 'depth', value: `${m.depth}${m.unit}` }
      ],
      offers: { '@type': 'Offer', price: m.price || product.price, priceCurrency: 'BRL', availability: 'https://schema.org/InStock' }
    }))
  }

  return (
    <>
      <JsonLd data={fullSchema} />
    </>
  )
}

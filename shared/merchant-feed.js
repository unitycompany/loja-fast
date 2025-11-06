const FALLBACK_SITE_URL = 'https://shop.fastsistemasconstrutivos.com.br'
const DEFAULT_CHANNEL_TITLE = 'Loja Fast - Feed de Produtos'
const DEFAULT_CHANNEL_DESCRIPTION = 'Feed de produtos para Google Merchant Center'
const DEFAULT_GOOGLE_CATEGORY = 'Materiais de Construcao > Construcao a Seco'
const DEFAULT_QUOTE_PRICE_VALUE = 1
const DEFAULT_QUOTE_AVAILABILITY = 'preorder'
const DEFAULT_QUOTE_LABEL = 'Sob consulta'
const DEFAULT_QUOTE_LABEL_INDEX = 0

export function createMerchantFeed(products = [], options = {}) {
  const settings = buildSettings(options)
  const items = []
  const skipped = []

  for (const product of products) {
    const itemXml = buildMerchantItem(product, settings)
    if (itemXml) {
      items.push(itemXml)
    } else {
      skipped.push(product)
    }
  }

  const xml = wrapXml(items, settings)

  return {
    xml,
    items,
    stats: {
      total: products.length,
      valid: items.length,
      skipped: skipped.length,
    },
    warnings: settings.warnings,
    settings,
  }
}

function buildMerchantItem(product, settings) {
  const id = pickText(product?.id, product?.itemId, product?.sku, product?.slug)
  if (!id) {
    settings.warnings.push({ code: 'missing_id', message: 'Produto ignorado sem identificador.', ref: pickText(product?.name, product?.slug) })
    return null
  }

  const rawTitle = pickText(product?.name, product?.title, product?.seo?.title, 'Produto sem nome')
  const title = truncate(rawTitle, 150)
  const rawDescription = pickText(
    product?.description,
    product?.longDescription,
    product?.shortDescription,
    product?.seo?.description,
    rawTitle
  )
  const description = truncate(stripHtml(rawDescription), 5000) || title

  let priceValue = parsePrice(product?.price)
  let isQuote = false
  if (priceValue === null || priceValue <= 0) {
    const fallbackPrice = settings.quotePriceValue
    if (fallbackPrice === null) {
      settings.warnings.push({ code: 'invalid_price', message: 'Produto ignorado com preco invalido.', ref: id })
      return null
    }
    priceValue = fallbackPrice
    isQuote = true
    settings.warnings.push({ code: 'quote_price_applied', message: 'Preco sob consulta aplicado com valor padrao.', ref: id })
  }

  const currency = pickText(product?.currency, product?.priceCurrency, 'BRL') || 'BRL'
  const link = buildProductLink(product, settings, id)
  if (!link) {
    settings.warnings.push({ code: 'invalid_link', message: 'Produto ignorado sem link valido.', ref: id })
    return null
  }

  const imageLink = resolveImageUrl(product, settings)
  const stockValue = parseNumber(
    pickText(
      product?.stock,
      product?.quantity,
      product?.inventory?.quantity,
      product?.stockQuantity,
      product?.availableQuantity
    )
  )
  let availability = mapAvailability(pickText(
    product?.availability,
    product?.stockStatus,
    product?.inventory?.status,
    product?.availability_status
  ), stockValue)
  const quantity = Number.isFinite(stockValue) ? Math.max(0, Math.floor(stockValue)) : null
  const condition = mapCondition(pickText(product?.condition, product?.item_condition, product?.conditionType))
  const brand = pickText(product?.brand?.name, product?.brandName, product?.brand_name, product?.brand, 'Sem marca') || 'Sem marca'
  const gtin = sanitizeGtin(pickText(product?.gtin, product?.ean, product?.ean13, product?.barcode))
  const identifierExists = gtin ? 'yes' : 'no'
  const mpn = pickText(product?.mpn, product?.reference, product?.sku, id)
  const category = pickText(product?.category?.name, product?.categoryName, product?.product_type, product?.category)
  const googleCategory = pickText(
    product?.googleProductCategory,
    product?.google_product_category,
    product?.merchant?.google_product_category,
    product?.google_category,
    settings.defaultGoogleCategory
  ) || settings.defaultGoogleCategory

  const weightValue = parseNumber(product?.weight?.value ?? product?.weight) ?? 1
  const safeWeight = weightValue > 0 ? weightValue : 1
  const weightUnit = pickText(product?.weight?.unit, product?.weight_unit, 'kg') || 'kg'
  const shippingWeight = `${formatNumber(safeWeight)} ${weightUnit}`

  const shippingEntries = buildShippingEntries(product, settings, currency)
  const shippingXml = shippingEntries.map(entry => renderShipping(entry)).join('\n')

  if (isQuote && settings.quoteAvailability) {
    availability = settings.quoteAvailability
  }

  const priceText = formatPrice(priceValue, currency)
  if (!priceText) {
    settings.warnings.push({ code: 'invalid_price_format', message: 'Produto ignorado por falha ao formatar preco.', ref: id })
    return null
  }

  const customLabels = []
  if (isQuote && settings.quoteLabel) {
    customLabels.push({ index: settings.quoteLabelIndex, value: settings.quoteLabel })
  }

  return renderItemXml({
    id,
    title,
    description,
    link,
    imageLink,
    priceText,
    availability,
    condition,
    brand,
    identifierExists,
    gtin,
    mpn,
    category,
    googleCategory,
    quantity,
    shippingWeight,
    shippingXml,
    customLabels,
  })
}

function wrapXml(items, settings) {
  const itemsXml = items.length ? `${items.join('\n')}\n` : ''
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>${escapeXml(settings.channelTitle)}</title>\n    <link>${escapeXml(settings.siteUrl)}</link>\n    <description>${escapeXml(settings.channelDescription)}</description>\n${itemsXml}  </channel>\n</rss>`
}

function renderItemXml(data) {
  const lines = [
    '    <item>',
    `      <g:id>${escapeXml(data.id)}</g:id>`,
    `      <g:title>${escapeXml(data.title)}</g:title>`,
    `      <g:description>${escapeXml(data.description)}</g:description>`,
    `      <g:link>${escapeXml(data.link)}</g:link>`,
    `      <g:image_link>${escapeXml(data.imageLink)}</g:image_link>`,
    `      <g:price>${escapeXml(data.priceText)}</g:price>`,
    `      <g:availability>${escapeXml(data.availability)}</g:availability>`,
    `      <g:condition>${escapeXml(data.condition)}</g:condition>`,
    `      <g:brand>${escapeXml(data.brand)}</g:brand>`,
    `      <g:identifier_exists>${escapeXml(data.identifierExists)}</g:identifier_exists>`,
  ]

  if (data.gtin) {
    lines.push(`      <g:gtin>${escapeXml(data.gtin)}</g:gtin>`)
  }

  if (data.mpn) {
    lines.push(`      <g:mpn>${escapeXml(data.mpn)}</g:mpn>`)
  }

  if (data.category) {
    lines.push(`      <g:product_type>${escapeXml(data.category)}</g:product_type>`)
  }

  lines.push(`      <g:google_product_category>${escapeXml(data.googleCategory)}</g:google_product_category>`)

  if (data.quantity !== null && data.quantity !== undefined) {
    lines.push(`      <g:quantity>${escapeXml(String(data.quantity))}</g:quantity>`)
  }

  lines.push(`      <g:shipping_weight>${escapeXml(data.shippingWeight)}</g:shipping_weight>`)

  if (data.shippingXml) {
    lines.push(data.shippingXml)
  }

  if (Array.isArray(data.customLabels)) {
    for (const label of data.customLabels) {
      if (!label) continue
      const index = Number.isInteger(label.index) ? label.index : 0
      if (index < 0 || index > 4) continue
      if (!label.value) continue
      lines.push(`      <g:custom_label_${index}>${escapeXml(label.value)}</g:custom_label_${index}>`)
    }
  }

  lines.push('    </item>')
  return lines.join('\n')
}

function buildProductLink(product, settings, fallbackId) {
  const direct = pickText(product?.link, product?.url)
  if (direct && /^https?:\/\//i.test(direct)) {
    return ensureAbsoluteUrl(direct, settings.siteUrl)
  }

  const slug = pickText(product?.slug, product?.handle, product?.urlKey, product?.url_key)
  const relative = direct || (slug ? `/produto/${slug}` : `/produto/${fallbackId}`)
  return ensureAbsoluteUrl(relative, settings.siteUrl)
}

function resolveImageUrl(product, settings) {
  const candidates = []

  const direct = pickText(product?.imageUrl, product?.image_url, product?.mainImage, product?.image)
  if (direct) candidates.push(direct)

  collectImages(product?.images, candidates)
  collectImages(product?.additionalImages, candidates)
  collectImages(product?.seo?.images, candidates)
  collectImages(product?.merchant?.images, candidates)

  for (const candidate of candidates) {
    const resolved = resolveCandidateImage(candidate, settings)
    if (resolved) return resolved
  }

  return settings.defaultImageUrl
}

function collectImages(source, accumulator) {
  if (!source) return

  let value = source
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch (error) {
      accumulator.push(value)
      return
    }
  }

  const list = Array.isArray(value) ? value : [value]

  for (const entry of list) {
    if (!entry) continue
    if (typeof entry === 'string') {
      accumulator.push(entry)
    } else if (typeof entry === 'object') {
      const extracted = pickText(entry.url, entry.src, entry.path, entry.publicUrl, entry.public_url)
      if (extracted) accumulator.push(extracted)
    }
  }
}

function resolveCandidateImage(candidate, settings) {
  if (!candidate) return null

  const value = pickText(candidate)
  if (!value) return null

  if (/^https?:\/\//i.test(value)) {
    return ensureAbsoluteUrl(value, settings.siteUrl)
  }

  if (value.startsWith('//')) {
    return ensureAbsoluteUrl(`https:${value}`, settings.siteUrl)
  }

  if (settings.supabasePublicBase) {
    const cleaned = value.replace(/^\/+/, '')
    const path = cleaned.includes('/') ? cleaned : `${settings.supabaseBucket}/${cleaned}`
    return `${settings.supabasePublicBase}${path}`
  }

  if (value.startsWith('/')) {
    return ensureAbsoluteUrl(value, settings.siteUrl)
  }

  return null
}

function buildShippingEntries(product, settings, currency) {
  const entries = normalizeShipping(product?.shipping)
  const fallbackPrice = parsePrice(
    pickText(
      product?.shippingPrice,
      product?.shippingCost,
      product?.freight,
      product?.freightValue,
      product?.shipping_amount
    )
  )

  if (!entries.length && fallbackPrice !== null) {
    entries.push({ price: fallbackPrice })
  }

  if (!entries.length) {
    entries.push({})
  }

  return entries.map(entry => ({
    country: pickText(entry.country, entry.country_code) || settings.defaultShippingCountry,
    region: pickText(entry.region, entry.state, entry.province, entry.administrative_area) || null,
    service: pickText(entry.service, entry.method, entry.name, entry.type) || settings.defaultShippingService,
    price: parsePrice(entry.price) ?? settings.defaultShippingPriceValue,
    currency: pickText(entry.currency, entry.currency_code) || currency || 'BRL',
  }))
}

function normalizeShipping(shipping) {
  if (shipping === undefined || shipping === null) return []

  if (typeof shipping === 'number' || typeof shipping === 'string') {
    const parsed = parsePrice(shipping)
    return parsed === null ? [] : [{ price: parsed }]
  }

  if (Array.isArray(shipping)) {
    return shipping.filter(Boolean)
  }

  if (typeof shipping === 'object') {
    return [shipping]
  }

  return []
}

function renderShipping(entry) {
  const priceText = formatPrice(entry.price, entry.currency, { allowZero: true }) || formatPrice(0, entry.currency, { allowZero: true })
  const lines = [
    '      <g:shipping>',
    `        <g:country>${escapeXml(entry.country)}</g:country>`,
  ]

  if (entry.region) {
    lines.push(`        <g:region>${escapeXml(entry.region)}</g:region>`)
  }

  lines.push(`        <g:service>${escapeXml(entry.service)}</g:service>`)
  lines.push(`        <g:price>${escapeXml(priceText)}</g:price>`)
  lines.push('      </g:shipping>')

  return lines.join('\n')
}

function buildSettings(options) {
  const fallbackSite = normalizeSiteUrl(options.fallbackSiteUrl || FALLBACK_SITE_URL)
  const preferredSite = normalizeSiteUrl(options.siteUrl || options.siteURL)
  const siteUrl = preferredSite || fallbackSite

  if (!siteUrl) {
  throw new Error('siteUrl invalida para o feed do Merchant.')
  }

  const defaultImageCandidate = options.defaultImageUrl || '/og-default.jpg'
  const defaultImageUrl = ensureAbsoluteUrl(defaultImageCandidate, siteUrl) || `${siteUrl}/og-default.jpg`
  const defaultShippingPriceValue = parsePrice(options.defaultShippingPriceValue ?? options.defaultShippingPrice) ?? 0
  const supabaseUrl = options.supabaseUrl ? options.supabaseUrl.replace(/\/$/, '') : null
  const rawQuotePrice = options.quotePriceValue ?? options.quotePrice ?? options.merchantQuotePrice ?? options.defaultQuotePrice
  const quotePriceValue = rawQuotePrice === 'disable' || rawQuotePrice === false ? null : parsePrice(rawQuotePrice)
  const quoteLabelIndex = parseNumber(options.quoteLabelIndex ?? options.merchantQuoteLabelIndex)
  const normalizedQuoteLabelIndex = Number.isInteger(quoteLabelIndex) ? Math.min(Math.max(quoteLabelIndex, 0), 4) : DEFAULT_QUOTE_LABEL_INDEX

  return {
    siteUrl,
    defaultImageUrl,
    defaultGoogleCategory: options.defaultGoogleCategory || DEFAULT_GOOGLE_CATEGORY,
    defaultShippingCountry: options.defaultShippingCountry || 'BR',
  defaultShippingService: options.defaultShippingService || 'Entrega padrao',
    defaultShippingPriceValue,
    supabaseUrl,
    supabaseBucket: options.supabaseBucket || 'product-images',
    supabasePublicBase: supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/` : null,
    channelTitle: options.channelTitle || DEFAULT_CHANNEL_TITLE,
    channelDescription: options.channelDescription || DEFAULT_CHANNEL_DESCRIPTION,
  quotePriceValue: quotePriceValue ?? DEFAULT_QUOTE_PRICE_VALUE,
  quoteAvailability: pickText(options.quoteAvailability, options.merchantQuoteAvailability) || DEFAULT_QUOTE_AVAILABILITY,
  quoteLabel: pickText(options.quoteLabel, options.merchantQuoteLabel, options.quoteCustomLabel) || DEFAULT_QUOTE_LABEL,
    quoteLabelIndex: normalizedQuoteLabelIndex,
    warnings: [],
  }
}

function pickText(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) return trimmed
      continue
    }

    if (typeof value === 'number') {
      if (!Number.isNaN(value)) return String(value)
      continue
    }

    if (Array.isArray(value)) {
      const nested = pickText(...value)
      if (nested) return nested
      continue
    }

    if (typeof value === 'object') {
      const nested = pickText(value.value, value.label, value.name, value.title, value.text, value.description)
      if (nested) return nested
      continue
    }
  }

  return ''
}

function truncate(value, maxLength) {
  const text = value || ''
  return text.length > maxLength ? text.slice(0, maxLength) : text
}

function stripHtml(html) {
  if (!html) return ''
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (trimmed.includes(',')) {
      const normalized = trimmed.replace(/\./g, '').replace(',', '.')
      const parsed = Number(normalized)
      return Number.isNaN(parsed) ? null : parsed
    }

    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? null : parsed
  }

  return null
}

function parsePrice(value) {
  const numeric = parseNumber(value)
  if (numeric === null) return null
  return Math.round(numeric * 100) / 100
}

function formatPrice(amount, currency = 'BRL', options = {}) {
  const { allowZero = false } = options
  const numeric = typeof amount === 'number' ? amount : parsePrice(amount)
  if (numeric === null) return null
  if (!allowZero && numeric <= 0) return null
  return `${numeric.toFixed(2)} ${currency}`
}

function sanitizeGtin(value) {
  if (!value) return ''
  const digits = String(value).replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 14 ? digits : ''
}

function mapAvailability(rawAvailability, stockValue) {
  if (typeof stockValue === 'number') {
    if (stockValue <= 0) return 'out_of_stock'
    if (stockValue > 0) return 'in_stock'
  }

  const value = (rawAvailability || '').toString().toLowerCase()

  if (!value) return 'in_stock'
  if (value.includes('pre')) return 'preorder'
  if (value.includes('back')) return 'backorder'
  if (value.includes('out')) return 'out_of_stock'
  if (value.includes('in')) return 'in_stock'
  if (value.includes('available')) return 'in_stock'

  return 'in_stock'
}

function mapCondition(condition) {
  const value = (condition || 'new').toString().toLowerCase()

  if (value.includes('used') || value.includes('usado')) return 'used'
  if (value.includes('refurbished') || value.includes('recondicionado')) return 'refurbished'
  return 'new'
}

function formatNumber(value) {
  return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

function ensureAbsoluteUrl(input, base) {
  if (!input) return null

  const value = String(input).trim()
  if (!value) return null

  try {
    if (/^https?:\/\//i.test(value)) {
      return new URL(value).toString()
    }

    const origin = base && /^https?:\/\//i.test(base) ? base : `https://${base}`
    const normalizedOrigin = origin.endsWith('/') ? origin : `${origin}/`
    return new URL(value, normalizedOrigin).toString()
  } catch (error) {
    return null
  }
}

function normalizeSiteUrl(url) {
  if (!url) return null

  const value = String(url).trim()
  if (!value) return null

  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`
    const parsed = new URL(normalized)
    parsed.hash = ''
    return parsed.toString().replace(/\/?$/, '')
  } catch (error) {
    return null
  }
}

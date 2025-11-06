import { createClient } from '@supabase/supabase-js'
import { createMerchantFeed } from '../shared/merchant-feed.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_BUCKET = process.env.MERCHANT_SUPABASE_BUCKET || 'product-images'

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export default async function handler(req, res) {
  try {
    // Busca produtos do Supabase
    let products = []
    
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000) // Limite de produtos
      
      if (error) {
        console.error('Erro ao buscar produtos:', error)
      } else {
        products = data || []
      }
    }
    
    const feed = createMerchantFeed(products, {
      siteUrl: process.env.VITE_SITE_URL || process.env.SITE_URL,
      supabaseUrl: SUPABASE_URL,
      supabaseBucket: SUPABASE_BUCKET,
      defaultImageUrl: process.env.MERCHANT_DEFAULT_IMAGE_URL,
      defaultShippingCountry: process.env.MERCHANT_DEFAULT_SHIPPING_COUNTRY,
      defaultShippingService: process.env.MERCHANT_DEFAULT_SHIPPING_SERVICE,
      defaultShippingPriceValue: process.env.MERCHANT_DEFAULT_SHIPPING_PRICE ?? process.env.VITE_DEFAULT_SHIPPING_PRICE,
      quotePriceValue: process.env.MERCHANT_QUOTE_PRICE ?? process.env.VITE_QUOTE_PRICE,
      quoteAvailability: process.env.MERCHANT_QUOTE_AVAILABILITY,
      quoteLabel: process.env.MERCHANT_QUOTE_LABEL,
      quoteLabelIndex: process.env.MERCHANT_QUOTE_LABEL_INDEX,
    })
    
    // Define headers corretos
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.status(200).send(feed.xml)
    
  } catch (error) {
    console.error('Erro ao gerar feed:', error)
    res.status(500).send('Erro ao gerar feed de produtos')
  }
}

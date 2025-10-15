import React from 'react'
import styled from "styled-components"
import { useParams } from 'react-router-dom'
import Main from './Sections/Main'
import StructuredData from './Sections/StructuredData'
import Details from './Sections/Details'
import Adsense from '../../components/banners/Adsense'
import { fetchBannersByType } from '../../services/bannerService'
import { resolveImageUrl } from '../../services/supabase'
import { fetchProductBySlug } from '../../services/productService'
import SEOHelmet from '../../components/seo/SEOHelmet'
import { buildProductSeo } from '../../lib/seo'
import Loader from '../../components/common/Loader'

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    position: relative;
    width: 100%;
    max-width: 1440px;
    height: auto;
    margin: 0 auto;
    padding: 0 0;
`

export default function Product() {
    const { slug } = useParams()

    const [product, setProduct] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const [adsenseItems, setAdsenseItems] = React.useState([])

    React.useEffect(() => {
        let mounted = true
        setLoading(true)
        fetchProductBySlug(slug)
            .then(p => {
                if (!mounted) return
                setProduct(p)
                setLoading(false)
            })
            .catch(err => {
                if (!mounted) return
                setError(err)
                setLoading(false)
            })
        return () => { mounted = false }
    }, [slug])

    React.useEffect(() => {
        let mounted = true
        async function loadBanners() {
            try {
                const data = await fetchBannersByType('disclosure')
                const resolved = []
                for (const b of (data || [])) {
                    const image = await resolveImageUrl(b.image)
                    const url_mobile = await resolveImageUrl(b.url_mobile)
                    const url_desktop = await resolveImageUrl(b.url_desktop)
                    resolved.push({ ...b, image: image || b.image, url_mobile: url_mobile || b.url_mobile, url_desktop: url_desktop || b.url_desktop })
                }
                if (mounted) setAdsenseItems(resolved)
            } catch (err) {
                console.error('Failed to load disclosure banners', err)
            }
        }
        loadBanners()
        return () => { mounted = false }
    }, [])

    // lift selected measure to synchronize Main and Details
    const defaultMeasureId = product?.default_measure_id || product?.defaultMeasureId || product?.measures?.[0]?.id
    const [selectedMeasureId, setSelectedMeasureId] = React.useState(defaultMeasureId)
    // lift unit index so SEO can reflect current selection as well
    const [selectedUnitIndex, setSelectedUnitIndex] = React.useState(0)
    React.useEffect(() => {
        if (product) {
            const pref = product.default_measure_id || product.defaultMeasureId || (product.measures && product.measures[0]?.id) || null
            setSelectedMeasureId(pref)
        }
    }, [product])

    if (loading) return <Container style={{ padding: '40px 20px' }}><Loader label="Carregando produto..." size={28} /></Container>
    if (error || !product) return <Container><h1>Produto não encontrado</h1></Container>

    // Compute current selection snapshot for SEO/meta
    const units = Array.isArray(product?.units) ? product.units : []
    const measures = Array.isArray(product?.measures) ? product.measures : []
    const unit = units[selectedUnitIndex] || units[0] || null
    const measure = measures.find(m=>m.id===selectedMeasureId) || measures[0] || null
    const price = (()=>{
      if (unit && measure && unit.measurePrices && unit.measurePrices[measure.id] != null) return unit.measurePrices[measure.id]
      if (unit && unit.price != null) return unit.price
      if (measure && measure.price != null) return measure.price
      return product.price
    })()
    const seoData = buildProductSeo({ product, selection: { unit, measure, price } })

    return (
        <>
            <SEOHelmet 
                title={seoData.title}
                description={seoData.description}
                canonicalUrl={seoData.canonicalUrl}
                image={seoData.image}
                imageAlt={seoData.imageAlt}
                type="product"
                keywords={seoData.keywords}
                noindex={seoData.noindex}
                openGraph={seoData.openGraph}
                twitter={seoData.twitter}
                product={seoData.product}
            />
            <Container>
                <Main product={product} selectedMeasureId={selectedMeasureId} setSelectedMeasureId={setSelectedMeasureId} selectedUnitIndex={selectedUnitIndex} setSelectedUnitIndex={setSelectedUnitIndex} />
                <StructuredData product={product} />
                <Details product={product} selectedMeasureId={selectedMeasureId} setSelectedMeasureId={setSelectedMeasureId} />
                <Adsense 
                    ItemsAdsense={adsenseItems}
                />
            </Container>
        </>
    )
}
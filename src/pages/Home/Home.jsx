import styled from "styled-components"
import HeroBanners from "./Sections/HeroBanners"
import Categorys from "./Sections/Categorys"
import Adsense from "../../components/banners/Adsense"
import ProductCarousel from "./Sections/ProductCarousel"
import { Fragment, useEffect, useState } from 'react'
import { fetchBannersByType } from '../../services/bannerService'
import { resolveImageUrl } from '../../services/supabase'
import { fetchCategories } from '../../services/categoryService'
import SEOHelmet from "../../components/seo/SEOHelmet"
import { ROUTE_SEO, SITE_CONFIG, generateSchema } from '../../lib/seoConfig'

const Container = styled.main`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    position: relative;
    width: 100%;
    max-width: 1440px;
    height: auto;
    margin: 0 auto;
    padding: 0 0;
`

const Content = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 2.5%;
    width: 100%;
`

// We'll load banner groups from Supabase instead of hard-coded arrays

/**
 * Map a banner row from Supabase into the shape expected by the Adsense component
 */
function mapBannerToAd(b) {
    // prefer resolved public/signed URLs when available, but map will be pre-resolved in callers
    const image = b.image || b.url_desktop || b.image || null
    const alt = b.alt || b.title || ''
    // rota: normalize href -> remove leading slash so Adsense can prefix it
    let rota = 'promocoes'
    if (b.href) rota = String(b.href).replace(/^\//, '')
    else if (b.rota) rota = b.rota
    const height = b.height || b.size || null
    return { image, alt, rota, height }
}

// Configure groups: each entry is a banner type with a count (how many items in the array)
const GROUP_TYPES = [
    { type: 'home', count: 3 },
    { type: 'disclosure', count: 2 },
    { type: 'product', count: 2 },
]

export default function Home() {
    const [group1, setGroup1] = useState([])
    const [group2, setGroup2] = useState([])
    const [group3, setGroup3] = useState([])
    const [homeCategories, setHomeCategories] = useState([])

    useEffect(() => {
        let mounted = true
        async function load() {
            try {
                async function resolveRows(rows) {
                    const resolved = []
                    for (const r of (rows || [])) {
                        const image = await resolveImageUrl(r.url_desktop || r.image || r.url_desktop)
                        const url_mobile = await resolveImageUrl(r.url_mobile || r.urlMobile)
                        const url_desktop = await resolveImageUrl(r.url_desktop || r.urlDesktop)
                        resolved.push({ ...r, image: image || r.image, urlMobile: url_mobile || r.url_mobile || r.urlMobile, urlDesktop: url_desktop || r.url_desktop || r.urlDesktop })
                    }
                    return resolved
                }

                const results = []
                for (const cfg of GROUP_TYPES) {
                    const rows = await fetchBannersByType(cfg.type)
                    const resolved = await resolveRows(rows)
                    const mapped = (resolved || []).slice(0, cfg.count).map(mapBannerToAd)
                    results.push(mapped)
                }

                if (!mounted) return
                setGroup1(results[0] || [])
                setGroup2(results[1] || [])
                setGroup3(results[2] || [])
            } catch (err) {
                console.error('Failed to load home banners', err)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        let mounted = true
        async function loadCategories() {
            try {
                const data = await fetchCategories()
                if (!mounted) return
                const filtered = (data || [])
                    .filter(category => !category.parent && (category.numberProducts ?? 0) > 0)
                    .filter(category => (category.slug || category.id) !== 'argamassas-impermeabilizantes')
                    .sort((a, b) => (b.numberProducts ?? 0) - (a.numberProducts ?? 0))
                setHomeCategories(filtered.slice(0, 4))
            } catch (error) {
                console.error('Failed to load home categories', error)
                if (mounted) setHomeCategories([])
            }
        }
        loadCategories()
        return () => { mounted = false }
    }, [])

    // SEO data from configuration
    const homeSEO = ROUTE_SEO.home
    const homeSchema = generateSchema('WebSite')
    const organizationSchema = generateSchema('Organization')

    return (
        <>
            <SEOHelmet
                title={homeSEO.title}
                description={homeSEO.description}
                canonicalUrl={`${SITE_CONFIG.url}${homeSEO.path}`}
                image={`${SITE_CONFIG.url}/og-home.jpg`}
                type="website"
                keywords={homeSEO.keywords}
                schema={[homeSchema, organizationSchema]}
            />
            <Container data-aos="fade-up">
                <HeroBanners />
                <Content data-aos="fade-up" data-aos-delay="80">
                    <Categorys />
                    {homeCategories.map((category, index) => {
                        const keys = [
                            category.slug || category.id,
                            ...(Array.isArray(category.children) ? category.children.map(child => child.slug || child.id) : [])
                        ].filter(Boolean)
                        if (keys.length === 0) return null
                        const [primaryKey, ...additionalKeys] = keys
                        return (
                            <Fragment key={category.id || category.slug || index}>
                                <ProductCarousel
                                    title={category.name}
                                    categoryKey={primaryKey}
                                    categoryKeys={additionalKeys}
                                />
                                {index === 0 ? <Adsense ItemsAdsense={'product'} /> : null}
                                {index === 1 ? <Adsense ItemsAdsense={'brand'} /> : null}
                            </Fragment>
                        )
                    })}
                    <Adsense ItemsAdsense={'disclosure'} />
                    
                </Content>
            </Container>
        </>
    )
}

// GROUP_TYPES is defined above
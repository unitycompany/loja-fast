import styled from "styled-components"
import ProductsGrid from "./Sections/ProductsGrid"
import Filter from "./Sections/Filter"
import Adsense from "../../components/banners/Adsense"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEOHelmet from "../../components/seo/SEOHelmet"
import { getCategorySEO, getBrandSEO, getSearchSEO, generateSchema, SITE_CONFIG } from '../../lib/seoConfig'
import { fetchCategories } from '../../services/categoryService'
import { fetchBrands } from '../../services/brandService'

const Container = styled.section`
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
    margin-top: 70px;

    & .banner {

        @media (max-width: 768px) {
            padding: 2.5% 5%;
        }
    }

    @media (max-width: 768px) {
        flex-direction: column;
        margin-top: 0;
    }
`

const Main = styled.main`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: row;
    position: relative;
    width: 100%;
    height: auto;
`

export default function Search() {
    const [filterOpen, setFilterOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const [seoData, setSeoData] = useState(null)
    
    const searchQuery = searchParams.get('q') || searchParams.get('search') || ''
    const categoryParam = searchParams.get('category') || ''
    const brandParam = searchParams.get('brand') || ''
    const subcategoryParam = searchParams.get('subcategory') || ''

    // Carrega dados de categoria/marca para SEO otimizado
    useEffect(() => {
        let mounted = true
        
        async function loadSEOData() {
            try {
                let seo = null
                
                if (categoryParam) {
                    // Busca informações da categoria
                    const categories = await fetchCategories()
                    const category = categories?.find(c => 
                        c.slug === categoryParam || c.id === categoryParam
                    )
                    
                    if (category) {
                        seo = getCategorySEO(category.slug || categoryParam, category.name, subcategoryParam)
                        seo.image = category.image || `${SITE_CONFIG.url}/og-category-${categoryParam}.jpg`
                    } else {
                        seo = getCategorySEO(categoryParam, categoryParam, subcategoryParam)
                    }
                } else if (brandParam) {
                    // Busca informações da marca
                    const brands = await fetchBrands()
                    const brand = brands?.find(b => 
                        b.slug === brandParam || b.id === brandParam || 
                        b.name?.toLowerCase() === brandParam.toLowerCase()
                    )
                    
                    if (brand) {
                        seo = getBrandSEO(brand.slug || brandParam, brand.name)
                        seo.image = brand.logo || brand.image || `${SITE_CONFIG.url}/og-brand-${brandParam}.jpg`
                    } else {
                        seo = getBrandSEO(brandParam, brandParam)
                    }
                } else if (searchQuery) {
                    seo = getSearchSEO(searchQuery)
                } else {
                    // Página de busca genérica
                    seo = {
                        title: 'Buscar Produtos | Fast Sistemas Construtivos',
                        description: 'Navegue por nosso catálogo completo. Filtre por categoria, marca, preço e encontre exatamente o que precisa.',
                        keywords: ['busca', 'catálogo', 'produtos construção', 'materiais'],
                        canonicalUrl: `${SITE_CONFIG.url}/pesquisa`,
                    }
                }
                
                if (mounted) setSeoData(seo)
            } catch (err) {
                console.error('Failed to load SEO data', err)
            }
        }
        
        loadSEOData()
        return () => { mounted = false }
    }, [categoryParam, brandParam, searchQuery, subcategoryParam])

    // Removido fetch manual; padroniza Adsense para categoria 'brand'

    // SEO Schema
    const searchSchema = seoData ? generateSchema('SearchResultsPage', {
        url: seoData.canonicalUrl,
        title: seoData.title
    }) : null

    return (
        <>
            {seoData && (
                <SEOHelmet
                    title={seoData.title}
                    description={seoData.description}
                    canonicalUrl={seoData.canonicalUrl}
                    image={seoData.image}
                    type="website"
                    keywords={seoData.keywords}
                    schema={searchSchema}
                />
            )}
            <Container>
                <Main>
                    <Filter open={filterOpen} setOpen={setFilterOpen} />
                    <ProductsGrid setFilterOpen={setFilterOpen} />
                </Main>
                <Adsense className="banner" ItemsAdsense={'brand'} />
            </Container>
        </>
    )
}
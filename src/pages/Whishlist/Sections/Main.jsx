import React from "react";
import useWishlist from "../../../hooks/useWishlist";
import styled from "styled-components";
import Breadcrumbs from "../../../components/navigation/Breadcrumbs";
import ProductCard from "../../../components/product/ProductCard";
import { fetchProductsBySlugs } from '../../../services/productService'
import Adsense from "../../../components/banners/Adsense";
import { fetchBannersByType } from '../../../services/bannerService'
import { resolveImageUrl } from '../../../services/supabase'

const Container = styled.div`
    width: 100%;
    width: 100%;
    margin-top: 70px;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 40vh;
    gap: 16px;

    @media (max-width: 768px) {
        margin-top: 60px;
    }
`

const Texts = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: auto;
    padding: 2.5%;

    @media (max-width: 768px) {
        padding: 2.5%;
    }

    & h1 {
        font-size: clamp(1.4rem, 1rem + 2vw, 2.2rem);
        font-weight: 500;
        line-height: 100%;
    }
`

const Content = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0 2.5%;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        padding: 2.5%;
    }
`

const breadcrumbs = [
    {
        route: 'Favoritos',
        link: 'favoritos'
    }
]

export default function WishMain() {
    const { isWished, list: wishedList } = useWishlist();

    const [wishedProducts, setWishedProducts] = React.useState([])

    React.useEffect(() => {
        let mounted = true
        const fetchAll = async () => {
            if (!wishedList || wishedList.length === 0) {
                if (mounted) setWishedProducts([])
                return
            }
            try {
                const results = await fetchProductsBySlugs(wishedList)
                if (!mounted) return
                setWishedProducts(results)
            } catch (err) {
                console.error(err)
            }
        }
        fetchAll()
        return () => { mounted = false }
    }, [wishedList])

    const [adsenseItems, setAdsenseItems] = React.useState([])
    React.useEffect(() => {
        let mounted = true
        async function loadBanners() {
            try {
                const data = await fetchBannersByType('disclosure')
                const resolved = []
                for (const b of (data || [])) {
                    const image = await resolveImageUrl(b.image)
                    resolved.push({ ...b, image: image || b.image })
                }
                if (mounted) setAdsenseItems(resolved)
            } catch (err) {
                console.error('Failed to load disclosure banners', err)
            }
        }
        loadBanners()
        return () => { mounted = false }
    }, [])

    if (wishedProducts.length === 0) {
        return (
            <>
                <Container>
                    <Texts>
                        <Breadcrumbs 
                            pages={breadcrumbs}
                        />
                        <h1>Seus favoritos</h1>
                    </Texts>
                    <Content>
                        <h1>Você não favoritou nenhum produto ainda!</h1>
                    </Content>
                    <Adsense 
                        ItemsAdsense={adsenseItems}
                    />
                </Container>
            </>
        )
    }

    return(
        <>
            <Container>
                <Texts>
                    <Breadcrumbs 
                        pages={breadcrumbs}
                    />
                    <h1>Seus favoritos</h1>
                </Texts>
                <Content>
                    {wishedProducts.map(product => (
                        <ProductCard
                            key={product.slug}
                            product={product}
                        />
                    ))}
                </Content>
                <Adsense 
                    ItemsAdsense={adsenseItems}
                />
            </Container>
        </>
    )
}
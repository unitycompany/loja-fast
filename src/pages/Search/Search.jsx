import styled from "styled-components"
import ProductsGrid from "./Sections/ProductsGrid"
import Filter from "./Sections/Filter"
import Adsense from "../../components/banners/Adsense"
import { fetchBannersByType } from '../../services/bannerService'
import { resolveImageUrl } from '../../services/supabase'
import { useEffect, useState } from 'react'

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
    border: 1px solid red;
`

export default function Search() {
    const [filterOpen, setFilterOpen] = useState(false)
    const [adsenseItems, setAdsenseItems] = useState([])

    useEffect(() => {
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

    return (
        <>
            <Container>
                <Main>
                    <Filter open={filterOpen} setOpen={setFilterOpen} />
                    <ProductsGrid setFilterOpen={setFilterOpen} />
                </Main>
                <Adsense 
                    ItemsAdsense={adsenseItems}
                />
            </Container>
        </>
    )
}
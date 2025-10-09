import styled from "styled-components";
import BannerCarousel from "../../../components/banners/BannerCarousel";
import { useEffect, useState } from 'react'
import Skeleton from '../../../components/common/Skeleton'
import { fetchBanners } from '../../../services/bannerService'
import { resolveImageUrl } from '../../../services/supabase'
import { CreditCardIcon, TruckIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";

const Container = styled.section`
    width: 100%;
    height: 450px;
    margin-top: 70px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color--gray-5);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    @media (max-width: 768px) {
        margin-top: 60px;
        height: 500px;
    }

`

const Range = styled.ul`
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: var(--color--white);
    box-shadow: var(--border-top);
    padding: 12px;

    & li {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:last-child {
            @media (max-width: 768px) {
                display: none;
            }
        }

        @media (max-width: 768px) {
            flex-direction: column;
            text-align: center;
        }

        & svg {
            font-size: 24px;
            color: var(--color--primary);
        }

        & span {
            font-size: 16px;
            font-weight: 400;
            color: var(--color--black);

            @media (max-width: 768px) {
                font-size: 14px;
                line-height: 1.1;
                width: 80%;
            }
        }
    }
`

export default function HeroBanners() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        async function load() {
            try {
                const data = await fetchBanners()
                // resolve image URLs if stored as bucket paths
                const resolved = []
                for (const b of (data || [])) {
                    const image = await resolveImageUrl(b.image)
                    const url_mobile = await resolveImageUrl(b.url_mobile || b.urlMobile)
                    const url_desktop = await resolveImageUrl(b.url_desktop || b.urlDesktop)
                    // BannerCarousel / Banner expect camelCase props: urlMobile / urlDesktop
                    resolved.push({
                        ...b,
                        image: image || b.image,
                        // keep both snake_case and camelCase to be forgiving
                        url_mobile: url_mobile || b.url_mobile || b.urlMobile,
                        url_desktop: url_desktop || b.url_desktop || b.urlDesktop,
                        urlMobile: url_mobile || b.url_mobile || b.urlMobile,
                        urlDesktop: url_desktop || b.url_desktop || b.urlDesktop,
                        alt: b.alt || b.title || b.name || '',
                        href: b.href || b.link || b.url || ''
                    })
                }
                if (mounted) setItems(resolved)
            } catch (err) {
                console.error('Failed to load banners', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    return (
        <>
            <Container>
                {loading ? (
                    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                        <Skeleton width="100%" height="100%" />
                    </div>
                ) : (
                    <BannerCarousel
                    items={items}
                    height="100%"
                    autoplayDelay={8000}
                    loop
                />
                )}
                <Range>
                    <li>
                        <WhatsappLogoIcon weight="light"/>
                        <span>Atendimento via WhatsApp</span>
                    </li>
                    <li>
                        <TruckIcon weight="light" />
                        <span>Retire na loja mais perto de você</span>
                    </li>
                    <li>
                        <CreditCardIcon weight="light" />
                        <span>Parcele suas compras</span>
                    </li>
                </Range>
            </Container>
        </>
    )
}
import styled from "styled-components";
import { useEffect, useState } from 'react'
import { fetchBannersByType } from '../../services/bannerService'
import { resolveImageUrl } from '../../services/supabase'

const Container = styled.section`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    width: 100%;
    height: auto;
    padding: 2.5%;
    gap: 16px;

    @media (max-width: 768px){
        flex-direction: column;
    }

    & picture {
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        overflow: hidden;
        width: 100%;

        &:hover {

            & img {
                transform: scale(1.01);
            }
        }

        & img {
            height: 100%;
            width: 100%;
            object-fit: cover;
            object-position: center;
            transition: all .4s ease-in-out;
        }
    }
`

export default function Adsense({
    ItemsAdsense = [], // can be an array or a string type (e.g. 'disclosure')
}) {
    const [items, setItems] = useState(Array.isArray(ItemsAdsense) ? ItemsAdsense : [])

    useEffect(() => {
        let mounted = true
        async function loadFromType(type) {
            try {
                const data = await fetchBannersByType(type)
                const resolved = []
                for (const b of (data || [])) {
                    const image = await resolveImageUrl(b.url_desktop || b.image || b.url_desktop)
                    resolved.push({ image: image || b.image, alt: b.alt || b.title || '', rota: b.href ? String(b.href).replace(/^\//, '') : (b.rota || 'promocoes'), height: b.height || b.size || null })
                }
                if (mounted) setItems(resolved)
            } catch (err) {
                console.error('Failed to load ads by type', err)
            }
        }

        if (typeof ItemsAdsense === 'string') {
            setItems([])
            loadFromType(ItemsAdsense)
        } else if (Array.isArray(ItemsAdsense)) {
            setItems(ItemsAdsense)
        }

        return () => { mounted = false }
    }, [ItemsAdsense])

    return (
        <>
            <Container>
                {items.map((adsense, index) => (
                    <picture 
                        key={index} 
                        style={{ height: adsense.height }} 
                        onClick={() => window.location.href = `/${adsense.rota}`}>
                            <img 
                                src={adsense.image} 
                                alt={adsense.alt} 
                            />
                    </picture>
                ))}
            </Container>
        </>
    )
}
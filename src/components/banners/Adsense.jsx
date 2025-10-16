import styled from "styled-components";
import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, A11y } from "swiper/modules"
import "swiper/css"
import { fetchBannersByType, fetchCategoryBannerDefaults } from '../../services/bannerService'
import { resolveImageUrl } from '../../services/supabase'
import { addUTM } from '../../utils/url'

const BannerItem = styled.picture`
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    width: 100%;

    @media (min-width: 769px) {
        width: auto;
        max-width: 100%;
    }

    &:hover {
        & img {
            transform: scale(1.01);
        }
    }

    & img {
        height: auto;
        width: 100%;
        object-fit: cover;
        object-position: center;
        transition: all .4s ease-in-out;
    }
`

const CarouselWrapper = styled.section`
    width: 100%;
    padding: 2.5%;
    box-sizing: border-box;

    .swiper {
        width: 100%;
    }

    .swiper-slide {
        display: flex;
        height: auto;
        width: auto;
    }

    @media (max-width: 768px) {
        .swiper-slide {
            width: 100% !important;
        }
    }

`

const StaticList = styled.div`
    display: flex;
    gap: 12px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: auto;
`

export default function Adsense({
    ItemsAdsense = [],
    className // can be an array or a string type (e.g. 'disclosure')
}) {
    const [items, setItems] = useState(Array.isArray(ItemsAdsense) ? ItemsAdsense : [])
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia('(max-width: 768px)').matches
    })

    useEffect(() => {
        let mounted = true
        async function loadFromType(type) {
            try {
                const [data, defaultsMap] = await Promise.all([
                  fetchBannersByType(type),
                  fetchCategoryBannerDefaults()
                ])
                const resolved = []
                for (const b of (data || [])) {
                    const image = await resolveImageUrl(b.url_desktop || b.image || b.url_desktop)
                    const categories = Array.isArray(b.meta?.categories) ? b.meta.categories : []
                    const firstCat = categories[0] || null
                    const catDefaults = firstCat && defaultsMap[firstCat] ? defaultsMap[firstCat] : {}
                    const heightDesktop = b.meta?.height_desktop || catDefaults.height_desktop || b.height || b.size || null
                    const heightMobile = b.meta?.height_mobile || catDefaults.height_mobile || b.height || b.size || null
                    resolved.push({
                        image: image || b.image,
                        alt: b.alt || b.meta?.title || '',
                        rota: b.href ? String(b.href).replace(/^\//, '') : (b.rota || 'promocoes'),
                        heightDesktop,
                        heightMobile
                    })
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

    useEffect(() => {
        if (typeof window === 'undefined') return undefined

        const media = window.matchMedia('(max-width: 768px)')
        const handleChange = (event) => setIsMobile(event.matches)

        setIsMobile(media.matches)

        if (media.addEventListener) {
            media.addEventListener('change', handleChange)
        } else if (media.addListener) {
            media.addListener(handleChange)
        }

        return () => {
            if (media.removeEventListener) {
                media.removeEventListener('change', handleChange)
            } else if (media.removeListener) {
                media.removeListener(handleChange)
            }
        }
    }, [])
    if (!items.length) return null

    const slidesPerView = isMobile ? 1 : 'auto'
    const spaceBetween = isMobile ? 16 : 12
    const autoplay = isMobile && items.length > 1 ? { delay: 4500, disableOnInteraction: false } : false
    const loop = isMobile && items.length > 1
    const allowTouchMove = isMobile

    const useCarousel = isMobile && items.length > 1

    return (
        <CarouselWrapper className={className}>
            {useCarousel ? (
                <Swiper
                    modules={[Autoplay, A11y]}
                    slidesPerView={slidesPerView}
                    spaceBetween={spaceBetween}
                    allowTouchMove={allowTouchMove}
                    loop={loop}
                    autoplay={autoplay}
                    watchOverflow
                    a11y={{ enabled: true }}
                    breakpoints={{
                        769: {
                            slidesPerView: 'auto',
                            allowTouchMove: false,
                        },
                    }}
                >
                    {items.map((adsense, index) => (
                        <SwiperSlide key={index}>
                            <BannerItem
                                style={{ height: adsense.heightMobile }}
                                onClick={() => window.location.href = addUTM(`/${adsense.rota}`)}
                            >
                                <img
                                    src={adsense.image}
                                    alt={adsense.alt}
                                />
                            </BannerItem>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <StaticList>
                    {items.map((adsense, index) => (
                        <BannerItem
                            key={index}
                            style={{ height: adsense.heightDesktop }}
                            onClick={() => window.location.href = addUTM(`/${adsense.rota}`)}
                        >
                            <img src={adsense.image} alt={adsense.alt} />
                        </BannerItem>
                    ))}
                </StaticList>
            )}
        </CarouselWrapper>
    )
}
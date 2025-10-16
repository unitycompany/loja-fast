import styled from "styled-components";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y, FreeMode } from "swiper/modules";

import { fetchCategoriesRaw } from '../../../services/categoryService'
import { resolveImageUrl } from '../../../services/supabase'
import { useEffect, useState } from 'react'
import { CategorySkeleton } from '../../../components/common/SkeletonComponents'
import { addUTM } from '../../../utils/url'

const Container = styled.section`
    width: 100%;
    padding: 2.5%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;

    .swiper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .swiper-slide {
        width: auto; 
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        cursor: pointer;
        gap: 12px;

        & picture {
            width: 100%;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            background-color: var(--color--white);
            overflow: hidden;

            @media (max-width: 768px) {
                height: 120px;
            }

            & img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                object-position: center;
                transition: all .2s ease-in-out;
                filter: grayscale(100%);

                &:hover {
                    transform: scale(1.1) rotate(3deg);
                    filter: grayscale(0);
                }
            }
        }

        & div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;

            & h4 {
                font-size: 16px;
                line-height: 100%;
                font-weight: 500;
                color: var(--color--black);
                text-align: center;

                @media (max-width: 768px) {
                    font-size: 14px;
                }
            }
    
            & span {
                font-size: 12px;
                font-weight: 300;
                color: var(--color--gray);
            }
        }

    }
`

export default function Categorys() {
    // categories will be an array of { id, data } objects from Supabase
    const [categories, setCategories] = useState([])
    const [imageMap, setImageMap] = useState({})
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        let mounted = true
        fetchCategoriesRaw({ includeEmpty: false }).then(c => { if (mounted) setCategories(Array.isArray(c) ? c : []) }).catch(console.error)
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        let mounted = true
        async function load() {
            const map = {}
            await Promise.all((categories || []).map(async (catRow) => {
                const cat = catRow.data || {}
                try {
                    map[catRow.id] = await resolveImageUrl(cat.image)
                } catch (e) {
                    map[catRow.id] = cat.image
                }
            }))
            if (mounted) setImageMap(map)
        }
        if ((categories || []).length) load()
        return () => { mounted = false }
    }, [categories])

    useEffect(() => {
        if (categories.length === 0) return
        // give a tiny delay to allow images to resolve
        const t = setTimeout(() => setLoading(false), 50)
        return () => clearTimeout(t)
    }, [categories, imageMap])
    return (
        <>
            <Container>
                {loading ? (
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, padding: '20px' }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <CategorySkeleton key={`cat-s-${i}`} />
                        ))}
                    </div>
                ) : (
                <Swiper
                    modules={[A11y, FreeMode]}
                    loop={true}
                    slidesPerView={3}
                    freeMode={true}
                    spaceBetween={16}
                    a11y={{ enabled: true }}
                    lazyPreloadPrevNext={1}
                    breakpoints={{
                        480: { slidesPerView: 2  },
                        768: { slidesPerView: 3  },
                        1024: { slidesPerView: 4  },
                        1200: { slidesPerView: 7  },
                    }}
                >
                        {(Array.isArray(categories) ? categories : []).map((categoryRow) => {
                            const category = categoryRow.data || {}
                            const target = category.slug ? `/pesquisa?category=${encodeURIComponent(category.slug)}` : `/pesquisa?category=${encodeURIComponent(categoryRow.id)}`
                            return (
                                <SwiperSlide key={categoryRow.id} onClick={() => window.location.href = addUTM(target)}>
                                    <picture>
                                        <img src={imageMap[categoryRow.id] || category.image} alt={category.name} />
                                    </picture>
                                    <div>
                                        <h4>{category.name}</h4>
                                        <span>{category.numberProducts} produtos</span>
                                    </div>
                                </SwiperSlide>
                            )
                        })}
                </Swiper>
                )}
            </Container>
        </>
    )
}
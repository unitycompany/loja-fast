import styled from "styled-components";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";

import { fetchCategoriesRaw } from '../../../services/categoryService'
import { resolveImageUrl } from '../../../services/supabase'
import { useEffect, useState } from 'react'
import Skeleton from '../../../components/common/Skeleton'

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
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            background-color: var(--color--white);

            & img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                object-position: center;
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
            }
    
            & span {
                font-size: 12px;
                font-weight: 400;
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
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={`cat-s-${i}`}>
                                <Skeleton width="100%" height={150} />
                                <div style={{ height: 8 }} />
                                <Skeleton width="60%" height={16} />
                                <div style={{ height: 4 }} />
                                <Skeleton width="40%" height={12} />
                            </div>
                        ))}
                    </div>
                ) : (
                <Swiper
                    modules={[A11y]}
                    loop={true}
                    slidesPerView={2}
                    slidesPerGroup={1}
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
                                <SwiperSlide key={categoryRow.id} onClick={() => window.location.href = target}>
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
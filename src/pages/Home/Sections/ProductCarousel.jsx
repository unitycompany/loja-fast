import styled, {keyframes} from "styled-components";

import ProductCard from "../../../components/product/ProductCard";
import React from "react";
import { fetchTopProducts } from "../../../services/productService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Autoplay } from "swiper/modules";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ProductCardSkeleton } from '../../../components/common/SkeletonComponents'

const Container = styled.section`
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 2.5%;
    gap: 32px;

    @media (max-width: 768px) {
        gap: 16px;
    }
`;

const Text = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto;

    & .carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        border: 1px solid var(--color--gray-5);
        border-radius: 0;
        cursor: pointer;
        color: var(--color--black-3);
    }

    & .carousel-nav:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    & .carousel-nav.prev {
        left: 0px;
    }

    & .carousel-nav.next {
        right: 0px;
    }

    & h1 {
        font-size: 24px;
        line-height: 100%;
        font-weight: 700;
        border-bottom: 1px solid var(--color--black-3);
        padding-bottom: 4px;
        text-align: center;
        color: transparent;
        background: linear-gradient(90deg, var(--color--black-2), var(--color--black-6));
        -webkit-background-clip: text;

        @media (max-width: 768px) {
            font-size: 20px;
        }
    }
`;

const Carousel = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    & .swiper {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
    }
`;

const EmptyMessage = styled.div`
    width: 100%;
    padding: 24px 16px;
    border: 1px solid var(--color--gray-6);
    border-radius: 0;
    background: #fff;
    text-align: center;
    font-size: 14px;
    color: var(--color--gray-4);
`;

export default function ProductCarousel({
    title,
    categoryKey,
    categoryKeys = [],
    limit = 10,
    excludeSlug = null,
    excludeId = null
}) {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const compositeKeys = React.useMemo(() => {
        const set = new Set();
        if (categoryKey) set.add(categoryKey);
        if (Array.isArray(categoryKeys)) {
            categoryKeys.forEach((key) => { if (key) set.add(key); });
        }
        return Array.from(set);
    }, [categoryKey, categoryKeys]);

    const keySignature = React.useMemo(() => compositeKeys.join('|'), [compositeKeys]);

    const carouselUid = React.useMemo(() => Math.random().toString(36).slice(2, 8), []);
    const prevClass = `carousel-prev-${carouselUid}`;
    const nextClass = `carousel-next-${carouselUid}`;

    const load = React.useCallback(async ({ mountedRef }) => {
        if (!compositeKeys.length) {
            if (mountedRef.current) setItems([]);
            return;
        }
        setLoading(true);
        try {
            const [primary, ...rest] = compositeKeys;
            // Busca TODOS os produtos da categoria (sem limite)
            let data = await fetchTopProducts({ limit: 9999, category: primary, categories: rest });
            // Exclui produto atual se informado
            if (excludeSlug || excludeId) {
                const exSlug = (excludeSlug && String(excludeSlug)) || null;
                const exId = excludeId || null;
                data = (data || []).filter(p => {
                    const pid = p.id ?? null;
                    const pslug = p.slug ?? null;
                    if (exId && pid && pid === exId) return false;
                    if (exSlug && pslug && String(pslug) === String(exSlug)) return false;
                    return true;
                });
            }
            
            // Embaralha os produtos aleatoriamente
            const shuffled = data.sort(() => Math.random() - 0.5);
            
            // Pega apenas os primeiros 12 produtos embaralhados
            const sliced = shuffled.slice(0, limit);
            
            if (mountedRef.current) setItems(sliced);
        } catch (error) {
            console.error('Falha ao carregar produtos do carrossel', error);
            if (mountedRef.current) setItems([]);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [compositeKeys, limit, excludeSlug, excludeId]);

    React.useEffect(() => {
        const mountedRef = { current: true };
        load({ mountedRef });
        return () => { mountedRef.current = false; };
    }, [load]);

    React.useEffect(() => {
        const mountedRef = { current: true };
        const onFocus = () => mountedRef.current && load({ mountedRef });
        const onVisibility = () => {
            if (document.visibilityState === 'visible') onFocus();
        };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            mountedRef.current = false;
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [load]);

    const heading = title || compositeKeys[0] || 'Produtos';
    const hasItems = items.length > 0;

    return (
        <>
            <Container>
                <Text>
                    <button
                        className={`carousel-nav prev ${prevClass}`}
                        type="button"
                        aria-label={`Voltar ${heading}`}
                        disabled={!hasItems}
                    >
                        <ArrowLeftIcon />
                    </button>
                    <h1>{heading}</h1>
                    <button
                        className={`carousel-nav next ${nextClass}`}
                        type="button"
                        aria-label={`Avançar ${heading}`}
                        disabled={!hasItems}
                    >
                        <ArrowRightIcon />
                    </button>
                </Text>
                {hasItems ? (
                    <Carousel>
                        <Swiper
                            modules={[Navigation, A11y, Autoplay]}
                            loop={true}
                            navigation={{
                                nextEl: `.${nextClass}`,
                                prevEl: `.${prevClass}`,
                            }}
                            autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
                            slidesPerView={2}
                            breakpoints={{
                                320: { slidesPerView: 2, spaceBetween: 8 },
                                480: { slidesPerView: 2, spaceBetween: 8 },
                                768: { slidesPerView: 3, spaceBetween: 12 },
                                1024: { slidesPerView: 4, spaceBetween: 12 },
                            }}
                            lazyPreloadPrevNext={1}
                        >
                            {items.map((product, index) => (
                                <SwiperSlide key={product.id || product.slug || index}>
                                    <ProductCard product={product} wishlist={product.wishlist} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Carousel>
                ) : (
                    <>
                        {loading ? (
                            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <ProductCardSkeleton key={`pc-s-${i}`} />
                                ))}
                            </div>
                        ) : (
                            <EmptyMessage>Sem produtos cadastrados nesta categoria por enquanto.</EmptyMessage>
                        )}
                    </>
                )}
            </Container>
        </>
    );
}
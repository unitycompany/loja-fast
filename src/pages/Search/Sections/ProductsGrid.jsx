import styled from "styled-components";
import Breadcrumbs from "../../../components/navigation/Breadcrumbs";

import ProductCard from "../../../components/product/ProductCard";
import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import React from 'react'
import { fetchProducts, suggestProducts } from '../../../services/productService'
import { useSearch as useSmartSearch } from '../../../hooks/useSearch'
import { fetchCategories } from '../../../services/categoryService'
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Loader from '../../../components/common/Loader'
import Skeleton from '../../../components/common/Skeleton'

const Container = styled.div`
    height: auto;
    width: 75%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    margin-top: 0px;
    gap: 26px;

    @media (max-width: 768px) {
        margin-top: 60px;
        width: 100%;
        gap: 2px;
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
        padding: 5%;
    }

    & h1 {
        font-size: 32px;
        font-weight: 500;
        line-height: 100%;

        @media (max-width: 768px) {
            font-size: 26px;
        }
    }
`

const MobileFilterBar = styled.button`
    display: none;
    width: calc(100%);
    padding: 2.5% 5%;
    background: var(--color--white);
    box-shadow: var(--border-full);
    color: var(--color-black);
    font-size: var(--text-sm);
    cursor: pointer;
    text-align: left;
    border-radius: 0;
    display: none;
    align-items: center;
    justify-content: space-between;

    .left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }

    .title {
        font-weight: 600;
    }

    .subtitle {
        font-size: 12px;
        color: var(--color--gray-4);
    }

    .count {
        background: var(--color--primary);
        color: var(--color--white);
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        font-weight: 600;
        font-size: 12px;
    }

    @media (max-width: 768px) {
        display: flex;
    }
`;

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
        padding: 5%;
    }
`

const Pagination = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    height: 40px;
    

    & button {
        background: var(--color--white);
        border: 1px solid var(--color--gray-6);
        color: var(--color-black-2);
        padding: 6px 10px;
        height: 100%;
        cursor: pointer;
        border-radius: 0;
        min-width: 36px;
    }

    & button.active {
        background: var(--color--primary);
        color: var(--color--white);
        border-color: var(--color--primary);
        font-weight: 600;
    }

    @media (max-width: 420px) {
        gap: 6px;
        & button { padding: 6px 8px; min-width: 30px; }
    }
`;

const normalizeKey = (value) => {
    if (!value) return null
    return String(value).trim().toLowerCase()
}

export default function ProductsGrid({
    searchInput = "Pesquisa",
    setFilterOpen
}) {
    const smartSearch = useSmartSearch()
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const containerRef = useRef(null);

    // sync with URL if it changes externally (back/forward or direct link)
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10) || 1;
        if (pageFromUrl !== currentPage) {
            setCurrentPage(Math.min(Math.max(1, pageFromUrl), totalPages));
            // scroll into view when URL-driven change happens
            if (containerRef.current) {
                containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    const perPage = 9;
    const [totalPages, setTotalPages] = React.useState(1)
    const [visibleProducts, setVisibleProducts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [suggestions, setSuggestions] = React.useState([])
    const [categoryIndex, setCategoryIndex] = React.useState({})

    React.useEffect(() => {
        let mounted = true
        fetchCategories()
            .then((rows) => {
                if (!mounted) return
                const index = {}
                for (const row of rows || []) {
                    const key = normalizeKey(row.slug || row.id)
                    if (key) index[key] = { ...row }
                    if (Array.isArray(row.children)) {
                        for (const child of row.children) {
                            const childKey = normalizeKey(child.slug || child.id)
                            if (childKey) index[childKey] = { ...child, parent: row }
                        }
                    }
                }
                setCategoryIndex(index)
            })
            .catch(console.error)
        return () => { mounted = false }
    }, [])

    // Função de carregamento extraída para permitir revalidação em foco/visibilidade
    const load = React.useCallback(async ({ mountedRef }) => {
        const q = searchParams.get('q') || null
        const brand = searchParams.get('brand') || null
        const category = searchParams.get('category') || null
        const subcategory = searchParams.get('subcategory') || null
        try {
            setLoading(true)
            const { data, count } = await fetchProducts({ page: currentPage, perPage, q, brand, category, subcategory })
            if (mountedRef.current === false) return
            const serverItems = data || []
            const serverCount = count || 0
            if (serverItems.length === 0 && q) {
                // Smart client-side fallback: diacritics/plural-insensitive fuzzy match
                try {
                    const fallback = await smartSearch.searchFallback(q, { limit: perPage, brand, category, subcategory })
                    if (mountedRef.current === false) return
                    if ((fallback || []).length > 0) {
                        setVisibleProducts(fallback)
                        setTotalPages(1)
                        setSuggestions([])
                        setLoading(false)
                        return
                    }
                } catch (e) {
                    console.error('smart search fallback failed', e)
                }
            }
            setVisibleProducts(serverItems)
            setTotalPages(Math.max(1, Math.ceil(serverCount / perPage)))
            setLoading(false)
            if (serverItems.length === 0 && q) {
                try {
                    const s = await suggestProducts(q, { limit: 6 })
                    if (mountedRef.current === false) return
                    setSuggestions(s)
                } catch (e) { console.error(e) }
            } else {
                setSuggestions([])
            }
        } catch (err) {
            console.error(err)
            if (mountedRef.current === false) return
            setVisibleProducts([])
            setLoading(false)
            if (q) {
                try {
                    const s = await suggestProducts(q, { limit: 6 })
                    if (mountedRef.current === false) return
                    setSuggestions(s)
                } catch (e) { console.error(e) }
            }
        }
    }, [currentPage, perPage, searchParams])

    React.useEffect(() => {
        const mountedRef = { current: true }
        load({ mountedRef })
        return () => { mountedRef.current = false }
    }, [load])

    // Revalidar ao focar a aba ou quando a visibilidade mudar (evita dados "congelados")
    React.useEffect(() => {
        const mountedRef = { current: true }
        const onFocus = () => mountedRef.current && load({ mountedRef })
        const onVisibility = () => {
            if (document.visibilityState === 'visible') onFocus()
        }
        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            mountedRef.current = false
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [load])

    const goToPage = (page, replace = false) => {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        setCurrentPage(page);
        // update querystring with new page
        const nextParams = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            nextParams.delete('page');
        } else {
            nextParams.set('page', String(page));
        }
        if (replace) setSearchParams(nextParams, { replace: true }); else setSearchParams(nextParams);
        // scroll the container into view (go to start) after page change
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const categoryParam = searchParams.get('category')
    const subcategoryParam = searchParams.get('subcategory')

    const currentCategory = React.useMemo(() => {
        const key = normalizeKey(categoryParam)
        if (!key) return null
        return categoryIndex[key] || null
    }, [categoryIndex, categoryParam])

    const currentSubcategory = React.useMemo(() => {
        const key = normalizeKey(subcategoryParam)
        if (!key) return null
        return categoryIndex[key] || null
    }, [categoryIndex, subcategoryParam])

    const heading = React.useMemo(() => {
        const q = searchParams.get('q')
        if (q) return `Resultados para "${q}"`
        if (currentSubcategory && currentSubcategory.name) {
            return `${currentSubcategory.parent?.name || currentCategory?.name || 'Categoria'} / ${currentSubcategory.name}`
        }
        if (currentCategory && currentCategory.name) {
            return `Produtos em ${currentCategory.name}`
        }
        return searchInput
    }, [searchParams, currentCategory, currentSubcategory, searchInput])

    const breadcrumbPages = React.useMemo(() => {
        const pages = [{ route: 'Pesquisa', link: 'pesquisa' }]
        if (currentCategory && currentCategory.slug) {
            pages.push({ route: currentCategory.name || currentCategory.slug, link: `pesquisa?category=${encodeURIComponent(currentCategory.slug)}` })
        }
        if (currentSubcategory && currentSubcategory.slug) {
            pages.push({ route: currentSubcategory.name || currentSubcategory.slug, link: `pesquisa?category=${encodeURIComponent(categoryParam || currentCategory?.slug || '')}&subcategory=${encodeURIComponent(currentSubcategory.slug)}` })
        }
        return pages
    }, [currentCategory, currentSubcategory, categoryParam])

    // Build a condensed range: show first, last, current +/- 1, and ellipses where needed
    const getPageRange = () => {
        const delta = 1; // neighbours
        const range = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
            return range;
        }

        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);

        range.push(1);
        if (left > 2) range.push('left-ellipsis');

        for (let i = left; i <= right; i++) range.push(i);

        if (right < totalPages - 1) range.push('right-ellipsis');
        range.push(totalPages);
        return range;
    }
    return (
        <>
            <Container ref={containerRef} data-aos="fade-up">
                <Texts>
                    <Breadcrumbs 
                        pages={breadcrumbPages}
                    />
                    <h1>{heading}</h1>
                </Texts>
                {/* Mobile filter bar — visible only on small screens, placed between Texts and Content */}
                <MobileFilterBar onClick={() => setFilterOpen && setFilterOpen(true)}>
                    <div className="left">
                        <div className="title">Filtrar</div>
                        <div className="subtitle">Refinar resultados</div>
                    </div>
                    <div className="count">{loading ? '...' : visibleProducts.length}</div>
                </MobileFilterBar>
                <Content>
                    {loading ? (
                        <>
                            <Loader label="Carregando resultados..." />
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={`s-${i}`} style={{ width: '100%', padding: 12 }}>
                                    <Skeleton width="100%" height={180} />
                                    <div style={{ height: 8 }} />
                                    <Skeleton width="60%" height={16} />
                                    <div style={{ height: 6 }} />
                                    <Skeleton width="90%" height={16} />
                                </div>
                            ))}
                        </>
                    ) : null}
                    {(!loading && visibleProducts.length === 0) ? (
                        <div style={{ padding: '2.5%', width: '100%' }}>
                            <h3>Nenhum resultado encontrado</h3>
                            {suggestions && suggestions.length > 0 ? (
                                <>
                                    <p>Talvez você esteja procurando:</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                        {suggestions.map(s => (
                                            <ProductCard key={s.slug} product={s} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p>Tente usar palavras-chave diferentes ou verifique a ortografia.</p>
                            )}
                        </div>
                    ) : (
                        visibleProducts.map((product) => (
                            <ProductCard 
                                key={product.slug}
                                product={product}
                            />
                        ))
                    )}
                </Content>

                <Pagination>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                    >
                        <ArrowLeftIcon />
                    </button>

                    {getPageRange().map((item, idx) => {
                        if (item === 'left-ellipsis' || item === 'right-ellipsis') {
                            return <button key={item + idx} disabled style={{ cursor: 'default' }}>...</button>
                        }
                        return (
                            <button
                                key={item}
                                className={item === currentPage ? 'active' : ''}
                                onClick={() => goToPage(item)}
                                aria-current={item === currentPage ? 'page' : undefined}
                            >
                                {item}
                            </button>
                        )
                    })}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Próxima página"
                    >
                        <ArrowRightIcon />
                    </button>
                </Pagination>
            </Container>
        </>
    )
}
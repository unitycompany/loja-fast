import styled from "styled-components";
import { useMemo, useState } from "react";
import { fetchCategories } from '../../../services/categoryService'
import { fetchBrands } from '../../../services/brandService'
import { resolveImageUrl, supabase } from '../../../services/supabase'
import { localBrandLogo } from '../../../utils/image'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { XIcon } from "@phosphor-icons/react/dist/ssr";

// marcas destacadas — we'll compute after fetching brands

const FilterContainer = styled.div`
    width: 25%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;
    background-color: var(--color--white);
    box-shadow: var(--border-full);
    position: sticky;
    top: 70px;

    @media (max-width: 768px) {
        display: none;
    }
`;

/* Mobile sidebar — controlled by parent via props */
const Sidebar = styled.div`
    position: fixed;
    top: 60px;
    right: 0;
    width: 80%;
    height: calc(100% - 60px);
    background: var(--color--white);
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
    display: ${props => props.open ? 'flex' : 'none'};
    box-shadow: var(--border-full);
    flex-direction: column;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;

    & button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;
        border-radius: 0;
        box-shadow: var(--border-bottom);
    }
`;

/* Ensure Sidebar is hidden on desktop (desktop uses FilterContainer) */
Sidebar.displayName = 'SidebarStyled';

const SidebarMedia = styled(Sidebar)`
    @media (min-width: 769px) {
        display: none !important;
    }
`;

/* Mobile overlay shown behind the Sidebar */
const Overlay = styled.div`
    display: ${props => props.open ? 'block' : 'none'};
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100% - 60px);
    background: rgba(0,0,0,0.4);
    z-index: 900; /* less than Sidebar's 1000 so sidebar stays on top */

    @media (min-width: 769px) {
        display: none; /* hide overlay on desktop */
    }
`;

const Section = styled.div`
    display: flex;
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid var(--color--gray-6);
    padding-bottom: 15px;

    &:last-child {
        border-bottom: none;
    }
`;

const SectionTitle = styled.h3`
    font-size: var(--text-lg);
    font-weight: 400;
    color: var(--color-black);
    font-family: var(--font-sans);
    margin: 0;
`;

const CheckboxGroup = styled.div`
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    height: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 6px;
`;

// removed duplicate SubCategory (kept later declaration)

const BrandsGrid = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 6px;
`;

const BrandItem = styled.label`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 8px 6px;
    background: var(--color--white-2);
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--color-black-2);
    width: 100%;

    &:hover {
        border-color: var(--color--gray-3);
    }

    input[type="checkbox"] {
        accent-color: var(--color--primary);
        width: 12px;
        height: 12px;
        margin: 0;
    }

`;

const BrandLogo = styled.div`
    width: 22px;
    height: 22px;
    background: var(--color--gray-5);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }
`;

const BrandName = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1;
    font-size: 12px;
`;

/* Categoria styles */
const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch; /* allow children to take full width */
    width: 100%;
`;

const CategoryItem = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: var(--color-black-2);
    gap: 8px;
    padding: 4px 8px;
    box-sizing: border-box;
    position: relative;
    box-shadow: var(--border-full);

    & div {
        font-size: 14px;
        white-space: nowrap;
    }

    &:hover {
        background: var(--color--white-2);
    }
`;

const CategoryLeft = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
`;

const CountBadge = styled.span`
    background: var(--color--gray-6);
    color: var(--color-black-4);
    padding: 2px 6px;
    font-size: 12px;
    position: absolute;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
`;

const SubCategory = styled.div`
    margin-left: 16px;
    width: calc(100% - 16px);
    margin-top: 4px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    white-space: nowrap;
`;

export default function Filter({ open, setOpen }) {
    const [categories, setCategories] = useState([])
    const [brands, setBrands] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        let mounted = true
        fetchCategories({ includeEmpty: false }).then(c => { if (mounted) setCategories(Array.isArray(c) ? c : []) }).catch(console.error)
        ;(async () => {
            try {
                const list = await fetchBrands({ includeEmpty: false })
                if (mounted && Array.isArray(list) && list.length > 0) {
                    setBrands(list)
                    return
                }
                // UI fallback: derive brands from products if service returned none
                const { data: prods, error } = await supabase.from('products').select('brand_slug, brandName, brand, imageBrand')
                if (error) throw error
                const map = new Map()
                for (const p of prods || []) {
                    const name = (p.brandName) || (p.brand && typeof p.brand === 'object' ? (p.brand.companyName || p.brand.name) : null)
                    const slug = (p.brand && typeof p.brand === 'object' ? p.brand.slug : null) || p.brand_slug || (name ? name.toLowerCase() : null)
                    const key = slug || name?.toLowerCase()
                    if (!key) continue
                    const prev = map.get(key) || { id: slug || name || key, slug, companyName: name || slug || key, numberProducts: 0, imageCompany: null }
                    prev.numberProducts += 1
                    if (!prev.imageCompany) prev.imageCompany = p.imageBrand || (p.brand && typeof p.brand === 'object' ? (p.brand.logo || null) : null) || localBrandLogo(slug || name)
                    if (!prev.slug && slug) prev.slug = slug
                    if (!prev.companyName && name) prev.companyName = name
                    map.set(key, prev)
                }
                const derived = [...map.values()].filter(b => (b.numberProducts || 0) > 0)
                if (mounted) setBrands(derived)
            } catch (e) {
                console.error('[Filter] Falha ao carregar marcas (serviço e fallback):', e)
                if (mounted) setBrands([])
            }
        })()
        return () => { mounted = false }
    }, [])

    const [brandImages, setBrandImages] = useState({})
    useEffect(() => {
        let mounted = true
        async function load() {
            const map = {}
            await Promise.all((brands || []).map(async (brand) => {
                const raw = brand.imageCompany || (brand._raw && (brand._raw.imageCompany || (brand._raw.meta && (brand._raw.meta.logoUrl || brand._raw.meta.logo)))) || localBrandLogo(brand.slug || brand.companyName)
                try {
                    map[brand.id] = raw ? (await resolveImageUrl(raw)) || raw : ''
                } catch (e) {
                    map[brand.id] = raw || ''
                }
            }))
            if (mounted) setBrandImages(map)
        }
        if ((brands || []).length) load()
        return () => { mounted = false }
    }, [brands])

    const normalizer = useMemo(() => (value) => {
        if (!value) return null
        return String(value).trim().toLowerCase()
    }, [])

    useEffect(() => {
        const currentCategorySlug = normalizer(searchParams.get('category'))
        const currentSubcategorySlug = normalizer(searchParams.get('subcategory'))
        const currentBrandSlug = normalizer(searchParams.get('brand'))

        const matchCategory = categories.find((category) => {
            const categorySlug = normalizer(category.slug || category.id)
            return categorySlug && categorySlug === currentCategorySlug
        })

        const matchSubcategory = matchCategory && (matchCategory.children || []).find((child) => {
            const childSlug = normalizer(child.slug || child.id)
            return childSlug && childSlug === currentSubcategorySlug
        })

        if (matchCategory) {
            setSelectedCategory(matchCategory.id)
        } else {
            setSelectedCategory(null)
        }

        if (matchSubcategory) {
            setSelectedSubcategory(matchSubcategory.id)
        } else {
            setSelectedSubcategory(null)
        }

        const matchBrand = brands.find((brand) => {
            const slug = normalizer(brand.slug || brand.id)
            return slug && slug === currentBrandSlug
        })

        if (matchBrand) {
            setSelectedBrands([matchBrand.id])
        } else {
            setSelectedBrands([])
        }
    }, [categories, brands, searchParams, normalizer])

    const featuredBrands = useMemo(() => (
        (brands || [])
            .slice()
            .sort((a, b) => (b.numberProducts || 0) - (a.numberProducts || 0))
            .slice(0, 6)
    ), [brands])
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedBrands, setSelectedBrands] = useState([]);

    const handleCategorySelect = (category) => {
        // toggle category: if selecting a new one, close previous and clear subcategory
        const id = category?.id
        const slug = category?.slug
        if (selectedCategory === id) {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            const params = new URLSearchParams(searchParams.toString())
            params.delete('category')
            params.delete('page')
            setSearchParams(params)
        } else {
            setSelectedCategory(id);
            setSelectedSubcategory(null);
            const params = new URLSearchParams(searchParams.toString())
            if (slug) params.set('category', slug)
            else params.set('category', id)
            params.delete('page')
            setSearchParams(params)
        }
    };

    const handleBrandChange = (brandObj) => {
        const id = brandObj?.id
        const slug = brandObj?.slug
        setSelectedBrands(prev => {
            const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
            const params = new URLSearchParams(searchParams.toString())
            if (next.length) params.set('brand', slug || next[0])
            else params.delete('brand')
            params.delete('page')
            setSearchParams(params)
            return next
        })
    };

    const handleSubcategorySelect = (category, sub) => {
        const id = sub?.id
        const slug = sub?.slug
        const next = selectedSubcategory === id ? null : id
        setSelectedSubcategory(next)
        const params = new URLSearchParams(searchParams.toString())
        if (next) params.set('subcategory', slug || id)
        else params.delete('subcategory')
        params.delete('page')
        setSearchParams(params)
    };

    const FilterContent = () => (
        <>
            <Section>
                <SectionTitle>Categorias</SectionTitle>
                <CategoryList>
                    {(Array.isArray(categories) ? categories : []).map(category => (
                        <div key={category.id}>
                            <CategoryItem
                                onClick={() => handleCategorySelect(category)}
                                style={{ background: selectedCategory === category.id ? 'var(--color--white-2)' : 'transparent' }}
                            >
                                <CategoryLeft>
                                    <div>{category.name}</div>
                                </CategoryLeft>
                                <CountBadge>{category.numberProducts || 0}</CountBadge>
                            </CategoryItem>

                            {selectedCategory === category.id && (category.children || []).length > 0 && (
                                <div>
                                    {category.children.map(sub => (
                                        <SubCategory key={sub.id}>
                                            <CategoryItem
                                                onClick={() => handleSubcategorySelect(category, sub)}
                                                style={{ background: selectedSubcategory === sub.id ? 'var(--color--white-2)' : 'transparent' }}
                                            >
                                                <CategoryLeft>
                                                    <div>{sub.name}</div>
                                                </CategoryLeft>
                                                <CountBadge>{sub.numberProducts || 0}</CountBadge>
                                            </CategoryItem>
                                        </SubCategory>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </CategoryList>
            </Section>
            <Section>
                <SectionTitle>Marcas</SectionTitle>
                <CheckboxGroup>
                    <BrandsGrid>
                        {featuredBrands.map(brand => (
                            <BrandItem key={brand.id} htmlFor={`brand-${brand.id}`}>
                                <input
                                    id={`brand-${brand.id}`}
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand.id)}
                                    onChange={() => handleBrandChange(brand)}
                                />
                                    <BrandLogo>
                                    {(brandImages[brand.id] || brand.imageCompany) ? (
                                        <img src={brandImages[brand.id] || brand.imageCompany} alt={brand.companyName} />
                                    ) : (
                                        <div>{(brand.companyName && brand.companyName[0]) || ''}</div>
                                    )}
                                </BrandLogo>
                                <BrandName>
                                    <div style={{fontWeight: 600, color: 'var(--color-black-2)'}}>{brand.companyName}</div>
                                    <div style={{fontSize: '12px', color: 'var(--color--gray)'}}>{brand.numberProducts || 0} produtos</div>
                                </BrandName>
                            </BrandItem>
                        ))}
                    </BrandsGrid>
                </CheckboxGroup>
            </Section>
        </>
    );

    return (
        <>
            <FilterContainer>
                <FilterContent />
            </FilterContainer>
            {/* overlay for mobile - clicking it closes the sidebar */}
            <Overlay open={open} onClick={() => setOpen(false)} />

            <SidebarMedia open={open}>
                <button 
                    onClick={() => setOpen(false)}
                >
                    Fechar
                    <XIcon />
                </button>
                <FilterContent />
            </SidebarMedia>
        </>
    );
}
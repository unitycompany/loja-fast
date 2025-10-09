import { HeartIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import styled, { css } from "styled-components";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchBrands } from '../../services/brandService'
import { resolveImageUrl } from '../../services/supabase'

const Container = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    z-index: 1000;
    pointer-events: none; /* default off, enabled when open */

    ${props => props.$isOpen && css`
        pointer-events: auto;
    `}

    @media (max-width: 768px) {
        align-items: flex-end;   
    }
`

const Bg = styled.div`
    position: fixed;
    z-index: -1;
    background-color: rgba(0, 0, 0, 0.6);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 200ms ease;

    ${props => props.$isOpen && css`
        opacity: 1;
    `}
`

const Main = styled.div`
    width: auto;
    min-width: 700px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    border-radius: 28px;
    background-color: var(--color--white-2);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
    transform: translateY(400px);
    opacity: 0;
    transition: all 220ms ease-in-out;

    @media (max-width: 768px) {
        min-width: auto;
        width: 90%;
        border-radius: 28px 28px 0 0;
        padding-bottom: 16px;
    }

    ${props => props.$isOpen && css`
        transform: translateY(0);
        opacity: 1;
    `}
`

const Search = styled.div`
    box-shadow: var(--border-full);
    background: var(--color--white);
    border-radius: 28px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    gap: 8px;
    box-shadow: var(--border-full);

    @media (max-width: 768px) {
        padding: 8px 12px;       
        border-radius: 22px;
    }

    & svg {
        font-size: 20px;

        @media (max-width: 768px) {
            font-size: 16px;
        }
    }

    & input {
        border: none;
        width: 100%;
        font-size: 16px;
        outline: none;
        background: transparent;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        box-shadow: none;

        &::placeholder {
            color: var(--color--gray);
            font-size: 16px;
            font-weight: 300;

            @media (max-width: 768px) {
                font-size: 14px;
            }
        }

        /* Remove the default focus ring in most browsers */
        &:focus,
        &:focus-visible {
            border: none;
            outline: none;
            box-shadow: none;
        }

        /* Safari: remove clear/search decoration that can show a focus ring */
        &::-webkit-search-decoration,
        &::-webkit-search-cancel-button,
        &::-webkit-search-results-button,
        &::-webkit-search-results-decoration {
            -webkit-appearance: none;
        }
    }
`

const Quicks = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    gap: 4px;

    @media (max-width: 768px) {
        display: none;
    }

    & span {
        display: contents;
        font-size: 12px;
        color: var(--color--gray);

        & b {
            font-size: 16px;
            white-space: nowrap;
            font-weight: 600;
            color: var(--color--black-2);
        }
    }
`

const Content = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 16px;
    background: var(--color--white);
    box-shadow: var(--border-full);
    padding: 16px;
    border-radius: 22px;
`

const BrandImg = styled.img`
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50px;
    background-color: ${props => props.$bgColor ? `${props.$bgColor}20` : 'var(--color--white)'};

    @media (max-width: 768px) {
        width: 32px;
        height: 32px;
    }
`

const Item = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    padding: 0 0 18px 0;
    box-shadow: var(--border-bottom);

    &:last-child {
        box-shadow: none;
        padding: 0;
    }

    & h2 {
        font-size: 16px;
        font-weight: 500;
        color: var(--color--black);
    }

    & ul {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: auto;
        gap: 8px;
    }

    & .search-list{
        flex-direction: row;
        justify-content: flex-start;

        @media (max-width: 768px) {
            flex-wrap: wrap;
        }

        & li {
            font-size: 14px;
            padding: 6px 12px;
            box-shadow: var(--border-full);
            cursor: pointer;
            border-radius: 24px;

            @media (max-width: 768px) {
                font-size: 12px;
            }
        }
    }

    & .search-companys {
        flex-direction: column;

        & li {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 0px;
            cursor: pointer;
            border-radius: 28px;
            transition: all .2s ease-in-out;

            &:hover {
                background-color: var(--color--gray-6);
                padding: 8px;

                & div:nth-child(2) span {
                    background-color: var(--color--gray-5);
                }
            }

            & div {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;

                &:nth-child(1){


                    /* Brand image styles moved to a dedicated BrandImg component */

                    & span {
                        font-size: 18px;
                        font-weight: 500;

                        @media (max-width: 768px) {
                            font-size: 16px;
                        }
                    }
                }

                &:nth-child(2){

                    & span {
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 500;
                        padding: 8px 12px;
                        line-height: 100%;
                        background-color: var(--color--gray-6);
                        color: var(--color--black-2);
                        border-radius: 24px;
                        transition: all .2s ease-in-out;

                        @media (max-width: 768px) {
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }
`

export default function SearchContainer({
    bgColor,
    companyName,
    numberProducts,
    imageCompany,
    isOpen = false,
    onClose = () => {}
}) {
    const [brands, setBrands] = useState([])
    const [brandsLoading, setBrandsLoading] = useState(true)
    const [inputValue, setInputValue] = useState('')
    const [, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    useEffect(() => {
        let mounted = true
        setBrandsLoading(true)
        fetchBrands().then(b => { if (mounted) setBrands(b) }).catch(console.error).finally(() => { if (mounted) setBrandsLoading(false) })
        return () => { mounted = false }
    }, [])
    const [brandImages, setBrandImages] = useState({})

    useEffect(() => {
        let mounted = true
        async function load() {
            const map = {}
            await Promise.all((brands || []).map(async (brand) => {
                const key = brand.id ?? brand.companyName
                try {
                    map[key] = await resolveImageUrl(brand.imageCompany)
                } catch (e) {
                    map[key] = brand.imageCompany
                }
            }))
            if (mounted) setBrandImages(map)
        }
        if ((brands || []).length) load()
        return () => { mounted = false }
    }, [brands])

    // Debounced input filtering for suggestions
    const [debouncedInput, setDebouncedInput] = useState(inputValue)
    useEffect(() => {
        const t = setTimeout(() => setDebouncedInput(inputValue.trim()), 200)
        return () => clearTimeout(t)
    }, [inputValue])

    const filteredBrands = (debouncedInput ? (brands || []).filter(b => (b.companyName || b.name || '').toLowerCase().includes(debouncedInput.toLowerCase())) : brands || []).slice(0, 6)
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape' && isOpen) onClose();
        }

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    return (
        <>
            <Container $isOpen={isOpen} aria-hidden={!isOpen}>
                <Bg $isOpen={isOpen} onClick={onClose} />
                <Main $isOpen={isOpen} role="dialog" aria-modal="true">
                    <Search>
                        <MagnifyingGlassIcon />
                        <input autoFocus={isOpen} type="search" id="search" placeholder="Busque por drywall, steel frame, cantoneira..." value={inputValue} onChange={(e)=> setInputValue(e.target.value)} onKeyDown={(e)=>{
                            if (e.key === 'Enter') {
                                const q = inputValue.trim()
                                const params = new URLSearchParams()
                                if (q) params.set('q', q)
                                // navigate to the search page route so the Search component renders (client-side)
                                const href = q ? `/pesquisa?${params.toString()}` : '/pesquisa'
                                navigate(href)
                                onClose()
                            }
                        }} />
                        <Quicks>
                            <span>press <b>Enter ↵</b></span>
                        </Quicks>
                    </Search>
                    <Content>
                        <Item>
                            <h2>Pesquise por</h2>
                            <ul className="search-list">
                                <li onClick={() => { navigate('/pesquisa?q=Drywall'); onClose() }}>Drywall</li>
                                <li onClick={() => { navigate('/pesquisa?q=Steel%20Frame'); onClose() }}>Steel Frame</li>
                                <li onClick={() => { navigate('/pesquisa?q=Pisos%20vin%C3%ADlicos'); onClose() }}>Pisos vinílicos</li>
                                <li onClick={() => { navigate('/pesquisa?q=Casas%20pr%C3%A9-fabricadas'); onClose() }}>Casas pré-fabricadas</li>
                            </ul>
                        </Item>
                        <Item>
                            <h2>Navegue por marcas</h2>
                            <ul className="search-companys">
                                {
                                    brandsLoading ? (
                                        // simple skeletons while loading
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <li key={`skeleton-${i}`}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                    <div style={{width: 40, height: 40, borderRadius: 9999, background: 'var(--color--gray-5)'}} />
                                                    <div style={{width: 120, height: 12, background: 'var(--color--gray-5)', borderRadius: 6}} />
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        (filteredBrands || []).map((brand) => (
                                            <li 
                                                key={brand.id}
                                                onClick={() => { navigate(`/pesquisa?brand=${encodeURIComponent(brand.slug || brand.companyName || brand.id)}`); onClose() }}
                                            >
                                                <div>
                                                    { (brandImages[brand.id] || brand.imageCompany) ? (
                                                        <BrandImg src={brandImages[brand.id] || brand.imageCompany} alt={brand.companyName} $bgColor={brand.bgColor} />
                                                    ) : (
                                                        <BrandImg as="div" $bgColor={brand.bgColor} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600}}>
                                                            {brand.companyName ? brand.companyName.charAt(0) : ''}
                                                        </BrandImg>
                                                    ) }
                                                    <span>{brand.companyName}</span>
                                                </div>
                                                <div>
                                                    <span>{brand.numberProducts || 0} produtos</span>
                                                </div>
                                            </li>
                                        ))
                                    )
                                }
                            </ul>
                        </Item>
                    </Content>
                </Main>
            </Container>
        </>
    )
}
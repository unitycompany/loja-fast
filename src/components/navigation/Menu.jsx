import styled, {css} from "styled-components";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import { fetchCategories } from '../../services/categoryService'
import { XIcon, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

const Container = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    z-index: 100;
    pointer-events: none; /* default off, enabled when open */

    ${props => props.$isOpen && css`
        pointer-events: auto;
    `}

    @media (max-width: 768px) {
        align-items: flex-end;   
    }
`

// const Bg = styled.div`
//     position: fixed;
//     z-index: -1;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     opacity: 0;
//     transition: opacity 200ms ease;
//     background-color: rgba(0,0,0,0.2);

//     ${props => props.$isOpen && css`
//         opacity: 1;
//     `}
// `

const Main = styled.div`
    width: 100%;
    height: auto;
    min-height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: absolute;
    top: 70px;
    gap: 12px;
    background-color: var(--color--white);
    transform: scale(0);
    color: var(--color--black);
    opacity: 0;
    box-shadow: var(--border-full);
    overflow: auto;

    @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
        top: 60px;
        min-height: calc(100vh - 60px);
    }

    ${props => props.$isOpen && css`
        transform: scale(1);
        opacity: 1;
    `}
`

const Header = styled.header`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 2.5%;
    gap: 8px;
    cursor: pointer;

    @media (max-width: 768px) {
        padding: 2.5%;    
    }

    & span {
        font-size: 16px;
        line-height: 1.0;
        font-weight: 400;
        color: var(--color--black);

        @media (max-width: 768px) {
            font-size: 18px;
            font-weight: 400;
        }
    }

    & button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        font-size: 16px;

        & svg {
            color: var(--color--black);
        }
    }
`

const Content = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;

    @media (max-width: 768px) {
        gap: 16px;
    }

    & div {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;

        & span {
            font-size: 32px;
            font-weight: 500;
            color: var(--color--black);
            cursor: pointer;
            transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);

            @media (max-width: 768px) {
                font-size: 28px;
                line-height: 1.2;
            }

            &:hover {
                color: var(--color--primary);
            }
        }

        & .small-title {
            font-size: 32px;
            font-weight: 600;
            color: var(--color--black);
            margin-bottom: 8px;
            cursor: default;

            @media (max-width: 768px) {
                font-size: 28px;
            }
        }

        & .sublist {
            width: 100%;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);

            & ul & li {
                opacity: 0;
                transform: translateY(10px);
            }
        }

        & .sublist.open {
            max-height: 500px;
            opacity: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: var(--color--black-2);

            & ul {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 2px;
                padding: 4px 0;
                list-style: none;
                width: 100%;


                & li {
                    cursor: pointer;
                    transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    font-size: 24px;
                    font-weight: 200;
                    color: var(--color--black-2);
                    opacity: 1;
                    transform: translateY(0);
                }

                & li:nth-child(1) { transition-delay: 0ms; }
                & li:nth-child(2) { transition-delay: 50ms; }
                & li:nth-child(3) { transition-delay: 100ms; }
                & li:nth-child(4) { transition-delay: 150ms; }
                & li:nth-child(5) { transition-delay: 200ms; }
                & li:nth-child(6) { transition-delay: 250ms; }
                & li:nth-child(7) { transition-delay: 300ms; }
                & li:nth-child(8) { transition-delay: 350ms; }
                & li:nth-child(9) { transition-delay: 400ms; }
                & li:nth-child(10) { transition-delay: 450ms; }
            }
        }
    }
`

export default function Menu({
    isOpen = false,
    onClose = () => {}
}) {
    const navigate = useNavigate()
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape' && isOpen) onClose();
        }

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const [openCategory, setOpenCategory] = useState(null);
    const [categories, setCategories] = useState([])

    useEffect(() => {
        let mounted = true
        fetchCategories({ includeEmpty: false }).then(c => { if (mounted) setCategories(Array.isArray(c) ? c : []) }).catch(console.error)
        return () => { mounted = false }
    }, [])

    const selectedCategory = openCategory == null ? null : categories.find(c => c.id === openCategory);

    const toggleCategory = (id) => {
        setOpenCategory(prev => (prev === id ? null : id));
    }

    return (
        <>
            <Container $isOpen={isOpen} aria-hidden={!isOpen}>
                {/* <Bg $isOpen={isOpen} onClick={onClose} /> */}
                <Main $isOpen={isOpen} role="dialog" aria-modal="true">
                    <Header
                        onClick={() => {
                            if (openCategory) setOpenCategory(null);
                            else onClose();
                        }}
                        aria-label={openCategory ? "Voltar" : "Fechar menu"}
                    >
                        <span>{openCategory ? 'Voltar' : 'Fechar'}</span>
                        <button aria-label={openCategory ? 'Voltar' : 'Fechar'}>
                            {openCategory ? <ArrowLeft /> : <XIcon />}
                        </button>
                    </Header>
                    <Content>
                        {openCategory == null ? (
                            (Array.isArray(categories) ? categories.filter(c => (c.numberProducts || 0) > 0 || (Array.isArray(c.children) && c.children.length > 0)) : []).map((category) => (
                                <div key={category.id}>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => toggleCategory(category.id)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCategory(category.id); }}
                                        aria-expanded={openCategory === category.id}
                                    >
                                        {category.name}
                                    </span>

                                    {/* Sublist is always rendered; CSS controls visibility for smooth animation */}
                                    <aside className={`sublist ${openCategory === category.id ? 'open' : ''}`} aria-hidden={openCategory !== category.id}>
                                        <ul>
                                            <li onClick={() => { navigate(`/pesquisa?category=${encodeURIComponent(category.slug)}`); onClose(); }}>Ver tudo</li>
                                            {(Array.isArray(category.children) ? category.children : []).map((child) => (
                                                <li
                                                    key={child.id}
                                                    onClick={() => { navigate(`/pesquisa?category=${encodeURIComponent(child.slug || category.slug)}`); onClose(); }}
                                                >
                                                    {child.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </aside>
                                </div>
                            ))
                        ) : (
                            // Single-category view: small title + subcategories
                            selectedCategory && (
                                <div key={selectedCategory.id}>
                                    <span className="small-title">{selectedCategory.name}</span>
                                    <aside className={`sublist open`} aria-hidden={false}>
                                        <ul>
                                            <li onClick={() => { navigate(`/pesquisa?category=${encodeURIComponent(selectedCategory.slug)}`); onClose(); }}>Ver tudo</li>
                                            {(Array.isArray(selectedCategory.children) ? selectedCategory.children : []).map((child) => (
                                                <li
                                                    key={child.id}
                                                    onClick={() => { navigate(`/pesquisa?category=${encodeURIComponent(child.slug || selectedCategory.slug)}`); onClose(); }}
                                                >
                                                    {child.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </aside>
                                </div>
                            )
                        )}
                    </Content>
                </Main>
            </Container>
        </>
    )
}
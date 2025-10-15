import styled from 'styled-components';
import HeaderIcon from '../buttons/HeaderIcon';
import { useMemo, useState, useEffect } from 'react';
import SearchContainer from '../search/SearchContainer';

import LogoIcon from '../../assets/logotipo-fastsistemasconstrutivos-colours.svg';
import LogoComplete from '../../assets/logo-fastsistemasconstrutivos-colours.svg';
import { ListIcon, MagnifyingGlassIcon, HeartIcon, TruckIcon } from '@phosphor-icons/react/dist/ssr';
import Menu from '../navigation/Menu';
import { go } from '../../utils/url';
import { useCart } from '../../contexts/CardContext';
import useWishlist from '../../hooks/useWishlist';

const Container = styled.header`
    width: 100%;
    height: 70px;
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--border-bottom);
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    background-color: var(--color--white-2);
    transition: backdrop-filter 180ms ease, background-color 180ms ease;

    &.scrolled {
        backdrop-filter: saturate(120%) blur(4px);
        background-color: rgba(255,255,255,0.9);
    }

    @media (max-width: 768px){
        height: 60px;   
    }
`

const Logo = styled.picture`
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    padding: 0;
    padding: 10px 18px;
    border-right: var(--border-right);
    cursor: pointer;

    @media (max-width: 768px) {
        padding: 10px 10px;
    }

    img {
        width: 200px;
        object-fit: contain;
        object-position: center;

        @media (max-width: 768px) {
            width: 40px;
        }
    }
`

const Options = styled.nav`
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    gap: 0;
`

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { items: cartItems } = useCart()
    const { list: wishlistSlugs } = useWishlist()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 2)
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const cartCount = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0
        return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
    }, [cartItems])

    const wishlistCount = Array.isArray(wishlistSlugs) ? wishlistSlugs.length : 0

    function openSearch() {
        setSearchOpen(true);
    }

    function closeSearch() {
        setSearchOpen(false);
    }

    function openMenu() {
        setMenuOpen(true);
    }

    function closeMenu() {
        setMenuOpen(false);
    }
    useEffect(() => {
        const onAdd = () => {
            try {
                const el = document.getElementById('cart-button')
                if (!el) return
                el.animate([
                    { transform: 'translateY(0) scale(1)' },
                    { transform: 'translateY(-2px) scale(1.08)' },
                    { transform: 'translateY(0) scale(1)' },
                ], { duration: 320, easing: 'ease-out' })
            } catch {}
        }
        window.addEventListener('cart:add', onAdd)
        return () => window.removeEventListener('cart:add', onAdd)
    }, [])

    useEffect(() => {
        const onWish = () => {
            try {
                const el = document.getElementById('wishlist-button')
                if (!el) return
                el.animate([
                    { transform: 'translateY(0) scale(1)' },
                    { transform: 'translateY(-2px) scale(1.08)' },
                    { transform: 'translateY(0) scale(1)' },
                ], { duration: 320, easing: 'ease-out' })
            } catch {}
        }
        window.addEventListener('wishlist:add', onWish)
        return () => window.removeEventListener('wishlist:add', onWish)
    }, [])

    return (
        <>
            <Container className={scrolled ? 'scrolled' : ''}>
                <Logo onClick={() => go('/') }>
                    <source srcSet={LogoIcon} media='(max-width: 768px)'/>
                    <source srcSet={LogoComplete} media='(min-width: 769px)'/>
                    <img src={LogoComplete} alt="logo-da-fastsistemasconstrutivos" />
                </Logo>
                <Options>
                    <HeaderIcon
                        onClick={openMenu}
                        id="menu-button"
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                    >
                        <ListIcon 
                            weight="light"
                        />
                    </HeaderIcon>
                    <HeaderIcon
                        onClick={openSearch}
                        id="search-button"
                        aria-haspopup="dialog"
                        aria-expanded={searchOpen}
                    >
                        <MagnifyingGlassIcon 
                            weight="light"
                        />
                    </HeaderIcon>
                    <HeaderIcon
                        onClick={() => go('/favoritos')}
                        id="wishlist-button"
                        items={wishlistCount}
                    >
                        <HeartIcon 
                            weight="light"
                        />
                    </HeaderIcon>
                    <HeaderIcon
                        onClick={() => go('/orcamento')}
                        id="cart-button"
                        items={cartCount}
                    >
                        <TruckIcon 
                            weight="light"
                        />
                    </HeaderIcon>
                </Options>
            </Container>
            <Menu isOpen={menuOpen} onClose={closeMenu}/>
            <SearchContainer isOpen={searchOpen} onClose={closeSearch} />
        </>
    )
}
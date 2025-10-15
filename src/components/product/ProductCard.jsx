import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import useWishlist from "../../hooks/useWishlist";
import ProductIcon from "../buttons/ProductIcon";
import { ExportIcon, HeartIcon, ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "../../lib/formatters";
import { useCart } from "../../contexts/CardContext";
import { flyToTarget, emitCartAdded, emitWishlistToggled } from "../../lib/animations";
import { resolveImageUrl } from "../../services/supabase";

const Container = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    z-index: 1;
    background-color: var(--color--white);
    border: 1px solid #00000020;
    padding: 8px 8px 8px 8px;
    gap: 8px;
    /* Standardize visual height so cards align nicely across rows */
    min-height: 360px;
    @media (max-width: 768px) {
        min-height: 300px;
    }

    transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    will-change: transform;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        border-color: #00000030;
    }

    @media (hover: none), (pointer: coarse) {
        &:hover {
            transform: none;
            box-shadow: none;
            border-color: #00000020;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
        &:hover { transform: none; box-shadow: var(--border-full); }
    }
`

const Image = styled.div`
    width: 100%;
    height: var(--product-card-image-height);
    min-height: var(--product-card-image-height);
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--color--white-2);

    & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 240ms ease;
        border: 1px solid var(--color--gray-6);
    }

    ${Container}:hover & img {
        transform: scale(1.03);
    }

    @media (hover: none), (pointer: coarse) {
        ${Container}:hover & img {
            transform: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        & img { transition: none; }
    }
`

const Actions = styled.div`
    position: absolute;
    left: 4px;
    top: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    z-index: 2;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 200ms ease, transform 200ms ease;

    ${Container}:hover & {
        opacity: 1;
        transform: translateY(0);
    }

    @media (hover: none), (pointer: coarse) {
        opacity: 1;
        transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
        opacity: 1;
        transform: none;
    }
`

const Texts = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    gap: 8px;

    & > span {
        font-size: 12px;
        color: var(--color--gray);
        /* Truncate to one line with ellipsis in a cross-browser way */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: -6px;

        @media (max-width: 768px) {
            font-size: 10px;    
        }
    }

    & > h2 {
        font-size: 20px;
        font-weight: 500;
        color: var(--color--black-2);
        line-height: 1.2;
        margin: 0;
        /* Strictly clamp title to 2 lines with ellipsis and prevent overflow leaks */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        /* Reserve and enforce height for 2 lines so cards align */
        min-height: 2.6em;
        max-height: 2.6em;
        word-break: break-word;
        overflow-wrap: anywhere;

        @media (max-width: 768px) {
            font-size: 16px;    
        }
    }
`

// removed TitleLink to simplify click handling; the whole card is clickable now

const Infos = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    padding-top: 8px;
    box-shadow: var(--border-top);
    /* Reserve space so priced vs orçar don't change card height */
    min-height: 72px;

    & .solicitar-orcamento {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        & span {
            font-size: 18px;
            font-weight: 400;

            @media (max-width: 768px) {
                font-size: 14px;
            }
        }

        @media (max-width: 768px) {
            & svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    @media (max-width: 768px) {
        min-height: 60px;
    }
`

const Discount = styled.div`
    & span {
        font-size: 12px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 2px;
        line-height: 100%;
        font-weight: 500;

        & strong {
            font-size: 14px!important;
            line-height: 100%;
            font-weight: 400;
            text-decoration: line-through;
            color: var(--color--primary);

            @media (max-width: 768px) {
                font-size: 12px!important;
            }
        }
    }
`

const Coast = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0px;
    /* Keep a stable block height regardless of content */
    min-height: 56px;
    @media (max-width: 768px) {
        min-height: 48px;
    }

    & span {
        font-size: 14px;
        font-weight: 500;
        color: var(--color--black-2);

        @media (max-width: 768px) {
            font-size: 12px;    
        }
    }

    & div {

        & span {
            font-size: 14px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 2px;
            line-height: 100%;
            font-weight: 500;
            color: var(--color--green);

            & strong {
                font-size: 20px;
                line-height: 100%;
                font-weight: 500;

                @media (max-width: 768px) {
                    font-size: 18px;
                }
            }
        }
    }
`

const Feedback = styled.span`
    display: inline-block;
    margin-top: 8px;
    font-size: 12px;
    color: ${({ $tone }) => $tone === 'error' ? 'var(--color--primary)' : 'var(--color--green)'};
`

export default function ProductCard({
    product = null,
    image,
    name,
    category,
    price,
    slug,
    sku,
    brandName,
    brandLogo,
    wishlist: wishlistProp 
}) {
    const { addItem } = useCart()
    const { isWished, toggle } = useWishlist();
    const [actionFeedback, setActionFeedback] = useState(null)

    useEffect(() => {
        if (!actionFeedback) return
        const timer = setTimeout(() => setActionFeedback(null), 2500)
        return () => clearTimeout(timer)
    }, [actionFeedback])

    const resolvedProduct = product || {}
    const productSlug = slug ?? resolvedProduct.slug ?? resolvedProduct.productSlug ?? null
    const productNameRaw = name ?? resolvedProduct.name ?? ''
    const productCategoryRaw = category ?? resolvedProduct.category ?? resolvedProduct.subcategory ?? ''
    const rawPrice = price ?? resolvedProduct.price ?? 0
    const productPrice = Number(rawPrice) || 0
    const safePrice = Number.isFinite(productPrice) ? productPrice : 0
    const isPriced = safePrice > 0
    const productSku = sku ?? resolvedProduct.sku ?? productSlug ?? productName
    const productImage = image
        ?? resolvedProduct.image
        ?? (Array.isArray(resolvedProduct.images) && resolvedProduct.images.length > 0 ? resolvedProduct.images[0]?.url : null)
        ?? ''
    const productBrandName = brandName
        ?? resolvedProduct.brandName
        ?? (typeof resolvedProduct.brand === 'object' && resolvedProduct.brand ? (resolvedProduct.brand.companyName || resolvedProduct.brand.name) : null)
        ?? (resolvedProduct.brand_record ? (resolvedProduct.brand_record.companyName || resolvedProduct.brand_record.name) : null)
        ?? null
    const [resolvedBrandLogo, setResolvedBrandLogo] = useState(null)
    const rawBrandLogo = brandLogo
        ?? resolvedProduct.imageBrand
        ?? (typeof resolvedProduct.brand === 'object' && resolvedProduct.brand ? resolvedProduct.brand.logo : null)
        ?? (resolvedProduct.brand_record ? (resolvedProduct.brand_record.imageCompany || resolvedProduct.brand_record.logo) : null)
        ?? null

    useEffect(() => {
        let mounted = true
        async function load() {
            if (!rawBrandLogo) { setResolvedBrandLogo(null); return }
            try {
                const url = await resolveImageUrl(rawBrandLogo)
                if (mounted) setResolvedBrandLogo(url || rawBrandLogo)
            } catch (e) {
                if (mounted) setResolvedBrandLogo(rawBrandLogo)
            }
        }
        load()
        return () => { mounted = false }
    }, [rawBrandLogo])

    // Presentation helpers
    const truncate = (text, max = 72) => {
        if (!text) return ''
        const str = String(text)
        return str.length > max ? str.slice(0, Math.max(0, max - 3)).trimEnd() + '...' : str
    }
    const prettify = (slugLike) => {
        if (!slugLike) return ''
        const text = String(slugLike)
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        return text.replace(/\b\w/g, ch => ch.toUpperCase())
    }

    const productName = truncate(productNameRaw, 72)
    const productCategory = prettify(productCategoryRaw)

    const wished = productSlug ? isWished(productSlug) : Boolean(wishlistProp)

    const emitFeedback = (message, tone = 'success') => setActionFeedback({ message, tone })

    const handleToggle = (event) => {
        event?.stopPropagation?.()
        const srcEl = event?.currentTarget
        if (productSlug) {
            toggle(productSlug)
            // animate to wishlist icon
            flyToTarget(srcEl, 'wishlist-button', { imageSrc: productImage })
            emitWishlistToggled()
            emitFeedback(wished ? 'Removido dos favoritos.' : 'Adicionado aos favoritos!')
        }
    }

    const handleAddToCart = (event) => {
        event?.stopPropagation?.()
        event?.preventDefault?.()
        if (!productSlug) {
            emitFeedback('Não foi possível adicionar este produto.', 'error')
            return
        }
        const payload = {
            sku: productSku,
            unitKey: 'default',
            quantity: 1,
            price: safePrice || 0,
            productSlug,
            name: productName || 'Produto',
            image: productImage,
            imageBrand: resolvedBrandLogo,
            brandName: productBrandName,
        }
        addItem(payload)
        // animate to cart icon
        const srcEl = event?.currentTarget
        flyToTarget(srcEl, 'cart-button', { imageSrc: productImage })
        emitCartAdded()
        emitFeedback('Produto adicionado ao caminhão!')
    }

    const handleShare = async (event) => {
        event?.stopPropagation?.()
        event?.preventDefault?.()
        if (!productSlug) {
            emitFeedback('Não foi possível compartilhar este produto.', 'error')
            return
        }
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const shareUrl = `${origin}/produto/${productSlug}`
        const shareText = productCategory ? `${productName} · ${productCategory}` : productName
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ title: productName, text: shareText, url: shareUrl })
                emitFeedback('Produto compartilhado!')
                return
            }
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl)
                emitFeedback('Link copiado para a área de transferência!')
                return
            }
        } catch (error) {
            console.warn('Falha ao compartilhar produto', error)
        }
        if (typeof window !== 'undefined') {
            window.prompt('Copie o link do produto:', shareUrl)
            emitFeedback('Link disponível para cópia manual.', 'error')
        }
    }

    const goToProduct = () => {
        if (productSlug) window.location.href = `/produto/${productSlug}`
    }

    const handleContainerKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            goToProduct()
        }
    }

    return (
        <>
            <Container
                role={productSlug ? 'link' : undefined}
                tabIndex={productSlug ? 0 : undefined}
                onKeyDown={productSlug ? handleContainerKey : undefined}
                onClick={productSlug ? goToProduct : undefined}
                style={{ cursor: productSlug ? 'pointer' : 'default', opacity: 0, animation: 'pcard-in 260ms ease forwards', animationDelay: `${(productSlug || name || '').length % 5 * 30}ms` }}
            >
                <style>{`
                  @keyframes pcard-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                  @media (prefers-reduced-motion: reduce) { .no-motion { animation: none !important; } }
                `}</style>
                <Image>
                    <img src={productImage} alt={productName} onClick={goToProduct}/>
                    <Actions>
                        <ProductIcon 
                            color="#AA1919"
                            onClick={handleToggle}
                            active={wished}
                            ariaLabel={wished ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                            {wished ? <HeartIcon weight="fill" /> : <HeartIcon />}
                        </ProductIcon>
                        <ProductIcon 
                            color="#0557B4"
                            onClick={handleShare}
                            ariaLabel={"Compartilhar produto"}
                        >
                            <ExportIcon />
                        </ProductIcon>
                    </Actions>
                </Image>
                <Texts>
                    <span>{productCategory}</span>
                    <h2 onClick={(e) => { e.stopPropagation(); productSlug && goToProduct() }} style={{ cursor: productSlug ? 'pointer' : 'inherit' }}>{productName}</h2>
                    <Infos>
                            {
                                isPriced ? (
                                    <>
                                    <Coast>
                                        <span>A partir de:</span>
                                        <Discount>
                                            <span><strong>{formatCurrency(safePrice * 1.3)}</strong></span>
                                        </Discount>
                                        <div>
                                            <span><strong>{formatCurrency(safePrice)}</strong></span>
                                        </div>
                                    </Coast>
                                    <ProductIcon 
                                        color="#06402B"
                                        onClick={handleAddToCart}
                                        ariaLabel="Adicionar ao caminhão"
                                    >
                                        <ShoppingCartIcon />
                                    </ProductIcon>
                                    </>
                                ): (
                                    <>
                                        <ProductIcon 
                                        color="#06402B"
                                        onClick={handleAddToCart}
                                        ariaLabel="Adicionar ao caminhão"
                                        className="solicitar-orcamento"
                                    >
                                        <span>Necessário orçar</span>
                                        <ShoppingCartIcon />
                                    </ProductIcon>
                                    </>
                                )
                            }
                    </Infos>
                </Texts>
            </Container>
        </>
    )
}
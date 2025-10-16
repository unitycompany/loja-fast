import Adsense from "../../../components/banners/Adsense";
import Breadcrumbs from "../../../components/navigation/Breadcrumbs";
import styled from "styled-components";

import ProductCart from "../../../components/product/ProductCart";
import React from 'react'
import { useCart } from '../../../contexts/CardContext'
import { fetchProductsBySlugs } from '../../../services/productService'
import Result from "./Result";

const Container = styled.div`
    width: 100%;
    width: 100%;
    margin-top: 70px;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 40vh;
    gap: 16px;

    & .banner {

        @media (max-width: 768px) {
            padding: 2.5% 5%;
        }
    }

    @media (max-width: 768px) {
        margin-top: 60px;
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
        padding: 5% 5% 2.5% 5%;
    }

    & h1 {
        font-size: clamp(1.4rem, 1rem + 2vw, 2.2rem);
        font-weight: 500;
        line-height: 100%;
    }
`

const Content = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: row;
    position: relative;
    gap: 16px;
    padding: 0 2.5%;

    @media (max-width: 768px) {
        flex-direction: column;
        padding: 0 5%;
    }
`

const Cart = styled.div`
    width: 60%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    background-color: var(--color--white);
    box-shadow: var(--border-full);

    @media (max-width: 768px) {
        width: 100%;    
    }

    & > h2 {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 22px;
        font-weight: 400;
        padding: 2.5% 5%;
        background-color: var(--color--black);
        color: var(--color--white);
        border: 1px solid red;

        & svg {
            font-size: 28px;   
        }
    }
`

const Card = styled.div`
    width: 40%;
    height: auto;
    top: 100px;
    position: sticky;
    background-color: var(--color--white);
    box-shadow: var(--border-full);
    flex-direction: column;

    @media (max-width: 768px) {
        width: 100%;    
    }
`

const breadcrumbs = [
    {
        route: 'Solicitar Orçamento',
        link: 'orcamento'
    }
]

export default function MainCart() {
    const { items: cartItems, removeItem, addItem, updateItemQuantity } = useCart()
    const [items, setItems] = React.useState([])

    React.useEffect(() => {
        let mounted = true
    const slugs = Array.from(new Set((cartItems || []).map(i => i.productSlug).filter(Boolean)))
        if (slugs.length === 0) {
            setItems([])
            return () => { mounted = false }
        }
        fetchProductsBySlugs(slugs).then(data => { if (mounted) setItems(data) }).catch(console.error)
        return () => { mounted = false }
    }, [cartItems])

    const enrichedItems = React.useMemo(() => {
        const list = Array.isArray(cartItems) ? cartItems : []
        return list.map((cartItem) => {
            const product = (items || []).find(p => p.slug === cartItem.productSlug || p.slug === cartItem.slug)
            const productImage = product?.images?.[0]?.url || product?.image || null
            const brandName = cartItem.brandName
                || product?.brandName
                || (product?.brand && typeof product.brand === 'object' ? product.brand.name : null)
                || (product?.brand_record && (product.brand_record.companyName || product.brand_record.name))
                || null
            const brandImage = cartItem.imageBrand
                || product?.imageBrand
                || (product?.brand && typeof product.brand === 'object' ? product.brand.logo : null)
                || (product?.brand_record && (product.brand_record.imageCompany || product.brand_record.logo))
                || null
            const unitPrice = Number(cartItem.price ?? product?.price ?? 0)
            const quantity = Math.max(1, Number(cartItem.quantity ?? 1) || 1)
            const sku = cartItem.sku || product?.sku
            const unitKey = cartItem.unitKey

            return {
                key: `${sku ?? cartItem.productSlug ?? 'item'}-${unitKey ?? 'default'}`,
                cartItem,
                product,
                image: productImage || cartItem.image || '',
                brandName,
                brandImage,
                unitPrice,
                quantity,
                sku,
                unitKey,
            }
        })
    }, [cartItems, items])

    const totals = React.useMemo(() => {
        return enrichedItems.reduce((acc, entry) => {
            const qty = Number(entry.quantity || 0)
            const price = Number(entry.unitPrice || 0)
            acc.totalProducts += qty
            acc.subtotal += price * qty
            return acc
        }, { totalProducts: 0, subtotal: 0 })
    }, [enrichedItems])

    // Removido fetch manual; padroniza Adsense para categoria 'brand'
    return (
        <>
            <Container>
                <Texts>
                    <Breadcrumbs 
                        pages={breadcrumbs}
                    />
                    <h1>Seu Caminhão</h1>
                </Texts>
                <Content>
                    <Cart>
                        {enrichedItems.length === 0 ? (
                            <div style={{ width: '100%', padding: '2.5%', fontSize: 16, color: 'var(--color--gray-4)' }}>
                                Seu caminhão está vazio. Adicione produtos para solicitar um orçamento.
                            </div>
                        ) : (
                            enrichedItems.map(({ key, cartItem, image, brandName, brandImage, product, unitPrice, quantity }) => (
                                <ProductCart 
                                    key={key}
                                    image={image}
                                    slug={cartItem.productSlug}
                                    name={cartItem.name || product?.name}
                                    price={unitPrice}
                                    brandName={brandName || product?.brandName}
                                    imageBrand={brandImage}
                                    sku={cartItem.sku || product?.sku}
                                    quantity={quantity}
                                    unitKey={cartItem.unitKey}
                                    onRemove={() => removeItem((it) => it.sku === cartItem.sku && it.unitKey === cartItem.unitKey)}
                                    onUpdateQuantity={(qty) => {
                                        const safeQty = Math.max(1, Number(qty) || 1)
                                        updateItemQuantity(cartItem.sku, cartItem.unitKey, safeQty)
                                    }}
                                />
                            ))
                        )}
                    </Cart>
                    <Card>
                        <Result 
                            totalPrice={totals.subtotal}
                            totalProducts={totals.totalProducts}
                        />
                    </Card>
                </Content>
                <Adsense className="banner" ItemsAdsense={'brand'} />
            </Container>
        </>
    )
}
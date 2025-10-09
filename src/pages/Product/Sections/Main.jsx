import React, { useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import ProductIcon from '../../../components/buttons/ProductIcon'
import Breadcrumbs from '../../../components/navigation/Breadcrumbs'
import JsonLd from '../../../components/seo/JsonLd'
import { useCart } from '../../../contexts/CardContext'
import { fetchBrands } from '../../../services/brandService'
import { resolveImageUrl } from '../../../services/supabase'
import { BagIcon } from '@phosphor-icons/react/dist/ssr'
import QuoteForm from '../../../components/cart/QuoteForm'
import { flyToTarget, emitCartAdded } from '../../../lib/animations'

const Wrapper = styled.div`
  display: flex;
  gap: 32px;
  align-items: flex-start;
  width: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  margin-top: 70px;
  padding: 2.5%;

  @media (max-width: 768px){
    flex-direction: column;  
    padding: 5%;
  }
`

const Left = styled.div`
  width: 50%;
  background-color: var(--color--gray-5);

  @media (max-width: 768px){
    width: 100%;  
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
  @media (max-width: 768px) {
    flex: 0 0 180px;
  }
`

const Right = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 28px;
  /* Tie brand/logo sizes to title using a CSS variable */
  --title-size: 30px;

  @media (max-width: 768px){
    width: 100%;  
    --title-size: 22px;
  }
`

const Brand = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  
  & .brand-logo { 
    box-shadow: var(--border-full);
    padding: 2px;
    
    img { 
        /* Size logo relative to the title size */
        height: calc(var(--title-size) * 1.8);
        width: auto;
        max-width: calc(var(--title-size) * 3.6);
        object-fit: contain; 
    } 
  }

  .brand-info { 
    display:flex; 
    flex-direction:column; 
    gap:4px; 
  }

  .brand-name { 
    font-weight: 500;
    font-size: 18px;
  }
`

const Category = styled.div`
  color: #666;
  font-size: 14px;
`

const Infos = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    gap: 18px;

    & .product-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 0px;
    }
`

const Title = styled.h1`
  margin: 0;
  font-size: var(--title-size);
  line-height: 1;
  font-weight: 500;

  @media (max-width: 768px){
    font-size: 22px;  
  }
`

const ShortDesc = styled.div`
  color: #444;
  margin: 0;
  line-height: 1.1;
  font-size: 16px;
  
  p { margin: 0 0 6px 0; }
  ul, ol { margin: 8px 0 8px 18px; padding-left: 18px; }
  ul { list-style: disc outside; }
  ol { list-style: decimal outside; }
  li { margin: 2px 0; }
  strong, b { font-weight: 600; }
  em, i { font-style: italic; }

  @media (max-width: 768px){
    font-size: 15px;  
  }
`

const PriceRow = styled.div`
  display:flex;
  gap: 22px;
  align-items: center;
  flex-direction: row;
`

const Price = styled.div`
  font-size: 38px;
  font-weight: 600;
  color: var(--color--black);
  line-height: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;

  @media (max-width: 768px){
    font-size: 32px;  
  }

  & strong {
    font-weight: 500;
    font-size: 14px;
    color: var(--color--black);
  }
`

const Unidades = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
`

const Controls = styled.div`
  display:flex;
  gap: 12px;
  align-items:center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  & .cta {
    background-color: var(--color--green);
    padding: 8px 24px;
    border-radius: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--color--white);
    width: 100%;
    border: none;
    transition: background-color 160ms ease, box-shadow 160ms ease, transform 100ms ease;
  }
  & .cta:hover {
    background-color: #2dbf56;
    box-shadow: 0 8px 16px rgba(64,158,13,0.18);
  }
  & .cta:active { transform: translateY(1px); }
  & .cta:focus-visible { outline: 2px solid #2dbf56; outline-offset: 2px; }

  & button {
    height: 48px;
    width: 48px;
  }
`

const TechInfo = styled.div`
  width: 100%;
  padding-top: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: row;
  border-top: 1px solid #eee;
  color: #333;
  font-size: 16px;
  display:flex;
  gap:18px;
  flex-wrap:wrap;
`

const MeasuresSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
`

const MeasuresGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const MeasureButton = styled.button`
  padding: 8px 16px;
  box-shadow: var(--border-full);
  background: ${({ active }) => active ? 'var(--color--green)' : 'transparent'};
  color: ${({ active }) => active ? 'white' : 'var(--color--black)'};
  cursor: pointer;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? 'var(--color--green)' : '#f5f5f5'};
  }
`

// Units selector styling (similar to measures)
const UnitsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
`

const UnitsGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const UnitButton = styled.button`
  padding: 8px 16px;
  box-shadow: var(--border-full);
  background: ${({ active }) => active ? 'var(--color--green)' : 'transparent'};
  color: ${({ active }) => active ? 'white' : 'var(--color--black)'};
  cursor: pointer;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? 'var(--color--green)' : '#f5f5f5'};
  }
`

export default function Main({ product, selectedMeasureId, setSelectedMeasureId, selectedUnitIndex: liftedUnitIndex, setSelectedUnitIndex: setLiftedUnitIndex }){
  const { addItem } = useCart()
  const [quoteOpen, setQuoteOpen] = useState(false)
  // support both old fields and new shape
  const imagesRaw = product?.images || (product?.image ? [product.image] : [])
  // Always prefer the first image as the main image
  const images = (imagesRaw || []).map(i => (typeof i === 'string' ? i : (i?.url || ''))).filter(Boolean)

  // resolve brand: product.brand may be an object, a string id/slug/name, or missing
  let brand = product?.brand || { name: product?.brandName, logo: product?.imageBrand }

  // load brands list to support lookups when brand is a string
  const [brandsList, setBrandsList] = useState([])
  useEffect(() => {
    let mounted = true
    // includeEmpty: true to ensure lookup works even if brand has 0-count due to timing
    fetchBrands({ includeEmpty: true }).then(b => { if (mounted) setBrandsList(Array.isArray(b) ? b : []) }).catch(console.error)
    return () => { mounted = false }
  }, [])

  // if brand is a string, try to find in brands list
  if (brand && typeof brand === 'string'){
    const key = brand.toLowerCase()
    const found = brandsList.find(b => b.id === key || b.slug === key || (b.companyName && b.companyName.toLowerCase() === key))
    if (found) brand = { name: found.companyName, logo: found.imageCompany }
    else brand = { name: brand, logo: null }
  }

  // if brand is an object but missing logo, try to lookup by name/id/slug
  if (brand && typeof brand === 'object' && !brand.logo && brand.name){
    const key = String(brand.name).toLowerCase()
    const found = brandsList.find(b => b.id === key || b.slug === key || (b.companyName && b.companyName.toLowerCase() === key))
    if (found) brand.logo = found.imageCompany
  }

  // resolve product and brand image URLs (support storage paths)
  const [resolvedImages, setResolvedImages] = useState([])
  const [brandLogo, setBrandLogo] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      const imgs = []
      for (const i of (images || [])) {
        try { imgs.push(await resolveImageUrl(i)) } catch (e) { imgs.push(i) }
      }
      if (mounted) setResolvedImages(imgs)
      // brand logo (prefer explicit product.imageBrand, then brand.logo)
      const logoCandidate = (product && product.imageBrand) || (brand && brand.logo)
      if (logoCandidate) {
        try {
          const rl = await resolveImageUrl(logoCandidate)
          if (mounted) setBrandLogo(rl)
        } catch (e) {
          if (mounted) setBrandLogo(logoCandidate)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [images, product && product.imageBrand, brand && brand.logo])

  // Unidades: normalizar para apenas UMA unidade por produto
  // Fonte aceita: product.units (novo) ou product.unidade (legado). Sempre escolher 1 preferida.
  const allUnitsRaw = product?.units
    || (product?.unidade ? product.unidade.map(u => ({ key: u.type, label: u.type, price: product.price, baseQuantity: u.amount || 1, defaultQuantity: 1 })) : [])

  // Preferência: por chave default (default_unit_key ou defaultUnitKey), depois a que tiver flag default, senão a primeira.
  const preferredKey = product?.default_unit_key || product?.defaultUnitKey
  const preferredUnit = Array.isArray(allUnitsRaw) && allUnitsRaw.length
    ? (allUnitsRaw.find(u => (preferredKey && u?.key === preferredKey))
      || allUnitsRaw.find(u => u?.default)
      || allUnitsRaw[0])
    : null

  const units = preferredUnit ? [preferredUnit] : [{ key: 'un', label: 'un', price: product?.price, baseQuantity: 1, defaultQuantity: 1 }]

  // Índice de unidade fixo em 0, e clamp por segurança
  const [internalUnitIndex, setInternalUnitIndex] = useState(0)
  const selectedUnitIndex = 0
  const setSelectedUnitIndex = () => {} // sem seleção de unidade
  const selectedUnit = useMemo(() => units[0], [units])
  // quantity is defined later in cart; product page doesn't handle quantities

  // Keep selected unit valid when units change
  useEffect(() => {
    // Sempre força a unidade para índice 0
    setInternalUnitIndex(0)
  }, [units])

  // Reset quantity when unit changes
  // no quantity on product page

  // measures
  const measures = Array.isArray(product?.measures) ? product.measures : []
  const selectedMeasure = measures.find(m=>m.id === selectedMeasureId) || measures[0]

  // Pricing precedence (with per-unit overrides):
  // unit.measurePrices[measureId] > unit.price > measure.price > product.price
  const unitPrice = useMemo(() => {
    const override = selectedUnit && selectedMeasure ? (selectedUnit.measurePrices && selectedUnit.measurePrices[selectedMeasure.id]) : null
    if (override != null) return override
    if (selectedUnit && selectedUnit.price != null) return selectedUnit.price
    if (selectedMeasure?.price != null) return selectedMeasure.price
    return product.price
  }, [selectedUnit, selectedMeasure, product.price])

  // Resolve dynamic identifiers (SKU/GTIN/MPN) by selection
  const { resolvedSku, resolvedGtin, resolvedMpn } = useMemo(() => {
    const baseSku = product.sku
    const unitSku = selectedUnit?.sku
    const measureSku = selectedMeasure?.sku
    const sku = (() => {
      if (unitSku && measureSku) return `${baseSku}-${unitSku}-${measureSku}`
      if (unitSku) return `${baseSku}-${unitSku}`
      if (measureSku) return `${baseSku}-${measureSku}`
      return baseSku
    })()

    const gtin = selectedUnit?.gtin || selectedMeasure?.gtin || product.gtin
    const mpn = selectedUnit?.mpn || selectedMeasure?.mpn || product.mpn
    return { resolvedSku: sku, resolvedGtin: gtin, resolvedMpn: mpn }
  }, [product.sku, product.gtin, product.mpn, selectedUnit, selectedMeasure])

  // Compute min price across all combinations to show 'a partir de:'
  const minPrice = useMemo(() => {
    const combos = []
    const mList = measures.length > 0 ? measures : [null]
    for (const u of units) {
      for (const m of mList) {
        const override = (u && m) ? (u.measurePrices && u.measurePrices[m.id]) : null
        const price = (override != null) ? override
          : (u?.price != null ? u.price
          : (m?.price != null ? m.price : product.price))
        combos.push(Number(price) || 0)
      }
    }
    if (!combos.length) return Number(product.price) || 0
    return Math.min(...combos.filter(p => Number.isFinite(p)))
  }, [units, measures, product.price])

  // Default selection: prefer the cheapest combination
  useEffect(() => {
    const mList = measures.length > 0 ? measures : [null]
    let best = { price: Number.POSITIVE_INFINITY, unitIndex: selectedUnitIndex, measureId: selectedMeasureId }
    for (let ui = 0; ui < units.length; ui++) {
      const u = units[ui]
      for (const m of mList) {
        const override = (u && m) ? (u.measurePrices && u.measurePrices[m.id]) : null
        const price = (override != null) ? override
          : (u?.price != null ? u.price
          : (m?.price != null ? m.price : product.price))
        const n = Number(price)
        if (Number.isFinite(n) && n < best.price) {
          best = { price: n, unitIndex: ui, measureId: m ? m.id : undefined }
        }
      }
    }
    if (typeof best.unitIndex === 'number' && best.unitIndex !== selectedUnitIndex) setSelectedUnitIndex(best.unitIndex)
    if (best.measureId && best.measureId !== selectedMeasureId && typeof setSelectedMeasureId === 'function') setSelectedMeasureId(best.measureId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, JSON.stringify(units), JSON.stringify(measures)])

  // total and quantity are handled in cart

  const priceLabel = useMemo(()=>{
    if (!product) return ''
    return `R$ ${Number(product.price).toFixed(2).replace('.',',')}`
  },[product])

  // Human-friendly category label instead of slug
  const prettify = (slugLike) => {
    if (!slugLike) return ''
    const text = String(slugLike)
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.replace(/\b\w/g, ch => ch.toUpperCase())
  }
  const categoryLabel = prettify(product?.category)

  if (!product) return null

  const fmtBRL = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), [])
  const hasPrice = Number.isFinite(Number(unitPrice)) && Number(unitPrice) > 0

  return (
    <Wrapper>
    <Left>
    <img src={resolvedImages[0] || images[0] || '/og-default.jpg'} alt={product.name} />
    </Left>
      <Right>
    <Breadcrumbs pages={[{ route: categoryLabel, link: `search?category=${encodeURIComponent(product.category)}` }, { route: product.name, link: product.slug }]} />
        <Infos>
            {/* Só mostra o Brand se tiver logo */}
            {(brandLogo || brand?.logo) && (
                <Brand>
                    <div className="brand-logo">
                        <img src={brandLogo || brand.logo} alt={brand?.name || 'Marca'} />
                    </div>
                    <aside className="product-info">
            <Category>{categoryLabel}</Category>
                        <Title>{product.name}</Title>
                    </aside>
                </Brand>
            )}
            
            {/* Se não tiver logo, mostra apenas categoria e título */}
            {!brandLogo && !brand?.logo && (
                <aside className="product-info">
          <Category>{categoryLabel}</Category>
                    <Title>{product.name}</Title>
                </aside>
            )}
            
            {product.shortDescription ? (
              <ShortDesc dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
            ) : (
              <ShortDesc>{product.description || ''}</ShortDesc>
            )}
        </Infos>

        {hasPrice && (
          <PriceRow>
            <Price>
              <strong>a partir de: </strong>{fmtBRL.format(Number(unitPrice || 0))}
            </Price>
          </PriceRow>
        )}

        {/* Medidas disponíveis - só mostra se houver medidas */}
        {measures.length > 0 && (
          <MeasuresSection>
            <h3>Medidas disponíveis</h3>
            <MeasuresGrid>
              {measures.map(m => (
                <MeasureButton 
                  key={m.id} 
                  active={m.id === selectedMeasureId} 
                  onClick={() => setSelectedMeasureId(m.id)}
                >
                  {m.label}
                </MeasureButton>
              ))}
            </MeasuresGrid>
          </MeasuresSection>
        )}

        {/* Units available - single selection; price updates dynamically */}
        {units.length > 1 && (
          <UnitsSection>
            <h3>Unidades de venda</h3>
            <UnitsGrid>
              {units.map((u, idx) => (
                <UnitButton
                  key={`${u.key || 'unit'}-${idx}`}
                  active={idx === selectedUnitIndex}
                  onClick={() => setSelectedUnitIndex(idx)}
                >
                  {u.label || u.key}
                </UnitButton>
              ))}
            </UnitsGrid>
          </UnitsSection>
        )}
        {/* Sem preço secundário: só o preço principal com o prefixo acima */}

        <Controls>
          <button className='cta' onClick={()=> setQuoteOpen(true)} aria-label="Solicitar orçamento">Solicitar orçamento</button>
      <ProductIcon ariaLabel="Adicionar ao carrinho" onClick={(e)=>{
              // build a deterministic unitKey from selected measure and unit so identical selections merge
              const unitsSelection = [{ key: selectedUnit?.key, label: selectedUnit?.label, baseQuantity: selectedUnit?.baseQuantity }]
              const unitKey = JSON.stringify({ measure: selectedMeasure?.id, unit: { key: selectedUnit?.key, label: selectedUnit?.label } })
              const comboSku = (() => {
                const base = product.sku
                const uSku = selectedUnit?.sku
                const mSku = selectedMeasure?.sku
                if (uSku && mSku) return `${base}-${uSku}-${mSku}`
                if (uSku) return `${base}-${uSku}`
                if (mSku) return `${base}-${mSku}`
                return base
              })()
              const payload = {
                sku: comboSku,
                unitKey,
                quantity: 1,
                price: unitPrice,
                productSlug: product.slug,
                name: product.name,
                image: resolvedImages[0] || images[0],
                imageBrand: brandLogo || (brand && typeof brand === 'object' ? brand.logo : null),
                brandName: brand?.name || product.brandName,
                measure: selectedMeasure?.id,
                measureLabel: selectedMeasure?.label,
                units: unitsSelection,
                unit: selectedUnit?.label || selectedUnit?.key,
                // total will be computed by cart based on quantity
              }
              addItem(payload)
              // animate to cart
              const src = (e?.currentTarget)
              flyToTarget(src, 'cart-button', { imageSrc: resolvedImages[0] || images[0] || null })
              emitCartAdded()
            }}
            color="#409E0D"
          >
            <BagIcon />
          </ProductIcon>
        </Controls>

        <QuoteForm 
          open={quoteOpen} 
          onClose={()=> setQuoteOpen(false)} 
          itemsOverride={[{
            sku: (() => {
              const base = product.sku
              const uSku = selectedUnit?.sku
              const mSku = selectedMeasure?.sku
              if (uSku && mSku) return `${base}-${uSku}-${mSku}`
              if (uSku) return `${base}-${uSku}`
              if (mSku) return `${base}-${mSku}`
              return base
            })(),
            unitKey: JSON.stringify({ measure: selectedMeasure?.id, unit: { key: selectedUnit?.key, label: selectedUnit?.label } }),
            quantity: 1,
            price: unitPrice,
            productSlug: product.slug,
            name: product.name,
            image: resolvedImages[0] || images[0],
            imageBrand: brandLogo || (brand && typeof brand === 'object' ? brand.logo : null),
            brandName: brand?.name || product.brandName,
            measure: selectedMeasure?.id,
            measureLabel: selectedMeasure?.label,
            units: [{ key: selectedUnit?.key, label: selectedUnit?.label, baseQuantity: selectedUnit?.baseQuantity }],
            unit: selectedUnit?.label || selectedUnit?.key,
          }]} 
        />

        <TechInfo>
          <div>SKU: <strong>{resolvedSku || '-'}</strong></div>
          {resolvedGtin ? (<div>GTIN: <strong>{resolvedGtin}</strong></div>) : null}
          {resolvedMpn ? (<div>MPN: <strong>{resolvedMpn}</strong></div>) : null}
          <div>Categoria: <strong>{categoryLabel || '-'}</strong></div>
        </TechInfo>

        {/* render Json-LD for this product so crawlers pick up main attributes (short) */}
        <JsonLd data={{
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: images.filter(Boolean),
          description: product.shortDescription || product.description || '',
          sku: resolvedSku,
          gtin: resolvedGtin,
          mpn: resolvedMpn,
          brand: brand?.name ? { '@type': 'Brand', name: brand.name } : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: product.price,
            availability: 'https://schema.org/InStock'
          }
        }} />
      </Right>
    </Wrapper>
  )
}

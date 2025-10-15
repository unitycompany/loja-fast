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
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: var(--product-detail-image-size);
  min-height: 60vh;

  @media (max-width: 768px){
    width: 100%;  
    min-height: 50vh;
  }

  img {
    width: 100%;
    height: 100%;
    max-height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    border: 1px solid var(--color--gray-4);
  }
`

const Right = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 22px;
  /* Tie brand/logo sizes to title using a CSS variable */
  --title-size: clamp(1.5rem, 1.1rem + 1.8vw, 2rem);

  @media (max-width: 768px){
    width: 100%;  
  }
`

const Brand = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  
  & .brand-logo {
    box-shadow: var(--border-full);
    padding: 4px;
    background: var(--color--white);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        height: var(--brand-logo-size);
        max-height: var(--brand-logo-size);
        width: 100px;
        height: 100px;
        object-fit: contain;

        @media (max-width: 768px){
          height: 60px;
          width: 60px;
        }
    }
  }

  .product-info { 
    display:flex; 
    flex-direction:column; 
    gap:4px; 
    width: fit-content;
  
    & h1 { 
      font-weight: 400;
      font-size: 32px;
    
      @media (max-width: 768px){
        font-size: 22px;
      }
    }
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
    background-color: var(--color--green);
    box-shadow: 0 8px 16px rgba(64,158,13,0.18);
  }
  & .cta:active { transform: translateY(1px); }
  & .cta:focus-visible { outline: 2px solid var(--color--green); outline-offset: 2px; }

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
  const [brandsList, setBrandsList] = useState(null)

  const needsBrandLookup = useMemo(() => {
    if (!product) return false
    if (typeof product.brand === 'string') return true
    const brandObject = product.brand && typeof product.brand === 'object' ? product.brand : null
    const hasEmbeddedName = Boolean(product.brandName || brandObject?.companyName || brandObject?.name || brandObject?.title)
    const hasEmbeddedLogo = Boolean(product.imageBrand || brandObject?.imageCompany || brandObject?.logo || brandObject?.image)
    return !(hasEmbeddedName && hasEmbeddedLogo)
  }, [product])

  const images = useMemo(() => {
    const list = product?.images || (product?.image ? [product.image] : [])
    return (list || []).map((i) => (typeof i === 'string' ? i : (i?.url || ''))).filter(Boolean)
  }, [product])

  // resolve brand: product.brand may be an object, a string id/slug/name, or missing
  const normalizedBrand = useMemo(() => {
      const entries = Array.isArray(brandsList) ? brandsList : []
      const matchByKey = (value) => {
        if (!value) return null
        const key = String(value).toLowerCase()
        return entries.find((b) => {
          const id = b?.id ? String(b.id).toLowerCase() : null
          const slug = b?.slug ? String(b.slug).toLowerCase() : null
          const company = b?.companyName ? String(b.companyName).toLowerCase() : null
          return key === id || key === slug || key === company
        }) || null
      }

      let name = product?.brandName || null
      let logoValue = product?.imageBrand || null
      const brandData = product?.brand

      const ensureFromEntry = (entry) => {
        if (!entry) return
        if (!name) name = entry.companyName || entry.name || name
        if (!logoValue) logoValue = entry.imageCompany || entry.logo || entry.image
      }

      if (typeof brandData === 'string') {
        const entry = matchByKey(brandData)
        if (entry) {
          name = entry.companyName || name || brandData
          logoValue = entry.imageCompany || logoValue
        } else {
          name = name || brandData
        }
      } else if (brandData && typeof brandData === 'object') {
        const directName = brandData.companyName || brandData.name || brandData.title || name
        if (directName) name = directName
        logoValue = brandData.imageCompany || brandData.logo || brandData.image || logoValue
        ensureFromEntry(matchByKey(brandData.slug || brandData.id || directName))
      } else {
        ensureFromEntry(matchByKey(name))
      }

      return { name: name || null, logo: logoValue || null }
    }, [product, brandsList])

  // load brands list to support lookups when brand data is incomplete
  useEffect(() => {
    let mounted = true
    if (!needsBrandLookup || Array.isArray(brandsList)) {
      return () => { mounted = false }
    }
    fetchBrands({ includeEmpty: true })
      .then((b) => {
        if (mounted && !Array.isArray(brandsList)) {
          setBrandsList(Array.isArray(b) ? b : [])
        }
      })
      .catch((err) => {
        console.error(err)
        if (mounted && !Array.isArray(brandsList)) {
          setBrandsList([])
        }
      })
    return () => { mounted = false }
  }, [needsBrandLookup, brandsList])

  // resolve product and brand image URLs (support storage paths)
  const [resolvedImages, setResolvedImages] = useState([])
  const [brandLogo, setBrandLogo] = useState(null)

  useEffect(() => {
    let mounted = true
    async function loadImages() {
      if (!images.length) {
        if (mounted) setResolvedImages([])
        return
      }
      const next = await Promise.all((images || []).map(async (source) => {
        try {
          const resolved = await resolveImageUrl(source)
          return resolved || source
        } catch {
          return source
        }
      }))
      if (mounted) setResolvedImages(next)
    }
    loadImages()
    return () => { mounted = false }
  }, [images])

  useEffect(() => {
    let mounted = true
    const candidate = normalizedBrand?.logo
    if (!candidate) {
      setBrandLogo(null)
      return () => { mounted = false }
    }
    async function loadLogo() {
      try {
        const resolved = await resolveImageUrl(candidate)
        if (mounted) setBrandLogo(resolved || candidate)
      } catch {
        if (mounted) setBrandLogo(candidate)
      }
    }
    loadLogo()
    return () => { mounted = false }
  }, [normalizedBrand?.logo])

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
      {(brandLogo || normalizedBrand?.logo) && (
                <Brand>
                    <div className="brand-logo">
            <img src={brandLogo || normalizedBrand?.logo} alt={normalizedBrand?.name || 'Marca'} />
                    </div>
                    <aside className="product-info">
                      <Category>{categoryLabel}</Category>
                      <Title>{product.name}</Title>
                    </aside>
                </Brand>
            )}
            
            {/* Se não tiver logo, mostra apenas categoria e título */}
      {!brandLogo && !normalizedBrand?.logo && (
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
                imageBrand: brandLogo || normalizedBrand?.logo,
                brandName: normalizedBrand?.name || product.brandName,
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
            color="#06402B"
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
            imageBrand: brandLogo || normalizedBrand?.logo,
            brandName: normalizedBrand?.name || product.brandName,
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
          brand: normalizedBrand?.name ? { '@type': 'Brand', name: normalizedBrand.name } : undefined,
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

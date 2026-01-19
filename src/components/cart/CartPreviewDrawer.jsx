import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { useCart } from '../../contexts/CardContext'
import { useUI } from '../../contexts/UIContext'
import { go } from '../../utils/url'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideInRight = keyframes`
  from { transform: translate3d(18px, 0, 0); opacity: 0; }
  to { transform: translate3d(0, 0, 0); opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translate3d(0, 18px, 0); opacity: 0; }
  to { transform: translate3d(0, 0, 0); opacity: 1; }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(2px);
  z-index: 2500;
  animation: ${fadeIn} 160ms ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Panel = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(440px, 92vw);
  background: var(--color--white-2);
  box-shadow: -12px 0 36px rgba(0,0,0,0.18);
  z-index: 2600;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(0,0,0,0.06);
  animation: ${slideInRight} 200ms ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 768px) {
    top: auto;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: min(78vh, 640px);
    border-left: 0;
    border-top: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 -12px 36px rgba(0,0,0,0.18);
    animation: ${slideUp} 200ms ease;
  }
`

const Header = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    height: 60px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--color--black-3);
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 10px;
    color: rgba(0,0,0,0.6);
    transition: transform 140ms ease, color 140ms ease;

    &:hover { transform: translateY(-1px); color: rgba(0,0,0,0.8); }
  }
`

const Body = styled.div`
  padding: 14px 18px 0 18px;
  flex: 1;
  overflow: auto;

  @media (max-width: 768px) {
    padding: 14px 16px 0 16px;
  }
`

const Empty = styled.div`
  padding: 22px 0;
  color: var(--color--gray-4);
  font-size: 14px;
`

const Item = styled.div`
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);

  .img {
    width: 54px;
    height: 54px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.08);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color--black-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sku {
    font-size: 12px;
    color: rgba(0,0,0,0.55);
  }

  .qty {
    font-size: 13px;
    font-weight: 500;
    color: var(--color--primary);
    align-self: center;
    padding: 6px 10px;
    background: rgba(0,0,0,0.03);
    border-radius: 999px;
  }
`

const Footer = styled.div`
  padding: 14px 18px 18px 18px;
  border-top: 1px solid rgba(0,0,0,0.08);
  background: linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.65));

  @media (max-width: 768px) {
    padding: 12px 16px 16px 16px;
  }

  .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(0,0,0,0.7);
    margin-bottom: 12px;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    height: 44px;
    border: 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    padding: 0 14px;
    transition: transform 140ms ease, background-color 140ms ease, opacity 140ms ease;
    border-radius: 0;
    width: 100%;
  }

  .primary {
    background: var(--color--green, #16a34a);
    color: #fff;

    &:hover { background: #15803d; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
  }

  .secondary {
    background: rgba(0,0,0,0.05);
    color: rgba(0,0,0,0.75);

    &:hover { background: rgba(0,0,0,0.08); }
  }
`

export default function CartPreviewDrawer() {
  const { items } = useCart()
  const { cartPreviewOpen, closeCartPreview } = useUI()

  const safeItems = Array.isArray(items) ? items : []

  const totalQty = useMemo(() => safeItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0), [safeItems])

  useEffect(() => {
    if (!cartPreviewOpen) return undefined

    const onKey = (e) => {
      if (e.key === 'Escape') closeCartPreview()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartPreviewOpen, closeCartPreview])

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    if (!cartPreviewOpen) return undefined

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    const scrollBarCompensation = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollBarCompensation > 0) {
      document.body.style.paddingRight = `${scrollBarCompensation}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [cartPreviewOpen])

  if (!cartPreviewOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <Overlay onClick={closeCartPreview} />
      <Panel role="dialog" aria-modal="true" aria-label="Prévia do carrinho">
        <Header>
          <h3>Itens adicionados</h3>
          <button type="button" onClick={closeCartPreview} aria-label="Fechar">×</button>
        </Header>

        <Body>
          {safeItems.length === 0 ? (
            <Empty>Seu caminhão está vazio.</Empty>
          ) : (
            safeItems.slice(0, 8).map((it, idx) => (
              <Item key={`${it.sku || it.productSlug || 'item'}-${it.unitKey || 'default'}-${idx}`}>
                <div className="img">
                  {it.image ? <img src={it.image} alt={it.name || 'Produto'} /> : null}
                </div>
                <div className="meta">
                  <div className="name" title={it.name || ''}>{it.name || 'Produto'}</div>
                  <div className="sku">SKU: {it.sku || '-'}</div>
                </div>
                <div className="qty">Qtd {Number(it.quantity) || 1}</div>
              </Item>
            ))
          )}
        </Body>

        <Footer>
          <div className="summary">
            <span>Total de itens</span>
            <strong>{totalQty}</strong>
          </div>
          <div className="actions">
            <button
              type="button"
              className="secondary"
              onClick={closeCartPreview}
            >
              Continuar comprando
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                closeCartPreview()
                go('/orcamento')
              }}
            >
              Ir para orçamento
            </button>
          </div>
        </Footer>
      </Panel>
    </>,
    document.body
  )
}

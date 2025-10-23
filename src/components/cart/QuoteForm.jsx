import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { useForm } from 'react-hook-form'
import { N8N_WEBHOOK_URL, WHATS_TARGET_E164, WHATS_MSG } from '../../lib/constants'
import { useCart } from '../../contexts/CardContext'
import { useUTM } from '../../contexts/UTMContext'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.98) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 180ms ease;
  padding: 16px;
  overflow-y: auto;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 640px) {
    padding: 8px;
    align-items: flex-start;
  }
`

const Modal = styled.div`
  width: 100%;
  position: relative;
  max-width: 680px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  padding: 0;
  display: flex;
  flex-direction: column;
  animation: ${popIn} 200ms ease;
  max-height: 90vh;
  overflow: hidden;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 640px) {
    max-width: 100%;
    max-height: 95vh;
  }
`

const ModalBody = styled.div`
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;

  @media (max-width: 640px) {
    padding: 20px 16px;
  }
`

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 400;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 2px;
    height: 16px;
    background: var(--color--green, #16a34a);
    border-radius: 2px;
  }
`

const CartPreview = styled.div`
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #fff;
  margin-bottom: 16px;
`

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 140px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f3f4f6;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th {
    text-align: left;
    padding: 12px 16px;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    @media (max-width: 640px) {
      padding: 10px 12px;
      font-size: 12px;
    }
  }

  tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 120ms ease;

    &:hover {
      background: #f9fafb;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 12px 16px;
    color: #4b5563;
    vertical-align: middle;

    @media (max-width: 640px) {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  .product-name {
    font-weight: 500;
    color: #111827;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 640px) {
      max-width: 140px;
    }
  }

  .sku {
    color: #6b7280;
    font-size: 13px;
    font-family: 'Courier New', monospace;

    @media (max-width: 640px) {
      font-size: 12px;
    }
  }

  .quantity {
    text-align: center;
    font-weight: 600;
    color: #059669;
  }

  .unit-measure {
    font-size: 13px;
    color: #6b7280;
  }

  .price,
  .subtotal {
    text-align: right;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .subtotal {
    color: #111827;
    font-weight: 600;
  }
`

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(to bottom, #f9fafb, #fff);
  border-top: 1px solid #e5e7eb;
  font-size: 18px;
  font-weight: 600;
  color: #111827;

  @media (max-width: 640px) {
    padding: 14px 16px;
    font-size: 16px;
  }

  span:first-child {
    color: #374151;
  }

  span:last-child {
    color: var(--color--green, #16a34a);
    font-variant-numeric: tabular-nums;
  }

  span:last-child::before {
    content: 'A partir de: ';
    font-weight: 400;
    color: #6b7280;
    font-size: 14px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  label {
    font-size: 12px;
    font-weight: 400;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  /* Only style textual inputs (not checkboxes) */
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="search"],
  input[type="number"],
  textarea {
    height: 38px;
    padding: 0px;
    border-bottom: 1px solid #d1d5db;
    outline: none;
    font-size: 14px;
    border-radius: 0;
    transition: all 140ms ease;
    background: #fff;

    &::placeholder {
      color: #9ca3af;
    }

    @media (max-width: 640px) {
      height: 42px;
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }

  /* Checkbox specific styling to match form layout */
  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    line-height: 1.2;
    font-size: 12px;
    color: #374151;
  }

  input[type="checkbox"] {
    width: 28px;
    height: 28px;
    margin: 0;
    accent-color: var(--color--green, #16a34a);
    flex: 0 0 auto;
  }

  .error {
    font-size: 13px;
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;

    &::before {
      content: '⚠';
      font-size: 14px;
    }
  }

  .actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #f3f4f6;

    @media (max-width: 640px) {
      flex-direction: column-reverse;
      gap: 10px;
    }
  }

  button {
    height: 44px;
    width: 100%;
    padding: 0 24px;
    border: 0;
    cursor: pointer;
    font-size: 15px;
    font-weight: 400;
    transition: all 140ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;

    @media (max-width: 640px) {
      width: 100%;
      height: 46px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.submit {
      background: var(--color--green, #16a34a);
      color: #fff;
      border-radius: 0;

      &:hover:not(:disabled) {
        background: #15803d;
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }

    &.cancel {
      background: #f3f4f6;
      color: #4b5563;

      &:hover {
        background: #e5e7eb;
      }
    }
  }
`

// constants centralized in lib/constants

function toE164BR(raw){
  if (!raw) return null
  const digits = String(raw).replace(/\D+/g,'').replace(/^0+/, '')
  return digits.startsWith('55') ? `+${digits}` : `+55${digits}`
}
function nowBRString(){
  const d = new Date(); const pad=n=>String(n).padStart(2,'0')
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function parseQueryParams(){
  try {
    const url = new URL(window.location.href)
    const q = url.searchParams
    return {
      utm_source: q.get('utm_source'),
      utm_medium: q.get('utm_medium'),
      utm_campaign: q.get('utm_campaign'),
      utm_content: q.get('utm_content'),
      utm_term: q.get('utm_term'),
      gclid: q.get('gclid'),
      fbclid: q.get('fbclid'),
    }
  } catch { return {} }
}
function generateUniqueId(prefix='fs-QUOTE'){ return `${prefix}-${Date.now()}` }

export default function QuoteForm({ open, onClose, itemsOverride }){
  const { items } = useCart()
  const { utm } = useUTM()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    if (!open) return undefined

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
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const sourceItems = Array.isArray(itemsOverride) ? itemsOverride : items
  const cartRows = useMemo(()=> (Array.isArray(sourceItems) ? sourceItems : []).map(i => ({
    name: i.name,
    sku: i.sku,
    quantity: i.quantity ?? 1,
    unit: (i.units && i.units[0]?.label) || i.unit || '',
    measure: i.measureLabel || i.measure || '',
    price: i.price ?? 0,
    subtotal: (i.price ?? 0) * (i.quantity ?? 1)
  })), [sourceItems])

  const total = useMemo(()=> cartRows.reduce((acc, r) => acc + Number(r.subtotal||0), 0), [cartRows])

  const csvRaw = useMemo(() => {
    if (!cartRows.length) return ''
    const header = ['Produto','SKU','Qtd','Unid','Medida','Preço','Subtotal']
    const lines = cartRows.map(r => [
      r.name,
      r.sku,
      r.quantity,
      r.unit,
      r.measure,
      String(r.price).replace('.',','),
      String(r.subtotal).replace('.',','),
    ].map(v => `"${String(v).replace(/"/g,'\"')}"`).join(','))
    return [header.join(','), ...lines].join('\n')
  }, [cartRows])

  async function onSubmit(data){
    if (submitting) return
    setSubmitting(true)
    try {
      // Use UTMs from context (already captured and persisted)
      const payloadArray = [{
        id: generateUniqueId('ECOMMERCE'),
        form_name: 'ECOMMERCE',
        site: window.location.hostname,
        page_url: window.location.href,
        submitted_at_iso: new Date().toISOString(),
        submitted_at_br: nowBRString(),
        name: data.name?.trim(),
        email: data.email?.trim(),
        phone_raw: data.phone?.trim(),
        phone_e164: toE164BR(data.phone),
        utm_source: utm.utm_source || '',
        utm_medium: utm.utm_medium || '',
        utm_campaign: utm.utm_campaign || '',
        utm_content: utm.utm_content || '',
        utm_term: utm.utm_term || '',
        utm_id: utm.utm_id || '',
        gclid: utm.gclid || '',
        fbclid: utm.fbclid || '',
        msclkid: utm.msclkid || '',
        cart_items: cartRows,
        cart_total: total,
        cart_items_raw_csv: csvRaw,
      }]

      const resp = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadArray)
      })
      if (!resp.ok) throw new Error(`n8n respondeu status ${resp.status}`)

      const wa = new URL(`https://wa.me/${WHATS_TARGET_E164}`)
      wa.searchParams.set('text', encodeURIComponent(WHATS_MSG))
      window.location.href = wa.toString()
    } catch (e) {
      console.error(e)
      alert('Houve um erro ao enviar o formulário.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null
  if (typeof document === 'undefined') return null

  const formatPrice = (val) => {
    const num = Number(val || 0)
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return createPortal(
    <Overlay role="dialog" aria-modal="true" onClick={onClose}>
      <Modal onClick={e=>e.stopPropagation()}>
        <ModalBody>
          {cartRows.length > 0 && (
            <>
              <SectionTitle>Produtos Selecionados</SectionTitle>
              <CartPreview>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th className="quantity">Qtd</th>
                        <th className="subtotal">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="product-name" title={row.name}>{row.name}</td>
                          <td className="quantity">{row.quantity}</td>
                          <td className="subtotal">{formatPrice(row.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
                <TotalRow>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </TotalRow>
              </CartPreview>
            </>
          )}

          <SectionTitle>Seus Dados</SectionTitle>
          <Form id="contactForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="name">Nome completo *</label>
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                autoComplete="name"
                {...register('name', { required: true })}
              />
              {errors.name && <div className="error">Por favor, informe seu nome</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register('email', { required: true })}
              />
              {errors.email && <div className="error">Por favor, informe um e-mail válido</div>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone / WhatsApp *</label>
              <input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                autoComplete="tel"
                {...register('phone', { required: true, minLength: 8 })}
                onInput={(e)=>{
                  const d = e.target.value.replace(/\D+/g,'').slice(0,11)
                  const p1 = d.slice(0,2)
                  const p2 = d.length>2 ? d.slice(2,7) : ''
                  const p3 = d.length>7 ? d.slice(7,11) : ''
                  e.target.value = d.length<=2 ? d : `(${p1}) ${p2}${p3?'-'+p3:''}`
                }}
              />
              {errors.phone && <div className="error">Por favor, informe seu telefone</div>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('confirmo', { required: true })}
                />
                Confirmo que esta solicitação trata-se apenas de um pedido de orçamento, e que os valores podem variar conforme a praça, o frete, as taxas e as demais condições comerciais.
              </label>
              {errors.confirmo && <div className="error">É necessário confirmar para enviar o orçamento</div>}
            </div>

            <div className="actions">
              <button type="submit" className="submit" disabled={submitting}>
                {submitting ? '⏳ Enviando...' : 'Solicitar Orçamento'}
              </button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </Overlay>,
    document.body
  )
}

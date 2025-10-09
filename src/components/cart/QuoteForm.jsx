import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useForm } from 'react-hook-form'
import { N8N_WEBHOOK_URL, WHATS_TARGET_E164, WHATS_MSG } from '../../lib/constants'
import { useCart } from '../../contexts/CardContext'

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
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 160ms ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Modal = styled.div`
  width: 96%;
  max-width: 560px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${popIn} 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label { font-size: 14px; color: #333; }
  input { height: 40px; padding: 0 12px; border: 1px solid #ddd; outline: none; }
  input:focus { border-color: var(--color--primary, #1f2937); }
  .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  button { height: 40px; padding: 0 16px; border: 0; cursor: pointer; }
  .submit { background: var(--color--green, #16a34a); color: #fff; }
  .cancel { background: #eee; color: #333; }
  .error { font-size: 12px; color: #b91c1c; }
`

const CartPreview = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
  background: #fafafa;
  max-height: 200px;
  overflow: auto;

  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; }
  th { background: #f7f7f7; position: sticky; top: 0; }
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
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

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
      const q = parseQueryParams()
      const payloadArray = [{
        id: generateUniqueId('fs-ORCAMENTO'),
        form_name: 'FORMULARIO-ORCAMENTO',
        site: window.location.hostname,
        page_url: window.location.href,
        submitted_at_iso: new Date().toISOString(),
        submitted_at_br: nowBRString(),
        name: data.name?.trim(),
        email: data.email?.trim(),
        phone_raw: data.phone?.trim(),
        phone_e164: toE164BR(data.phone),
        utm_source: q.utm_source,
        utm_medium: q.utm_medium,
        utm_campaign: q.utm_campaign,
        utm_content: q.utm_content,
        utm_term: q.utm_term,
        gclid: q.gclid,
        fbclid: q.fbclid,
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
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e=>e.stopPropagation()}>
        <Title>Solicitar orçamento</Title>

        {/* Removed on-screen items table to keep the form clean. CSV and payload remain intact. */}

        <Form id="contactForm" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name">Nome</label>
            <input id="name" type="text" placeholder="Seu nome" {...register('name', { required: true })} />
            {errors.name && <div className="error">Informe seu nome</div>}
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" placeholder="email@exemplo.com" {...register('email', { required: true })} />
            {errors.email && <div className="error">Informe um e-mail válido</div>}
          </div>
          <div>
            <label htmlFor="phone">Telefone</label>
            <input id="phone" type="tel" placeholder="(00) 00000-0000" {...register('phone', { required: true, minLength: 8 })} onInput={(e)=>{
              // light mask: keep digits, format as (xx) xxxxx-xxxx
              const d = e.target.value.replace(/\D+/g,'').slice(0,11)
              const p1 = d.slice(0,2)
              const p2 = d.length>2 ? d.slice(2,7) : ''
              const p3 = d.length>7 ? d.slice(7,11) : ''
              e.target.value = d.length<=2 ? d : `(${p1}) ${p2}${p3?'-'+p3:''}`
            }} />
            {errors.phone && <div className="error">Informe seu telefone</div>}
          </div>
          <div className="actions">
            <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar'}</button>
          </div>
        </Form>
      </Modal>
    </Overlay>
  )
}

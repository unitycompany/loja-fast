import React, { useState } from 'react'
import styled from 'styled-components'
import JsonLd from '../../../components/seo/JsonLd'

const Container = styled.section`
  width: 100%;
  padding: 2.5%;
  box-sizing: border-box;
  border-top: 1px solid #eee;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;

  @media (max-width: 768px){
    padding: 2.5%;  
  }

  & h3 {
    font-size: 18px;
    font-weight: 500;
    color: var(--color--black);
    margin-bottom: -8px;
  }
`

const Measures = styled.div`
  display:flex;
  gap:12px;
  flex-wrap:wrap;
`

const Measure = styled.button`
  padding: 8px 12px;
  box-shadow: var(--border-full);
  background: ${({ active }) => active ? '#f7f7f7' : 'transparent'};
  cursor: pointer;
  border-radius: 0;
`

const Technical = styled.table`
  width: 100%;
  border-collapse: collapse;
  td, th { padding: 8px; border: 1px solid #eee; text-align: left }
`

const RichContent = styled.div`
  color: #222;
  line-height: 1.6;
  font-size: 16px;
  letter-spacing: 0.1px;

  /* Headings */
  h1,h2,h3,h4,h5,h6 {
    margin: 20px 0 10px;
    line-height: 1.25;
    color: #111;
    font-weight: 600;
  }
  h1 { font-size: 1.875rem; }
  h2 { font-size: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 6px; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }

  /* Paragraphs */
  p { margin: 0 0 14px; }
  p + p { margin-top: 6px; }
  b, strong { font-weight: 600; color: #111; }
  i, em { font-style: italic; }
  br { content: ""; }

  /* Links */
  a { color: var(--color--primary); text-decoration: none; border-bottom: 1px dashed rgba(0,0,0,0.2); }
  a:hover { text-decoration: underline; border-bottom-color: transparent; }

  /* Lists */
  ul, ol {
    margin: 8px 0 14px 22px;
    padding-left: 20px;
  }
  ul { list-style: disc outside; }
  ol { list-style: decimal outside; }
  li { margin: 6px 0; }
  li > ul, li > ol { margin-top: 6px; }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    display: block;
    margin: 10px auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 14px 0;
    overflow: hidden;
    border: 1px solid #eee;
    border-radius: 6px;
  }
  table th, table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  table th { background: #f7f7f7; font-weight: 600; }
  table tr:nth-child(even) td { background: #fafafa; }
  table tr:last-child td { border-bottom: 0; }
  .table-wrapper { overflow-x: auto; }

  /* Blockquotes */
  blockquote {
    margin: 14px 0;
    padding: 10px 14px;
    border-left: 4px solid #D1D5DB;
    background: #F9FAFB;
    color: #374151;
    border-radius: 4px;
  }

  /* Code */
  code, pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    background: #f6f7f8;
    border-radius: 6px;
  }
  code { padding: 2px 6px; font-size: 0.95em; }
  pre { padding: 12px; overflow-x: auto; }
  pre code { padding: 0; background: transparent; }

  /* Horizontal rule */
  hr { border: 0; border-top: 1px solid #eee; margin: 16px 0; }
`

export default function Details({ product, selectedMeasureId, setSelectedMeasureId }){
  const measures = Array.isArray(product?.measures) ? product.measures : []
  const selected = measures.find(m=>m.id === selectedMeasureId) || measures[0]
  const resolvedSku = selected?.sku ? `${product?.sku || ''}-${selected.sku}` : (product?.sku || '')
  const resolvedGtin = selected?.gtin || product?.gtin
  const resolvedMpn = selected?.mpn || product?.mpn

  if (!product) return null

  // Helpers to decide rendering mode and cleanup for structured data
  const looksLikeHtml = (val) => typeof val === 'string' && /<\/?[a-z][\s\S]*>/i.test(val)
  const stripTags = (val) => typeof val === 'string' ? val.replace(/<[^>]*>/g, '').trim() : val

  // Prefer explicit HTML field, else render longDescription/description as HTML if they contain tags
  const htmlDescription = product.descriptionHtml
    || (looksLikeHtml(product.longDescription) ? product.longDescription : null)
    || (looksLikeHtml(product.description) ? product.description : null)

  const textDescription = !htmlDescription
    ? (product.longDescription || product.description || '')
    : ''

  return (
    <Container>
      {/* Descrição longa: HTML quando disponível/identificado, senão texto simples */}
      {htmlDescription ? (
        <RichContent dangerouslySetInnerHTML={{ __html: htmlDescription }} />
      ) : (
        <RichContent>{textDescription}</RichContent>
      )}

      <h3>Medidas disponíveis</h3>
      <Measures>
        {measures.map(m=> (
          <Measure key={m.id} active={m.id===selectedMeasureId} onClick={()=>setSelectedMeasureId(m.id)}>{m.label}</Measure>
        ))}
      </Measures>

      <h3>Informações técnicas</h3>
      <Technical>
        <tbody>
          <tr><th>SKU</th><td>{resolvedSku}</td></tr>
          {resolvedGtin ? (<tr><th>GTIN</th><td>{resolvedGtin}</td></tr>) : null}
          {resolvedMpn ? (<tr><th>MPN</th><td>{resolvedMpn}</td></tr>) : null}
          <tr><th>Peso</th><td>{product.weight ? `${product.weight.value} ${product.weight.unit}` : '-'}</td></tr>
          <tr><th>Dimensões (LxA)</th><td>{selected ? `${selected.width}${selected.unit} x ${selected.length}${selected.unit}` : '-'}</td></tr>
          {product.properties?.map((p,i)=> (
            <tr key={i}><th>{p.name}</th><td>{p.value}</td></tr>
          ))}
        </tbody>
      </Technical>

      {/* JSON-LD for variants/measures */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        description: stripTags(product.longDescription || product.description || ''),
        offers: {
          '@type': 'AggregateOffer',
          offerCount: measures.length,
          priceCurrency: 'BRL',
          lowPrice: measures.length ? Math.min(...measures.map(m=>m.price||product.price)) : product.price,
          offers: measures.map(m=>({ '@type':'Offer', price: m.price || product.price, priceCurrency: 'BRL', sku: product.sku + '-' + m.id }))
        }
      }} />
    </Container>
  )
}

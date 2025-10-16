import React from 'react'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
`

const Spinner = styled.div`
  width: ${p => p.size || 48}px;
  height: ${p => p.size || 48}px;
  border: 4px solid rgba(208, 36, 40, 0.1);
  border-top-color: var(--color--primary, #D02428);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

const Label = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: var(--color--black-3);
  text-align: center;
`

/**
 * Loading centralizado na tela com overlay
 * @param {object} props
 * @param {string} props.label - Texto do loading
 * @param {number} props.size - Tamanho do spinner
 * @param {boolean} props.overlay - Se deve mostrar overlay de fundo
 */
export default function CenteredLoader({ label = 'Carregando...', size = 48, overlay = true }) {
  const content = (
    <Container>
      <Spinner size={size} aria-hidden />
      {label && <Label>{label}</Label>}
    </Container>
  )

  if (overlay) {
    return <Overlay>{content}</Overlay>
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '400px',
      width: '100%'
    }}>
      {content}
    </div>
  )
}

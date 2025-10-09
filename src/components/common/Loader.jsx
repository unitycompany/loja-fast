import React from 'react'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color--black-4);
`

const Spinner = styled.div`
  width: ${p => p.size || 24}px;
  height: ${p => p.size || 24}px;
  border: 3px solid rgba(0,0,0,0.08);
  border-top-color: var(--color--primary, #0ea5e9);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

export default function Loader({ label = 'Carregando...', size = 24, style }){
  return (
    <Wrap style={style}>
      <Spinner size={size} aria-hidden />
      <span style={{ fontSize: 14 }}>{label}</span>
    </Wrap>
  )
}

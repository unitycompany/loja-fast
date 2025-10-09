import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  getCurrentAdminSession,
  onAdminAuthStateChange,
  signInAdminWithCredentials,
  signOutAdmin
} from '../../services/adminAuth'

const Gate = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  max-width: 420px;
  padding: 16px;
  background: var(--color--white);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  button {
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: var(--color--primary);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: filter 160ms ease;

    &:disabled {
      opacity: 0.7;
      cursor: default;
    }

    &:not(:disabled):hover {
      filter: brightness(0.95);
    }
  }
`

const Field = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color--gray-5);
  background: var(--color--white-2);
  font-size: 14px;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;

  &:focus {
    border-color: var(--color--primary);
    background: #fff;
    box-shadow: 0 0 0 2px rgba(208, 36, 40, 0.12);
    outline: none;
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const ErrorMessage = styled.span`
  color: var(--color--primary);
  font-size: 13px;
`

const SessionBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--color--white);
  box-shadow: var(--shadow-sm);

  strong {
    color: var(--color--black-2);
  }

  button {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid var(--color--gray-5);
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    transition: background 160ms ease, border-color 160ms ease;

    &:hover {
      background: var(--color--white-2);
      border-color: var(--color--primary);
    }
  }
`

const LoadingBox = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 12px;
  background: var(--color--white);
  box-shadow: var(--shadow-sm);
  font-size: 14px;
`

export default function AdminGate({ children }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sessionEmail, setSessionEmail] = useState('')
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const session = await getCurrentAdminSession()
        if (active && session) {
          setAllowed(true)
          const currentEmail = session.user?.email || ''
          setSessionEmail(currentEmail)
          setEmail(currentEmail)
        }
      } catch (err) {
        console.error('Falha ao verificar sessão administrativa.', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    const unsubscribe = onAdminAuthStateChange((session) => {
      if (!active) return
      setAllowed(!!session)
      const currentEmail = session?.user?.email || ''
      setSessionEmail(currentEmail)
      if (session) {
        setEmail(currentEmail)
        setError('')
      } else {
        setPassword('')
      }
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const session = await signInAdminWithCredentials(email, password)
      const currentEmail = session?.user?.email || email
      setAllowed(true)
      setSessionEmail(currentEmail)
      setPassword('')
    } catch (err) {
      setAllowed(false)
      setError(err?.message || 'Não foi possível fazer login.')
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }, [email, password, submitting])

  const handleSignOut = useCallback(async () => {
    setError('')
    try {
      await signOutAdmin()
    } catch (err) {
      setError(err?.message || 'Não foi possível encerrar a sessão.')
    }
  }, [])

  if (loading) {
    return (
      <LoadingBox>
        Verificando sessão administrativa...
      </LoadingBox>
    )
  }

  if (!allowed) {
    return (
      <Gate onSubmit={handleSubmit}>
        <h3>Acesso restrito</h3>
        <Field
          type="email"
          placeholder="E-mail do administrador"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Field
          type="password"
          placeholder="Senha do Supabase"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        <Actions>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </Actions>
      </Gate>
    )
  }

  return (
    <div>
      <SessionBar>
        <span>Autenticado como <strong>{sessionEmail || email}</strong></span>
        <button type="button" onClick={handleSignOut}>Sair</button>
      </SessionBar>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      {children}
    </div>
  )
}

import { supabase } from './supabase'

let pendingEnsurePromise = null

function translateAuthError(error) {
  const message = error?.message || ''
  const lower = message.toLowerCase()

  if (!message) {
    return 'Falha ao autenticar. Tente novamente em instantes.'
  }

  if (lower.includes('invalid login credentials')) {
    return 'Credenciais inválidas. Confira e tente novamente.'
  }

  if (lower.includes('email not confirmed')) {
    return 'O e-mail ainda não foi confirmado no Supabase.'
  }

  if (lower.includes('email provider disabled')) {
    return 'O provedor de login por e-mail e senha está desativado no Supabase.'
  }

  return message
}

export async function signInAdminWithCredentials(email, password) {
  const trimmedEmail = (email || '').trim()
  if (!trimmedEmail || !password) {
    throw new Error('Informe e-mail e senha para acessar o painel administrativo.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })

  if (error) {
    throw new Error(translateAuthError(error))
  }

  if (!data?.session) {
    throw new Error('Falha ao iniciar a sessão administrativa.')
  }

  return data.session
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(translateAuthError(error))
  }
}

export async function getCurrentAdminSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error(translateAuthError(error))
  }
  return data?.session ?? null
}

export function onAdminAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    try {
      callback(session)
    } catch (error) {
      console.error('[adminAuth] Erro ao propagar alteração de sessão.', error)
    }
  })

  const subscription = data?.subscription

  return () => {
    try {
      subscription?.unsubscribe?.()
    } catch (error) {
      console.error('[adminAuth] Erro ao cancelar inscrição de sessão.', error)
    }
  }
}

export async function ensureAdminSession() {
  if (!pendingEnsurePromise) {
    pendingEnsurePromise = (async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        throw new Error(translateAuthError(error))
      }
      if (data?.session) {
        return data.session
      }
      const sessionError = new Error('Sessão administrativa não encontrada. Faça login novamente.')
      sessionError.code = 'ADMIN_SESSION_NOT_FOUND'
      throw sessionError
    })()
  }

  try {
    return await pendingEnsurePromise
  } finally {
    pendingEnsurePromise = null
  }
}

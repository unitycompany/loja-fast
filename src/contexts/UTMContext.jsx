/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Keys to persist (common marketing params)
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid',
  'dclid',
  'ref' // simple referral param
]

const STORAGE_KEY = 'utm_persist_v1'
// Default retention window (in ms). 90 days.
const DEFAULT_TTL = 90 * 24 * 60 * 60 * 1000

const UTMContext = createContext({ utm: {}, setUTM: () => {}, clearUTM: () => {} })

function now() { return Date.now ? Date.now() : new Date().getTime() }

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const { utm, savedAt, ttl } = parsed
    if (!utm || !savedAt) return null
    const isExpired = (now() - savedAt) > (ttl || DEFAULT_TTL)
    if (isExpired) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch { return null }
}

function writeStored(utm, ttl = DEFAULT_TTL) {
  try {
    if (!utm || Object.keys(utm).length === 0) return
    const payload = { utm, savedAt: now(), ttl }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) { void e }
}

function removeStored() {
  try { localStorage.removeItem(STORAGE_KEY) } catch (e) { void e }
}

function pickUTMFromSearch(search) {
  const params = new URLSearchParams(search || '')
  const picked = {}
  for (const key of UTM_KEYS) {
    const val = params.get(key)
    if (val != null && val !== '') picked[key] = val
  }
  return picked
}

function mergeSearchWithUTM(search, utm) {
  const params = new URLSearchParams(search || '')
  let changed = false
  for (const [k, v] of Object.entries(utm || {})) {
    if (!params.has(k)) {
      params.set(k, v)
      changed = true
    }
  }
  return { search: params.toString(), changed }
}

export function UTMProvider({ children, ttl = DEFAULT_TTL, appendToUrl = true, excludePaths = ['/admin'] }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [utm, setUTMState] = useState(() => readStored()?.utm || {})
  const lastPathRef = useRef(location.pathname + location.search + location.hash)

  const setUTM = useCallback((next) => {
    const value = typeof next === 'function' ? next(utm) : next
    setUTMState(value)
    writeStored(value, ttl)
  }, [utm, ttl])

  const clearUTM = useCallback(() => {
    setUTMState({})
    removeStored()
  }, [])

  // On route/search change: capture and optionally append
  useEffect(() => {
    const currentKey = location.pathname + location.search + location.hash
    if (currentKey === lastPathRef.current) return
    lastPathRef.current = currentKey

    const isExcluded = excludePaths.some(p => location.pathname.startsWith(p))

    // 1) If URL carries UTM, capture and persist
    const found = pickUTMFromSearch(location.search)
    if (Object.keys(found).length > 0) {
      setUTM(prev => ({ ...prev, ...found }))
      return // Already has UTM; don't force-append
    }

    // 2) If URL has no UTM and we have stored, optionally append to URL
    if (!isExcluded && appendToUrl) {
      const stored = readStored()
      const storedUTM = stored?.utm
      if (storedUTM && Object.keys(storedUTM).length > 0) {
        const { search, changed } = mergeSearchWithUTM(location.search, storedUTM)
        if (changed) {
          // preserve pathname and hash, replace history to avoid stacking
          navigate({ pathname: location.pathname, search: search ? `?${search}` : '', hash: location.hash }, { replace: true })
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash])

  const value = useMemo(() => ({ utm, setUTM, clearUTM }), [utm, setUTM, clearUTM])
  return (
    <UTMContext.Provider value={value}>
      {children}
    </UTMContext.Provider>
  )
}

export function useUTM() {
  return useContext(UTMContext)
}

export default UTMContext

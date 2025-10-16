/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { setUTMString } from '../utils/url'

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

const UTMContext = createContext({ utm: {}, utmString: '', setUTM: () => {}, clearUTM: () => {} })

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

function utmObjectToString(utm) {
  if (!utm || Object.keys(utm).length === 0) return ''
  const params = new URLSearchParams()
  Object.entries(utm).forEach(([key, value]) => {
    params.set(key, value)
  })
  return `?${params.toString()}`
}

export function UTMProvider({ children, ttl = DEFAULT_TTL }) {
  const location = useLocation()
  const [utm, setUTMState] = useState(() => readStored()?.utm || {})
  const [utmString, setUtmStringState] = useState(() => {
    const stored = readStored()?.utm || {}
    return utmObjectToString(stored)
  })

  const setUTM = useCallback((next) => {
    const value = typeof next === 'function' ? next(utm) : next
    setUTMState(value)
    writeStored(value, ttl)
    const stringValue = utmObjectToString(value)
    setUtmStringState(stringValue)
    setUTMString(stringValue) // Update global
  }, [utm, ttl])

  const clearUTM = useCallback(() => {
    setUTMState({})
    setUtmStringState('')
    removeStored()
    setUTMString('') // Clear global
  }, [])

  // Capture UTMs from URL on mount and route changes
  useEffect(() => {
    const found = pickUTMFromSearch(location.search)
    if (Object.keys(found).length > 0) {
      // Merge with existing UTMs (new ones override old ones)
      setUTM(prev => ({ ...prev, ...found }))
    } else {
      // If no UTMs in URL but we have stored, update the URL
      const stored = readStored()
      if (stored?.utm && Object.keys(stored.utm).length > 0) {
        const params = new URLSearchParams(location.search)
        let changed = false
        
        Object.entries(stored.utm).forEach(([key, value]) => {
          if (!params.has(key)) {
            params.set(key, value)
            changed = true
          }
        })
        
        if (changed) {
          const newUrl = `${location.pathname}?${params.toString()}${location.hash}`
          window.history.replaceState(null, '', newUrl)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  // Initialize global UTM string on mount
  useEffect(() => {
    setUTMString(utmString)
  }, [utmString])

  const value = useMemo(() => ({ utm, utmString, setUTM, clearUTM }), [utm, utmString, setUTM, clearUTM])
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

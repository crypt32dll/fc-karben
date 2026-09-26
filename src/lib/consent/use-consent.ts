'use client'

import { useCallback, useSyncExternalStore } from 'react'

import {
  CONSENT_STORAGE_KEY,
  type ConsentPreferences,
  DEFAULT_CONSENT,
  parseConsent,
  writeConsentToStorage,
} from './storage'

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener('storage', handler)
  window.addEventListener('fc-karben-consent', handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener('fc-karben-consent', handler)
  }
}

/** Cached so getSnapshot returns a stable reference unless storage changed. */
let cachedRaw: string | null | undefined
let cachedSnapshot: ConsentPreferences = DEFAULT_CONSENT

function getSnapshot(): ConsentPreferences {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    raw = null
  }
  if (raw === cachedRaw) return cachedSnapshot
  cachedRaw = raw
  cachedSnapshot = parseConsent(raw)
  return cachedSnapshot
}

function getServerSnapshot(): ConsentPreferences {
  return DEFAULT_CONSENT
}

export function useConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setConsent = useCallback((next: ConsentPreferences) => {
    writeConsentToStorage(next)
  }, [])

  return { consent, setConsent, decided: Boolean(consent.decidedAt) }
}

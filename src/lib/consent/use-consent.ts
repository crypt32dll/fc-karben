'use client'

import { useCallback, useSyncExternalStore } from 'react'

import {
  type ConsentPreferences,
  DEFAULT_CONSENT,
  readConsentFromStorage,
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

function getSnapshot(): ConsentPreferences {
  return readConsentFromStorage()
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

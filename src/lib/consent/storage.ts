/** Third-party embed / cookie consent — persisted in localStorage (not a tracking cookie). */

export const CONSENT_STORAGE_KEY = 'fc-karben-consent-v1'
export const CONSENT_VERSION = 1 as const

export type ConsentPreferences = {
  version: typeof CONSENT_VERSION
  /** ISO timestamp when the visitor last saved a choice; null = banner still open */
  decidedAt: string | null
  /** Load fussball.de / DFB widgets without asking again */
  fussballDe: boolean
  /** Load Google Calendar embed (Platzbelegung) without asking again */
  googleCalendar: boolean
}

export const DEFAULT_CONSENT: ConsentPreferences = {
  version: CONSENT_VERSION,
  decidedAt: null,
  fussballDe: false,
  googleCalendar: false,
}

export function parseConsent(raw: string | null): ConsentPreferences {
  if (!raw) return DEFAULT_CONSENT
  try {
    const data = JSON.parse(raw) as Partial<ConsentPreferences>
    if (data.version !== CONSENT_VERSION) return DEFAULT_CONSENT
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof data.decidedAt === 'string' ? data.decidedAt : null,
      fussballDe: Boolean(data.fussballDe),
      googleCalendar: Boolean(data.googleCalendar),
    }
  } catch {
    return DEFAULT_CONSENT
  }
}

export function readConsentFromStorage(): ConsentPreferences {
  if (typeof window === 'undefined') return DEFAULT_CONSENT
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY))
  } catch {
    return DEFAULT_CONSENT
  }
}

export function writeConsentToStorage(next: ConsentPreferences): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('fc-karben-consent'))
  } catch {
    // private mode / quota — ignore
  }
}

export function acceptEssentialOnly(): ConsentPreferences {
  const next: ConsentPreferences = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    fussballDe: false,
    googleCalendar: false,
  }
  writeConsentToStorage(next)
  return next
}

export function acceptAllExternal(): ConsentPreferences {
  const next: ConsentPreferences = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    fussballDe: true,
    googleCalendar: true,
  }
  writeConsentToStorage(next)
  return next
}

export function saveConsentChoices(partial: {
  fussballDe: boolean
  googleCalendar: boolean
}): ConsentPreferences {
  const next: ConsentPreferences = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    fussballDe: partial.fussballDe,
    googleCalendar: partial.googleCalendar,
  }
  writeConsentToStorage(next)
  return next
}

/** Grant fussball.de embeds site-wide (e.g. after “Spielplan anzeigen” / “Alle erlauben”). */
export function grantFussballDeConsent(): ConsentPreferences {
  const current = readConsentFromStorage()
  const next: ConsentPreferences = {
    ...current,
    version: CONSENT_VERSION,
    decidedAt: current.decidedAt ?? new Date().toISOString(),
    fussballDe: true,
  }
  writeConsentToStorage(next)
  return next
}

export function grantGoogleCalendarConsent(): ConsentPreferences {
  const current = readConsentFromStorage()
  const next: ConsentPreferences = {
    ...current,
    version: CONSENT_VERSION,
    decidedAt: current.decidedAt ?? new Date().toISOString(),
    googleCalendar: true,
  }
  writeConsentToStorage(next)
  return next
}

/** Re-open the cookie banner (footer “Cookie-Einstellungen”). */
export function reopenConsentBanner(): ConsentPreferences {
  const current = readConsentFromStorage()
  const next: ConsentPreferences = { ...current, decidedAt: null }
  writeConsentToStorage(next)
  return next
}

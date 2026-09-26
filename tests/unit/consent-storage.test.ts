import { describe, expect, it } from 'vitest'

import { DEFAULT_CONSENT, parseConsent } from '../../src/lib/consent/storage'

describe('consent storage', () => {
  it('returns defaults for empty or invalid input', () => {
    expect(parseConsent(null)).toEqual(DEFAULT_CONSENT)
    expect(parseConsent('{')).toEqual(DEFAULT_CONSENT)
    expect(parseConsent(JSON.stringify({ version: 99 }))).toEqual(DEFAULT_CONSENT)
  })

  it('parses a valid stored preference', () => {
    const parsed = parseConsent(
      JSON.stringify({
        version: 1,
        decidedAt: '2026-09-26T12:00:00.000Z',
        fussballDe: true,
        googleCalendar: false,
      }),
    )
    expect(parsed.decidedAt).toBe('2026-09-26T12:00:00.000Z')
    expect(parsed.fussballDe).toBe(true)
    expect(parsed.googleCalendar).toBe(false)
  })
})

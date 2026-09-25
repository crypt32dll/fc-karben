import { describe, expect, it } from 'vitest'

import {
  mergeMatches,
  normalizeFussballDeMatch,
  pickNextMatch,
} from '../../src/lib/match-feed/index'

describe('MatchFeed', () => {
  it('normalizes fussball.de-like payload', () => {
    const match = normalizeFussballDeMatch({
      id: 'abc',
      kickoff: '2026-10-24T19:05:00.000Z',
      home: 'FC Karben',
      away: 'SG Melbach',
      competition: 'Kreispokal',
    })
    expect(match.externalId).toBe('abc')
    expect(match.homeName).toBe('FC Karben')
    expect(match.status).toBe('scheduled')
  })

  it('lets manual overrides win', () => {
    const synced = [
      normalizeFussballDeMatch({
        id: '1',
        kickoff: '2026-10-24T19:05:00.000Z',
        home: 'FC Karben',
        away: 'A',
      }),
    ]
    const overrides = [
      normalizeFussballDeMatch({
        id: '1',
        kickoff: '2026-10-24T20:00:00.000Z',
        home: 'FC Karben',
        away: 'A (Freundschaft)',
      }),
    ]
    const merged = mergeMatches(synced, overrides)
    expect(merged).toHaveLength(1)
    expect(merged[0].awayName).toContain('Freundschaft')
  })

  it('picks next upcoming match', () => {
    const now = new Date('2026-10-01T12:00:00.000Z')
    const matches = [
      normalizeFussballDeMatch({
        id: 'past',
        kickoff: '2026-09-01T12:00:00.000Z',
        home: 'A',
        away: 'B',
        finished: true,
      }),
      normalizeFussballDeMatch({
        id: 'next',
        kickoff: '2026-10-24T19:05:00.000Z',
        home: 'FC Karben',
        away: 'SG Melbach',
      }),
    ]
    const next = pickNextMatch(matches, now)
    expect(next?.externalId).toBe('next')
  })
})

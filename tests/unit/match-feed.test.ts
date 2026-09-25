import { describe, expect, it } from 'vitest'

import {
  extractFussballDeTeamId,
  normalizeFussballDeMatch,
  parseBerlinKickoff,
  parseFussballDeMatchplanHtml,
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

  it('parses Berlin kickoff from fussball.de labels', () => {
    const kickoff = parseBerlinKickoff('So, 27.09.26', '15:30')
    expect(kickoff).not.toBeNull()
    expect(kickoff!.toISOString()).toBe('2026-09-27T13:30:00.000Z')
  })

  it('extracts team-id from URL or raw id', () => {
    expect(
      extractFussballDeTeamId(
        'https://www.fussball.de/mannschaft/x/-/saison/2627/team-id/01OT7G9AUK000000VV0AG80NVT74RFIN#!/',
      ),
    ).toBe('01OT7G9AUK000000VV0AG80NVT74RFIN')
    expect(extractFussballDeTeamId('01OT7G9AUK000000VV0AG80NVT74RFIN')).toBe(
      '01OT7G9AUK000000VV0AG80NVT74RFIN',
    )
  })

  it('parses next-games HTML into MatchDto', () => {
    const html = `
      <tr class="odd row-competition hidden-small">
        <td class="column-date"><span class="hidden-small inline">So, 27.09.26 |&nbsp;</span>15:30</td>
        <td colspan="3" class="column-team"><a>Gruppenliga</a></td>
      </tr>
      <tr class="odd">
        <td class="column-club"><div class="club-name">FC Karben</div></td>
        <td class="column-colon">:</td>
        <td class="column-club"><div class="club-name">FC Germ. 08 Ginnheim</div></td>
        <td class="column-score">
          <a href="https://www.fussball.de/spiel/fc-karben-fc-germ-08-ginnheim/-/spiel/0318IKSNSO000000VS5489BUVV628VP4">x</a>
        </td>
      </tr>
    `
    const matches = parseFussballDeMatchplanHtml(html)
    expect(matches).toHaveLength(1)
    expect(matches[0].externalId).toBe('0318IKSNSO000000VS5489BUVV628VP4')
    expect(matches[0].homeName).toBe('FC Karben')
    expect(matches[0].awayName).toBe('FC Germ. 08 Ginnheim')
    expect(matches[0].competition).toBe('Gruppenliga')
    expect(matches[0].kickoff.toISOString()).toBe('2026-09-27T13:30:00.000Z')
  })
})

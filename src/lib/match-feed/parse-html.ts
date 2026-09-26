import type { MatchDto } from './dto'
import { parseBerlinKickoff } from './kickoff'

/**
 * Parse HTML from fussball.de ajax.team.next.games / matchplan endpoints.
 * Structure: competition row (date + league) followed by fixture row (clubs + spiel-id).
 */
export function parseFussballDeMatchplanHtml(html: string): MatchDto[] {
  const matches: MatchDto[] = []
  const rowRe =
    /column-date[\s\S]*?(\w{2}, \d{2}\.\d{2}\.\d{2})[\s\S]*?(\d{2}:\d{2})[\s\S]*?column-team[\s\S]*?<a[^>]*>\s*([^<]+?)\s*<\/a>[\s\S]*?<\/tr>\s*<tr[^>]*>[\s\S]*?club-name">\s*([^<]+?)\s*<[\s\S]*?club-name">\s*([^<]+?)\s*<[\s\S]*?\/spiel\/[^"'/]+\/-\/spiel\/([A-Z0-9]+)/g

  for (const m of html.matchAll(rowRe)) {
    const [, dateLabel, time, competition, home, away, spielId] = m
    const kickoff = parseBerlinKickoff(dateLabel, time)
    if (!kickoff || Number.isNaN(kickoff.getTime())) continue

    const cancelled = /abgesagt|ausgefallen/i.test(m[0])
    matches.push({
      externalId: spielId,
      kickoff,
      homeName: home.trim(),
      awayName: away.trim(),
      competition: competition.trim() || undefined,
      status: cancelled ? 'cancelled' : 'scheduled',
      sourceUrl: `https://www.fussball.de/spiel/-/spiel/${spielId}`,
      homeScore: null,
      awayScore: null,
    })
  }

  return matches
}

/** Extract team-id from a fussball.de Mannschaft URL. */
export function extractFussballDeTeamId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null
  const trimmed = urlOrId.trim()
  if (/^[A-Z0-9]{20,}$/i.test(trimmed)) return trimmed.toUpperCase()
  const match = trimmed.match(/team-id\/([A-Z0-9]+)/i)
  return match?.[1]?.toUpperCase() ?? null
}

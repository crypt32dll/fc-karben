export type MatchDto = {
  externalId: string
  kickoff: Date
  homeName: string
  awayName: string
  competition?: string
  venue?: string
  homeScore?: number | null
  awayScore?: number | null
  status: 'scheduled' | 'live' | 'finished' | 'cancelled'
  sourceUrl?: string
  /** Mannschaft slug when the fixture was loaded from the CMS. */
  teamSlug?: string
}

export type MatchFeedSource = {
  fetchUpcoming: (teamId: string) => Promise<MatchDto[]>
}

/** `unstable_cache` JSON-round-trips Dates into ISO strings. */
export type MatchKickoff = Date | string

export const asKickoffDate = (kickoff: MatchKickoff): Date =>
  kickoff instanceof Date ? kickoff : new Date(kickoff)

/**
 * Clean club/competition labels from fussball.de HTML entities and zero-width chars.
 * Safe to run on read and write — React cannot decode entities in text nodes.
 */
export function sanitizeMatchLabel(value: string): string {
  let out = value
  for (let i = 0; i < 3; i++) {
    const next = out
      .replace(/&amp;/gi, '&')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
        const code = Number.parseInt(hex, 16)
        return Number.isFinite(code) ? String.fromCodePoint(code) : ''
      })
      .replace(/&#(\d+);/g, (_, n: string) => {
        const code = Number(n)
        return Number.isFinite(code) ? String.fromCodePoint(code) : ''
      })
    if (next === out) break
    out = next
  }
  return out
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const kickoffMs = (kickoff: MatchKickoff): number => asKickoffDate(kickoff).getTime()

/** Pick the next upcoming match (kickoff >= now − 3h grace), or null */
export function pickNextMatch(
  matches: Array<Omit<MatchDto, 'kickoff'> & { kickoff: MatchKickoff }>,
  now = new Date(),
): MatchDto | null {
  const graceMs = 3 * 60 * 60 * 1000
  const upcoming = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .map((m) => ({ match: m, time: kickoffMs(m.kickoff) }))
    .filter((row) => !Number.isNaN(row.time) && row.time >= now.getTime() - graceMs)
    .sort((a, b) => a.time - b.time)
  const next = upcoming[0]
  if (!next) return null
  return { ...next.match, kickoff: new Date(next.time) }
}

/** Next upcoming fixture for one Mannschaft slug. */
export function pickNextMatchForTeam(
  matches: Array<Omit<MatchDto, 'kickoff'> & { kickoff: MatchKickoff }>,
  teamSlug: string,
  now = new Date(),
): MatchDto | null {
  return pickNextMatch(
    matches.filter((match) => match.teamSlug === teamSlug),
    now,
  )
}

export function normalizeFussballDeMatch(raw: {
  id: string
  kickoff: string
  home: string
  away: string
  competition?: string
  venue?: string
  homeScore?: number | null
  awayScore?: number | null
  finished?: boolean
  url?: string
}): MatchDto {
  const finished = Boolean(raw.finished)
  return {
    externalId: raw.id,
    kickoff: new Date(raw.kickoff),
    homeName: raw.home,
    awayName: raw.away,
    competition: raw.competition,
    venue: raw.venue,
    homeScore: raw.homeScore ?? null,
    awayScore: raw.awayScore ?? null,
    status: finished ? 'finished' : 'scheduled',
    sourceUrl: raw.url,
  }
}

export const emptyMatchFeedSource: MatchFeedSource = {
  async fetchUpcoming() {
    return []
  },
}

/** 1. Mannschaft FC Karben — season 26/27 team-id on fussball.de */
export const FIRST_TEAM_FUSSBALL_DE_ID = '01OT7G9AUK000000VV0AG80NVT74RFIN'

/** 2. Mannschaft FC Karben — season 26/27 team-id on fussball.de */
export const SECOND_TEAM_FUSSBALL_DE_ID = '01OT7GCS8S000000VV0AG80NVT74RFIN'

/** 3. Mannschaft / SG Karben III — season 26/27 team-id on fussball.de */
export const THIRD_TEAM_FUSSBALL_DE_ID = '02IDOPSOPK000000VS5489B1VUG7QVAU'

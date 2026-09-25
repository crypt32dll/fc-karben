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
}

export type MatchFeedSource = {
  fetchUpcoming: (teamId: string) => Promise<MatchDto[]>
}

/** Merge synced matches with manual overrides — overrides win by externalId */
export function mergeMatches(synced: MatchDto[], overrides: MatchDto[]): MatchDto[] {
  const byId = new Map<string, MatchDto>()
  for (const match of synced) {
    byId.set(match.externalId, match)
  }
  for (const override of overrides) {
    byId.set(override.externalId, override)
  }
  return [...byId.values()].sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())
}

/** Pick the next upcoming match (kickoff >= now), or null */
export function pickNextMatch(matches: MatchDto[], now = new Date()): MatchDto | null {
  const upcoming = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .filter((m) => m.kickoff.getTime() >= now.getTime() - 3 * 60 * 60 * 1000)
    .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())
  return upcoming[0] ?? null
}

/**
 * Normalize a minimal Fussball.de-like payload into MatchDto.
 * Used by unit tests and manual seed helpers.
 */
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

/** Stub source for tests / offline */
export const emptyMatchFeedSource: MatchFeedSource = {
  async fetchUpcoming() {
    return []
  },
}

/** 1. Mannschaft FC Karben — season 26/27 team-id on fussball.de */
export const FIRST_TEAM_FUSSBALL_DE_ID = '01OT7G9AUK000000VV0AG80NVT74RFIN'

export { fussballDeMatchFeedSource } from './fussball-de'
export { extractFussballDeTeamId, parseFussballDeMatchplanHtml } from './parse-html'
export { parseBerlinKickoff } from './kickoff'
export { resolveNextMatch, syncMatchFeed } from './sync'

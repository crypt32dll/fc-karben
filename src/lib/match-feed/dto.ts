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

import { unstable_cache } from 'next/cache'
import type { Payload } from 'payload'

import { revalidateCatalogPaths, revalidateCatalogTags } from '../cache/revalidate'
import { CACHE_TAGS, CATALOG_REVALIDATE } from '../cache/tags'
import { clubTeams } from '../club-paths'
import { createLogger } from '../logger'
import { getPayloadClient } from '../payload'
import {
  asKickoffDate,
  FIRST_TEAM_FUSSBALL_DE_ID,
  type MatchDto,
  pickNextMatch,
  pickNextMatchForTeam,
  SECOND_TEAM_FUSSBALL_DE_ID,
  sanitizeMatchLabel,
  THIRD_TEAM_FUSSBALL_DE_ID,
} from './dto'
import { fussballDeMatchFeedSource } from './fussball-de'
import { extractFussballDeTeamId } from './parse-html'

const log = createLogger('MatchFeed')

const fallbackFussballDeTeamId = (slug: string | null | undefined): string | null => {
  if (slug === clubTeams.first.slug) return FIRST_TEAM_FUSSBALL_DE_ID
  if (slug === clubTeams.second.slug) return SECOND_TEAM_FUSSBALL_DE_ID
  if (slug === clubTeams.third.slug) return THIRD_TEAM_FUSSBALL_DE_ID
  return null
}

export type SyncMatchFeedResult = {
  teamId: string
  fetched: number
  created: number
  updated: number
  nextExternalId: string | null
}

type SyncTeam = {
  id: number
  fussballDeId: string
}

/** Resolve Mannschaften with syncMatches for MatchFeed. */
export async function findSyncTeams(payload: Payload): Promise<SyncTeam[]> {
  const result = await payload.find({
    collection: 'teams',
    where: { syncMatches: { equals: true } },
    limit: 5,
    depth: 0,
    overrideAccess: true,
  })

  const teams: SyncTeam[] = []
  for (const doc of result.docs) {
    const id =
      extractFussballDeTeamId(doc.fussballDeId) ||
      extractFussballDeTeamId(doc.fussballDeUrl) ||
      fallbackFussballDeTeamId(doc.slug)
    if (!id) {
      log.warn('sync team missing fussball.de id', { team: doc.id, slug: doc.slug })
      continue
    }
    teams.push({ id: Number(doc.id), fussballDeId: id })
  }
  return teams
}

/** Daily cron: fussball.de → Matches upsert; then revalidate homepage. */
export async function syncMatchFeed(payload?: Payload): Promise<SyncMatchFeedResult[]> {
  const client = payload ?? (await getPayloadClient())
  const teams = await findSyncTeams(client)
  if (!teams.length) {
    log.warn('no teams with syncMatches=true')
    return []
  }

  const results: SyncMatchFeedResult[] = []

  for (const team of teams) {
    const fetched = await fussballDeMatchFeedSource.fetchUpcoming(team.fussballDeId)
    let created = 0
    let updated = 0

    for (const match of fetched) {
      const existing = await client.find({
        collection: 'matches',
        where: { externalId: { equals: match.externalId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const doc = existing.docs[0]

      const data = {
        team: team.id,
        kickoff: match.kickoff.toISOString(),
        homeName: sanitizeMatchLabel(match.homeName),
        awayName: sanitizeMatchLabel(match.awayName),
        competition: match.competition ? sanitizeMatchLabel(match.competition) : null,
        venue: match.venue ? sanitizeMatchLabel(match.venue) : null,
        homeScore: match.homeScore ?? null,
        awayScore: match.awayScore ?? null,
        status: match.status,
        externalId: match.externalId,
        source: 'fussballde' as const,
        sourceUrl: match.sourceUrl || null,
      }

      if (doc) {
        await client.update({
          collection: 'matches',
          id: doc.id,
          data,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        updated += 1
      } else {
        await client.create({
          collection: 'matches',
          data,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        created += 1
      }
    }

    const next = pickNextMatch(fetched)
    results.push({
      teamId: team.fussballDeId,
      fetched: fetched.length,
      created,
      updated,
      nextExternalId: next?.externalId ?? null,
    })
    log.info('synced team matches', results[results.length - 1])
  }

  revalidateCatalogTags(CACHE_TAGS.matches)
  revalidateCatalogPaths('/')

  return results
}

export type ScoreboardFixture = {
  teamSlug: string
  teamLabel: string
  match: MatchDto | null
}

const SCOREBOARD_ROWS = [
  { teamSlug: clubTeams.first.slug, teamLabel: clubTeams.first.label },
  { teamSlug: clubTeams.second.slug, teamLabel: clubTeams.second.label },
  { teamSlug: clubTeams.third.slug, teamLabel: clubTeams.third.label },
] as const

/** Upcoming fixtures from CMS (tag-cached). Dates are revived after the JSON cache. */
export async function listUpcomingMatches(): Promise<MatchDto[]> {
  const cached = await unstable_cache(() => loadUpcomingMatches(), ['upcoming-matches-sanitized'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.matches],
  })()
  return cached.map((match) => ({
    ...match,
    kickoff: asKickoffDate(match.kickoff),
    homeName: sanitizeMatchLabel(match.homeName),
    awayName: sanitizeMatchLabel(match.awayName),
    competition: match.competition ? sanitizeMatchLabel(match.competition) : undefined,
    venue: match.venue ? sanitizeMatchLabel(match.venue) : undefined,
  }))
}

/** Scoreboard rows: next fixture per Mannschaft (no live fussball.de on pageview). */
export async function getScoreboardFixtures(): Promise<ScoreboardFixture[]> {
  const matches = await listUpcomingMatches()
  const tagged = matches.some((match) => match.teamSlug)
  return SCOREBOARD_ROWS.map((row) => ({
    teamSlug: row.teamSlug,
    teamLabel: row.teamLabel,
    match: tagged
      ? pickNextMatchForTeam(matches, row.teamSlug)
      : row.teamSlug === clubTeams.first.slug
        ? pickNextMatch(matches)
        : null,
  }))
}

/** Next fixture of the 1. Mannschaft. */
export async function getNextMatch(): Promise<MatchDto | null> {
  const fixtures = await getScoreboardFixtures()
  return fixtures.find((row) => row.teamSlug === clubTeams.first.slug)?.match ?? null
}

async function loadUpcomingMatches(): Promise<MatchDto[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'matches',
      where: { status: { in: ['scheduled', 'live'] } },
      sort: 'kickoff',
      limit: 60,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs.map(mapMatchDoc)
  } catch (err) {
    log.warn('loadUpcomingMatches failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

function mapMatchDoc(doc: {
  id: number | string
  team?: number | { slug?: string | null } | null
  externalId?: string | null
  kickoff: string
  homeName: string
  awayName: string
  competition?: string | null
  venue?: string | null
  homeScore?: number | null
  awayScore?: number | null
  status?: string | null
  sourceUrl?: string | null
}): MatchDto {
  const teamSlug =
    doc.team && typeof doc.team === 'object' && typeof doc.team.slug === 'string'
      ? doc.team.slug
      : undefined
  return {
    externalId: doc.externalId || String(doc.id),
    kickoff: new Date(doc.kickoff),
    homeName: sanitizeMatchLabel(doc.homeName),
    awayName: sanitizeMatchLabel(doc.awayName),
    competition: doc.competition ? sanitizeMatchLabel(doc.competition) : undefined,
    venue: doc.venue ? sanitizeMatchLabel(doc.venue) : undefined,
    homeScore: doc.homeScore ?? null,
    awayScore: doc.awayScore ?? null,
    status: (doc.status as MatchDto['status']) || 'scheduled',
    sourceUrl: doc.sourceUrl || undefined,
    teamSlug,
  }
}

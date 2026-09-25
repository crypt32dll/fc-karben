import type { Payload } from 'payload'
import { unstable_cache } from 'next/cache'

import { revalidateCatalogPaths, revalidateCatalogTags } from '../cache/revalidate'
import { CACHE_TAGS, CATALOG_REVALIDATE } from '../cache/tags'
import { createLogger } from '../logger'
import { getPayloadClient } from '../payload'
import { fussballDeMatchFeedSource } from './fussball-de'
import { FIRST_TEAM_FUSSBALL_DE_ID, type MatchDto, pickNextMatch } from './dto'
import { extractFussballDeTeamId } from './parse-html'

const log = createLogger('MatchFeed')

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
      (doc.slug === '1-mannschaft' ? FIRST_TEAM_FUSSBALL_DE_ID : null)
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
        homeName: match.homeName,
        awayName: match.awayName,
        competition: match.competition || null,
        venue: match.venue || null,
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

/** Upcoming fixtures from CMS (tag-cached). */
export async function listUpcomingMatches(): Promise<MatchDto[]> {
  return unstable_cache(() => loadUpcomingMatches(), ['upcoming-matches'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.matches],
  })()
}

/** Scoreboard: CMS list + wall-clock pick (no live fussball.de on pageview). */
export async function getNextMatch(): Promise<MatchDto | null> {
  const matches = await listUpcomingMatches()
  return pickNextMatch(matches)
}

async function loadUpcomingMatches(): Promise<MatchDto[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'matches',
      where: { status: { in: ['scheduled', 'live'] } },
      sort: 'kickoff',
      limit: 20,
      depth: 0,
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
  return {
    externalId: doc.externalId || String(doc.id),
    kickoff: new Date(doc.kickoff),
    homeName: doc.homeName,
    awayName: doc.awayName,
    competition: doc.competition || undefined,
    venue: doc.venue || undefined,
    homeScore: doc.homeScore ?? null,
    awayScore: doc.awayScore ?? null,
    status: (doc.status as MatchDto['status']) || 'scheduled',
    sourceUrl: doc.sourceUrl || undefined,
  }
}

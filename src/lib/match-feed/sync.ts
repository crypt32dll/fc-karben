import type { Payload } from 'payload'

import { revalidateCatalogPaths, revalidateCatalogTags } from '../cache/revalidate'
import { CACHE_TAGS } from '../cache/tags'
import { createLogger } from '../logger'
import { getPayloadClient } from '../payload'
import { fussballDeMatchFeedSource } from './fussball-de'
import {
  FIRST_TEAM_FUSSBALL_DE_ID,
  type MatchDto,
  mergeMatches,
  pickNextMatch,
} from './index'
import { extractFussballDeTeamId } from './parse-html'

const log = createLogger('MatchFeed')

export type SyncMatchFeedResult = {
  teamId: string
  fetched: number
  created: number
  updated: number
  skippedOverride: number
  nextExternalId: string | null
}

type SyncTeam = {
  id: number
  fussballDeId: string
}

/** Resolve the 1. Mannschaft (or any team with syncMatches) for MatchFeed. */
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

/** Upsert live fixtures into Payload; respect manualOverride; revalidate homepage. */
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
    let skippedOverride = 0

    for (const match of fetched) {
      const existing = await client.find({
        collection: 'matches',
        where: { externalId: { equals: match.externalId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const doc = existing.docs[0]
      if (doc?.manualOverride) {
        skippedOverride += 1
        continue
      }

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
        manualOverride: false,
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
      skippedOverride,
      nextExternalId: next?.externalId ?? null,
    })
    log.info('synced team matches', results[results.length - 1])
  }

  revalidateCatalogTags(CACHE_TAGS.matches)
  revalidateCatalogPaths('/')

  return results
}

/**
 * Next fixture for the scoreboard: live fussball.de + CMS overrides, DB fallback.
 */
export async function resolveNextMatch(): Promise<MatchDto | null> {
  const payload = await getPayloadClient()
  const teams = await findSyncTeams(payload)
  const team = teams[0]
  const teamFussballId = team?.fussballDeId ?? FIRST_TEAM_FUSSBALL_DE_ID

  let synced: MatchDto[] = []
  try {
    synced = await fussballDeMatchFeedSource.fetchUpcoming(teamFussballId)
  } catch (err) {
    log.warn('live feed failed, falling back to CMS', {
      error: err instanceof Error ? err.message : String(err),
    })
    synced = await loadMatchesFromCms(payload)
  }

  const overrides = await loadOverrideMatches(payload)
  return pickNextMatch(mergeMatches(synced, overrides))
}

async function loadMatchesFromCms(payload: Payload): Promise<MatchDto[]> {
  const result = await payload.find({
    collection: 'matches',
    where: { status: { in: ['scheduled', 'live'] } },
    sort: 'kickoff',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs.map(mapMatchDoc)
}

async function loadOverrideMatches(payload: Payload): Promise<MatchDto[]> {
  const result = await payload.find({
    collection: 'matches',
    where: {
      and: [
        { manualOverride: { equals: true } },
        { status: { in: ['scheduled', 'live'] } },
      ],
    },
    sort: 'kickoff',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs.map(mapMatchDoc)
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

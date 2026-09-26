/**
 * Manual MatchFeed sync: fussball.de → Matches (same as /api/cron/sync-matches).
 * Usage: pnpm sync:matches
 */
import { pickNextMatch, syncMatchFeed } from '../src/lib/match-feed'
import { getPayloadClient } from '../src/lib/payload'

async function main() {
  const payload = await getPayloadClient()

  const before = await payload.find({
    collection: 'matches',
    limit: 0,
    overrideAccess: true,
  })
  console.log('matches before', before.totalDocs)

  const results = await syncMatchFeed(payload)
  console.log('sync results', JSON.stringify(results, null, 2))

  const upcoming = await payload.find({
    collection: 'matches',
    where: { status: { in: ['scheduled', 'live'] } },
    sort: 'kickoff',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  const next = pickNextMatch(
    upcoming.docs.map((doc) => ({
      externalId: doc.externalId || String(doc.id),
      kickoff: new Date(doc.kickoff),
      homeName: doc.homeName,
      awayName: doc.awayName,
      competition: doc.competition || undefined,
      venue: doc.venue || undefined,
      homeScore: doc.homeScore ?? null,
      awayScore: doc.awayScore ?? null,
      status: (doc.status as 'scheduled' | 'live' | 'finished' | 'cancelled') || 'scheduled',
      sourceUrl: doc.sourceUrl || undefined,
    })),
  )
  console.log(
    'next match',
    next
      ? {
          home: next.homeName,
          away: next.awayName,
          kickoff: next.kickoff.toISOString(),
          competition: next.competition,
        }
      : null,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

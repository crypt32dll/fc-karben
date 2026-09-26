import { clubTeams } from '../src/lib/club-paths'
import { syncMatchFeed } from '../src/lib/match-feed'
import { getPayloadClient } from '../src/lib/payload'

const payload = await getPayloadClient()

const found = await payload.find({
  collection: 'teams',
  where: { slug: { equals: clubTeams.second.slug } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})
const team = found.docs[0]
if (!team) {
  console.error('2. Mannschaft missing')
  process.exit(1)
}

await payload.update({
  collection: 'teams',
  id: team.id,
  data: { syncMatches: true, _status: 'published' },
  draft: false,
  overrideAccess: true,
  context: { disableRevalidate: true },
})
console.log('enabled syncMatches', { id: team.id, slug: team.slug })

const results = await syncMatchFeed(payload)
console.log(
  JSON.stringify(
    results.map((row) => ({
      teamId: row.teamId,
      fetched: row.fetched,
      created: row.created,
      updated: row.updated,
      nextExternalId: row.nextExternalId,
    })),
    null,
    2,
  ),
)

process.exit(0)

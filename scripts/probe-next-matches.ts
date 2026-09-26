import { getPayloadClient } from '../src/lib/payload'

const payload = await getPayloadClient()

const teams = await payload.find({
  collection: 'teams',
  limit: 20,
  depth: 0,
  overrideAccess: true,
})

console.log(
  'teams',
  JSON.stringify(
    teams.docs.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      syncMatches: t.syncMatches,
      fussballDeId: t.fussballDeId,
      status: '_status' in t ? t._status : undefined,
    })),
    null,
    2,
  ),
)

const matches = await payload.find({
  collection: 'matches',
  where: { status: { in: ['scheduled', 'live'] } },
  sort: 'kickoff',
  limit: 12,
  depth: 1,
  overrideAccess: true,
})

console.log(
  'upcoming',
  JSON.stringify(
    matches.docs.map((m) => ({
      home: m.homeName,
      away: m.awayName,
      kickoff: m.kickoff,
      team:
        m.team && typeof m.team === 'object'
          ? { slug: m.team.slug, name: m.team.name }
          : m.team,
    })),
    null,
    2,
  ),
)

const homepage = await payload.findGlobal({
  slug: 'homepage',
  depth: 0,
  overrideAccess: true,
})

const layout = Array.isArray(homepage.layout) ? homepage.layout : []
console.log(
  'scoreboard blocks',
  JSON.stringify(
    layout.filter((b) => b && typeof b === 'object' && 'blockType' in b && b.blockType === 'scoreboard'),
    null,
    2,
  ),
)

process.exit(0)

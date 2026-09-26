import { getScoreboardFixtures, listUpcomingMatches } from '../src/lib/match-feed'
import { getPayloadClient } from '../src/lib/payload'

async function main() {
  const payload = await getPayloadClient()
  const second = await payload.find({
    collection: 'matches',
    where: {
      and: [
        { status: { in: ['scheduled', 'live'] } },
        { 'team.slug': { equals: '2-mannschaft' } },
      ],
    },
    sort: 'kickoff',
    limit: 3,
    depth: 1,
    overrideAccess: true,
  })
  console.log(
    'cms second',
    JSON.stringify(
      second.docs.map((m) => ({
        home: m.homeName,
        away: m.awayName,
        kickoff: m.kickoff,
        team: typeof m.team === 'object' && m.team ? m.team.slug : m.team,
      })),
      null,
      2,
    ),
  )

  const upcoming = await listUpcomingMatches()
  console.log('upcoming by team', {
    first: upcoming.filter((m) => m.teamSlug === '1-mannschaft').length,
    second: upcoming.filter((m) => m.teamSlug === '2-mannschaft').length,
    untagged: upcoming.filter((m) => !m.teamSlug).length,
    sampleSecond: upcoming
      .filter((m) => m.teamSlug === '2-mannschaft')
      .slice(0, 2)
      .map((m) => ({
        home: m.homeName,
        away: m.awayName,
        kickoff: m.kickoff.toISOString(),
        teamSlug: m.teamSlug,
      })),
  })
  console.log(
    'fixtures',
    JSON.stringify(
      (await getScoreboardFixtures()).map((row) => ({
        team: row.teamLabel,
        match: row.match
          ? {
              home: row.match.homeName,
              away: row.match.awayName,
              kickoff: row.match.kickoff.toISOString(),
            }
          : null,
      })),
      null,
      2,
    ),
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

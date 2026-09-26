import { clubTeams } from '../src/lib/club-paths'
import { getPayloadClient } from '../src/lib/payload'

async function main() {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'teams',
    where: { slug: { equals: clubTeams.third.slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const team = found.docs[0]
  if (!team) {
    console.error('3. Mannschaft missing')
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
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

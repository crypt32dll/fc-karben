#!/usr/bin/env tsx
/**
 * Publish all active draft teams (homepage grid only shows published).
 *
 *   pnpm exec tsx scripts/publish-draft-teams.ts
 */
import './load-env'

import { getPayload } from 'payload'

import { createLogger } from '../src/lib/logger'

const log = createLogger('publish:draft-teams')

async function main() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const drafts = await payload.find({
    collection: 'teams',
    where: {
      and: [{ active: { equals: true } }, { _status: { equals: 'draft' } }],
    },
    limit: 50,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })

  for (const doc of drafts.docs) {
    await payload.update({
      collection: 'teams',
      id: doc.id,
      data: { _status: 'published' },
      draft: false,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    log.info('Published team', { id: doc.id, slug: doc.slug })
  }

  const published = await payload.find({
    collection: 'teams',
    where: {
      and: [{ active: { equals: true } }, { _status: { equals: 'published' } }],
    },
    sort: 'sortOrder',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  log.info('Published active teams', {
    count: published.totalDocs,
    slugs: published.docs.map((d) => d.slug),
  })
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    log.error('Failed', { error: err instanceof Error ? err.message : String(err) })
    process.exit(1)
  })

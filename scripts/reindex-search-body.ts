#!/usr/bin/env tsx
/**
 * Backfill search.body from posts/pages after enabling Volltext indexing.
 *
 *   pnpm exec tsx scripts/reindex-search-body.ts
 */
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

import { getPayload } from 'payload'

import { createLogger } from '../src/lib/logger'
import { searchablePlainText } from '../src/lib/search/searchable-text'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const log = createLogger('reindex:search-body')

async function main() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  let page = 1
  let updated = 0
  let skipped = 0
  let missing = 0

  for (;;) {
    const result = await payload.find({
      collection: 'search',
      limit: 50,
      page,
      depth: 0,
      overrideAccess: true,
    })

    for (const hit of result.docs) {
      const relationTo = hit.doc?.relationTo
      const value = hit.doc?.value
      if ((relationTo !== 'posts' && relationTo !== 'pages') || value == null) {
        skipped += 1
        continue
      }

      const id = typeof value === 'object' && value !== null && 'id' in value ? value.id : value

      let original: {
        content?: unknown
        layout?: unknown
        excerpt?: string | null
        summary?: string | null
      }
      try {
        original = await payload.findByID({
          collection: relationTo,
          id: id as string | number,
          depth: 0,
          overrideAccess: true,
        })
      } catch {
        missing += 1
        continue
      }

      const body = searchablePlainText(original)
      if (!body || body === hit.body) {
        skipped += 1
        continue
      }

      await payload.update({
        collection: 'search',
        id: hit.id,
        data: { body },
        overrideAccess: true,
      })
      updated += 1
    }

    if (!result.hasNextPage) break
    page += 1
  }

  log.info('Done', { updated, skipped, missing })
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

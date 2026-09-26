#!/usr/bin/env tsx
/**
 * Backfill Fussball.de widget IDs (+ report category slugs) on Teams from DEFAULT_TEAMS.
 *
 *   pnpm exec tsx --env-file=.env scripts/seed-team-widgets.ts
 *   pnpm exec tsx --env-file=.env scripts/seed-team-widgets.ts -- --apply
 */
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

import { getPayload } from 'payload'

import { createLogger } from '../src/lib/logger'
import { DEFAULT_TEAMS } from '../src/lib/migration/seed-teams'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const log = createLogger('seed:team-widgets')
const apply = process.argv.includes('--apply')

async function main() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  let updated = 0
  for (const seed of DEFAULT_TEAMS) {
    if (!seed.widgetSpielplanId && !seed.widgetTabelleId && !seed.reportCategorySlug) continue
    const found = await payload.find({
      collection: 'teams',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) {
      log.warn('Team missing', { slug: seed.slug })
      continue
    }
    const data = {
      widgetSpielplanId: seed.widgetSpielplanId || doc.widgetSpielplanId,
      widgetTabelleId: seed.widgetTabelleId || doc.widgetTabelleId,
      reportCategorySlug: seed.reportCategorySlug || doc.reportCategorySlug,
      _status: 'published' as const,
    }
    log.info(apply ? 'Update team widgets' : 'Would update', { slug: seed.slug, ...data })
    if (apply) {
      await payload.update({
        collection: 'teams',
        id: doc.id,
        data,
        draft: false,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    }
    updated += 1
  }

  log.info('Done', { apply, updated })
  if (!apply) log.info('Dry-run only. Pass --apply to write.')
  process.exit(0)
}

main().catch((err) => {
  log.error('Failed', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})

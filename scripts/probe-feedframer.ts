#!/usr/bin/env tsx
/**
 * Probe Feedframer Instagram feed (needs FEEDFRAMER_API_KEY).
 *
 *   pnpm exec tsx --env-file=.env scripts/probe-feedframer.ts
 */
import './load-env'

import { createLogger } from '../src/lib/logger'
import { fetchFeedframerTiles } from '../src/lib/social-feed'

const log = createLogger('probe:feedframer')

async function main() {
  const key = process.env.FEEDFRAMER_API_KEY?.trim()
  if (!key) {
    log.warn('FEEDFRAMER_API_KEY missing — SocialFeed will use CMS tiles only')
    process.exit(1)
  }
  const tiles = await fetchFeedframerTiles(6)
  log.info('Feedframer tiles', {
    count: tiles.length,
    sample: tiles.slice(0, 3).map((t) => ({
      id: t.id,
      caption: t.caption?.slice(0, 60),
      url: t.url,
      hasImage: Boolean(t.imageUrl),
    })),
  })
  if (!tiles.length) process.exit(2)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    log.error('Failed', { error: err instanceof Error ? err.message : String(err) })
    process.exit(1)
  })

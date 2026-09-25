#!/usr/bin/env tsx
/**
 * WXR migration entrypoint (dry-run by default).
 * Usage:
 *   pnpm migrate:wxr -- --file content/wxr/export.xml
 *   pnpm migrate:wxr -- --file content/wxr/export.xml --apply
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createLogger } from '../src/lib/logger'
import {
  buildRedirectsFromPosts,
  orphanAttachmentReport,
  parseWxr,
  publishedPages,
  publishedPosts,
  referencedAttachmentUrls,
} from '../src/lib/migration/wxr'

const log = createLogger('migrate:wxr')

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

const file = arg('--file') || 'content/wxr/export.xml'
const apply = process.argv.includes('--apply')

async function main() {
  const xml = readFileSync(file, 'utf8')
  const parsed = parseWxr(xml)
  const posts = publishedPosts(parsed.items)
  const pages = publishedPages(parsed.items)
  const orphans = orphanAttachmentReport(parsed.items)
  const referenced = referencedAttachmentUrls(parsed.items)
  const redirects = buildRedirectsFromPosts(parsed.items)

  const report = {
    file,
    apply,
    categories: parsed.categories.length,
    posts: posts.length,
    pages: pages.length,
    media: {
      referenced: referenced.size,
      orphans: orphans.orphans,
    },
    redirects: redirects.length,
  }

  mkdirSync('content/wxr', { recursive: true })
  writeFileSync(
    path.join('content/wxr', 'last-report.json'),
    JSON.stringify({ report, orphanSample: orphans.orphanUrls.slice(0, 20) }, null, 2),
  )

  log.info('WXR dry-run report', report)

  if (!apply) {
    log.info('Dry-run only. Pass --apply to write into Payload (requires DB).')
    return
  }

  log.warn('Apply mode not fully wired yet — connect Payload Local API next.')
}

main().catch((err) => {
  log.error(err)
  process.exit(1)
})

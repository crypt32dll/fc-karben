#!/usr/bin/env tsx
/**
 * Auto-generate SEO meta.title + meta.description for pages (and optionally posts/teams).
 *
 *   pnpm migrate:seo -- --apply
 *   pnpm migrate:seo -- --apply --force          # overwrite existing meta
 *   pnpm migrate:seo -- --apply --collections pages,posts
 *   pnpm migrate:seo --                              # dry-run
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { loadEnvFile } from 'node:process'
import { pathToFileURL } from 'node:url'

import { getPayload, type Payload } from 'payload'

import { createLogger } from '../src/lib/logger'
import { generateSeoDescription, generateSeoTitle } from '../src/lib/seo/generate'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const log = createLogger('migrate:seo')

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

const apply = process.argv.includes('--apply')
const force = process.argv.includes('--force')
const collectionsArg = arg('--collections') || 'pages'
const collections = collectionsArg
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean) as Array<'pages' | 'posts' | 'teams'>

async function generateForCollection(payload: Payload, collection: 'pages' | 'posts' | 'teams') {
  let page = 1
  let updated = 0
  let skipped = 0
  let total = 0

  for (;;) {
    const result = await payload.find({
      collection,
      limit: 50,
      page,
      depth: 0,
      overrideAccess: true,
    })
    total = result.totalDocs

    for (const doc of result.docs) {
      const title =
        collection === 'teams' ? (doc as { name?: string }).name : (doc as { title?: string }).title
      const headline = title || 'FC Karben'
      const content = (doc as { content?: unknown }).content
      const excerpt = (doc as { excerpt?: string | null }).excerpt
      const summary = (doc as { summary?: string | null }).summary

      const nextTitle = generateSeoTitle({
        title: collection === 'teams' ? undefined : headline,
        name: collection === 'teams' ? headline : undefined,
      })
      const nextDescription = generateSeoDescription({
        title: collection === 'teams' ? undefined : headline,
        name: collection === 'teams' ? headline : undefined,
        excerpt,
        summary,
        content,
      })

      const meta = (doc as { meta?: { title?: string | null; description?: string | null } }).meta
      const hasTitle = Boolean(meta?.title?.trim())
      const hasDescription = Boolean(meta?.description?.trim())

      if (!force && hasTitle && hasDescription) {
        skipped += 1
        log.debug('Skip (meta present)', { collection, id: doc.id, title: headline })
        continue
      }

      const data = {
        meta: {
          ...(meta || {}),
          title: force || !hasTitle ? nextTitle : meta?.title,
          description: force || !hasDescription ? nextDescription : meta?.description,
        },
      }

      log.info(apply ? 'Update SEO' : 'Would update SEO', {
        collection,
        id: doc.id,
        title: headline,
        metaTitle: data.meta.title,
        metaDescription: String(data.meta.description).slice(0, 80),
      })

      if (apply) {
        await payload.update({
          collection,
          id: doc.id,
          data,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
      }
      updated += 1
    }

    if (page >= result.totalPages) break
    page += 1
  }

  return { collection, total, updated, skipped }
}

async function main() {
  process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'dev-secret-change-me'

  const configModule = await import(pathToFileURL(path.resolve('src/payload.config.ts')).href)
  const payload = await getPayload({ config: configModule.default })

  log.info('SEO generate start', { apply, force, collections })

  const results = []
  for (const collection of collections) {
    results.push(await generateForCollection(payload, collection))
  }

  log.info('SEO generate done', { apply, results })
  if (!apply) {
    log.info('Dry-run only. Pass --apply to write. Use --force to overwrite existing meta.')
  }
  process.exit(0)
}

main().catch((err) => {
  log.error('SEO generate failed', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})

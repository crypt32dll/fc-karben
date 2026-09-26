#!/usr/bin/env tsx
/**
 * WXR → Payload migration.
 *
 * Dry-run (default):
 *   pnpm migrate:wxr -- --file content/wxr/export.xml
 *
 * Apply into Neon/Postgres Payload:
 *   pnpm migrate:wxr -- --file content/wxr/export.xml --apply
 *   pnpm migrate:wxr -- --file content/wxr/export.xml --apply --limit 10
 *   pnpm migrate:wxr -- --file content/wxr/export.xml --apply --skip-media
 */
import './load-env.ts'

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'
import { createLogger } from '../src/lib/logger'
import { canonicalizePageSlug, prepareHtmlForLexical } from '../src/lib/migration/html-to-lexical'
import { lexicalTable, parseSimpleHtmlTable } from '../src/lib/migration/lexical-table'
import { externalMediaStub, mapWithConcurrency } from '../src/lib/migration/media-loader'
import { DEFAULT_TEAMS } from '../src/lib/migration/seed-teams'
import {
  attachments,
  buildRedirectsFromPosts,
  orphanAttachmentReport,
  parseWxr,
  publishedPages,
  publishedPosts,
  referencedAttachmentUrls,
} from '../src/lib/migration/wxr'
import { normalizePath } from '../src/lib/redirects'

const log = createLogger('migrate:wxr')

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function findByWpId(payload: Payload, collection: string, wpId: number) {
  const result = await payload.find({
    collection: collection as 'posts',
    where: { wpId: { equals: wpId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

async function upsertByWpId(
  payload: Payload,
  collection: string,
  wpId: number,
  data: Record<string, unknown>,
  file?: {
    data: Buffer
    mimetype: string
    name: string
    size: number
  },
) {
  const existing = await findByWpId(payload, collection, wpId)
  if (existing) {
    return payload.update({
      collection: collection as 'posts',
      id: existing.id,
      data,
      file,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  }
  return payload.create({
    collection: collection as 'posts',
    data: { ...data, wpId },
    file,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
}

async function htmlToLexical(
  payload: Payload,
  html: string,
  mediaUrlBySource?: Map<string, string>,
) {
  const cleaned = prepareHtmlForLexical(html, mediaUrlBySource)
  const { html: withoutTables, tables } = extractHtmlTables(cleaned)
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  try {
    const doc = convertHTMLToLexical({
      editorConfig,
      html: withoutTables,
      JSDOM,
    }) as { root?: { children?: unknown[] } }
    if (tables.length && doc.root?.children) {
      injectLexicalTables(doc.root.children, tables)
    }
    return doc
  } catch (err) {
    log.warn('HTML→Lexical failed, using plain paragraph', {
      error: err instanceof Error ? err.message : String(err),
    })
    const text = stripHtml(cleaned) || '—'
    return convertHTMLToLexical({
      editorConfig,
      html: `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`,
      JSDOM,
    })
  }
}

/** Pull WP tables out before Lexical HTML convert (default converter flattens them). */
function extractHtmlTables(html: string): { html: string; tables: string[][][] } {
  const tables: string[][][] = []
  const htmlOut = html.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    const rows = parseSimpleHtmlTable(match)
    if (!rows?.length) return match
    const index = tables.length
    tables.push(rows)
    return `<p data-fc-table-placeholder="${index}">__FC_TABLE_${index}__</p>`
  })
  return { html: htmlOut, tables }
}

function injectLexicalTables(children: unknown[], tables: string[][][]) {
  for (let i = 0; i < children.length; i++) {
    const node = children[i] as {
      type?: string
      children?: Array<{ type?: string; text?: string }>
    }
    if (node?.type !== 'paragraph' || !Array.isArray(node.children)) continue
    const text = node.children
      .filter((c) => c.type === 'text')
      .map((c) => c.text || '')
      .join('')
    const m = text.match(/^__FC_TABLE_(\d+)__$/)
    if (!m) continue
    const rows = tables[Number(m[1])]
    if (!rows) continue
    children[i] = lexicalTable(rows, true)
  }
}

const file = arg('--file') || 'content/wxr/export.xml'
const apply = process.argv.includes('--apply')
const skipMedia = process.argv.includes('--skip-media')
const limit = Number(arg('--limit') || '0') || 0

async function seedTeams(payload: Payload) {
  for (const [index, team] of DEFAULT_TEAMS.entries()) {
    const existing = await payload.find({
      collection: 'teams',
      where: { slug: { equals: team.slug } },
      limit: 1,
      overrideAccess: true,
    })
    const data = {
      name: team.name,
      slug: team.slug,
      shortLabel: team.shortLabel,
      league: team.league,
      fussballDeUrl: team.fussballDeUrl,
      fussballDeId: team.fussballDeId || undefined,
      syncMatches: Boolean(team.syncMatches),
      active: true,
      sortOrder: index + 1,
    }
    if (existing.docs[0]) {
      await payload.update({
        collection: 'teams',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    } else {
      await payload.create({
        collection: 'teams',
        data,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    }
  }
  log.info('Teams seeded', { count: DEFAULT_TEAMS.length })
}

async function upsertRedirect(payload: Payload, from: string, to: string) {
  const data = {
    from,
    to: { type: 'custom' as const, url: to },
    type: '308' as const,
  }
  const existing = await payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    await payload.update({
      collection: 'redirects',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  } else {
    await payload.create({
      collection: 'redirects',
      data,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  }
}

async function applyMigration() {
  process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'dev-secret-change-me'

  const configModule = await import(pathToFileURL(path.resolve('src/payload.config.ts')).href)
  const config = configModule.default
  const payload = await getPayload({ config })

  const xml = readFileSync(file, 'utf8')
  const parsed = parseWxr(xml)
  let posts = publishedPosts(parsed.items)
  let pages = publishedPages(parsed.items)
  if (limit > 0) {
    posts = posts.slice(0, limit)
    pages = pages.slice(0, Math.min(limit, pages.length))
  }

  const referenced = referencedAttachmentUrls(parsed.items)
  const mediaItems = attachments(parsed.items).filter(
    (a) => a.attachmentUrl && referenced.has(a.attachmentUrl),
  )

  log.info('Starting apply', {
    categories: parsed.categories.length,
    posts: posts.length,
    pages: pages.length,
    media: skipMedia ? 0 : mediaItems.length,
  })

  // 1) Categories
  const categoryIdBySlug = new Map<string, number | string>()
  for (const cat of parsed.categories) {
    const data = {
      title: cat.name,
      slug: cat.slug,
      description: cat.description || undefined,
      wpId: cat.id,
    }
    const doc = await upsertByWpId(payload, 'categories', cat.id, data)
    categoryIdBySlug.set(cat.slug, doc.id)
    categoryIdBySlug.set(cat.name, doc.id)
  }
  for (const cat of parsed.categories) {
    if (!cat.parentSlug) continue
    const parentId = categoryIdBySlug.get(cat.parentSlug)
    const self = await findByWpId(payload, 'categories', cat.id)
    if (parentId && self) {
      await payload.update({
        collection: 'categories',
        id: self.id,
        data: { parent: parentId },
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    }
  }
  log.info('Categories done', { count: parsed.categories.length })

  // 2) Media (referenced only)
  const mediaIdByWpId = new Map<number, number | string>()
  const mediaUrlBySource = new Map<string, string>()
  if (!skipMedia) {
    const toImport = limit > 0 ? mediaItems.slice(0, limit * 3) : mediaItems
    let imported = 0
    await mapWithConcurrency(toImport, 4, async (att, i) => {
      if (!att.attachmentUrl) return
      const existing = await findByWpId(payload, 'media', att.id)
      if (existing) {
        mediaIdByWpId.set(att.id, existing.id)
        const url =
          typeof existing.url === 'string'
            ? existing.url
            : `/api/media/file/${(existing as { filename?: string }).filename || ''}`
        mediaUrlBySource.set(att.attachmentUrl, url)
        return
      }
      // Register public WP URL only — binaries stay on the club webspace (no Blob copy).
      const stub = externalMediaStub(att.attachmentUrl)
      try {
        const doc = await payload.create({
          collection: 'media',
          data: {
            alt: att.title || att.slug || 'media',
            wpId: att.id,
            wpSourceUrl: att.attachmentUrl,
          },
          file: stub,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        mediaIdByWpId.set(att.id, doc.id)
        const url = typeof doc.url === 'string' && doc.url.length > 0 ? doc.url : att.attachmentUrl
        mediaUrlBySource.set(att.attachmentUrl, url)
        imported += 1
      } catch (err) {
        log.warn('Media create failed', {
          wpId: att.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
      if ((i + 1) % 25 === 0) {
        log.info('Media progress', { i: i + 1, total: toImport.length })
      }
    })
    log.info('Media done', { imported: mediaIdByWpId.size, newlyCreated: imported })
  }

  // 3) Pages
  for (const page of pages) {
    if (!page.slug || page.slug === 'home' || page.slug === 'contact') continue
    const { slug, pathHint } = canonicalizePageSlug(page.slug)
    let pathname = pathHint || `/${slug}`
    try {
      if (!pathHint) {
        pathname = normalizePath(new URL(page.link).pathname)
        if (page.slug === 'g-jugend') pathname = '/alte-herren'
      }
    } catch {
      // keep slug path
    }
    try {
      const content = await htmlToLexical(payload, page.content, mediaUrlBySource)
      await upsertByWpId(payload, 'pages', page.id, {
        title: page.title || slug,
        slug,
        path: pathname,
        content,
        meta: {
          title: page.seo.metaTitle,
          description: page.seo.metaDescription,
        },
        _status: 'published',
      })
    } catch (err) {
      log.warn('Page import failed', {
        slug,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  log.info('Pages done', { count: pages.length })

  // 4) Posts
  for (const post of posts) {
    if (!post.slug) continue
    try {
      const content = await htmlToLexical(payload, post.content, mediaUrlBySource)
      const categoryIds = post.categories
        .map((c) => categoryIdBySlug.get(c))
        .filter(Boolean) as Array<number | string>

      let featuredImage: number | string | undefined
      const childMedia = attachments(parsed.items).find(
        (a) => a.parentId === post.id && a.attachmentUrl && mediaIdByWpId.has(a.id),
      )
      if (childMedia) featuredImage = mediaIdByWpId.get(childMedia.id)
      if (!featuredImage && post.thumbnailId && mediaIdByWpId.has(post.thumbnailId)) {
        featuredImage = mediaIdByWpId.get(post.thumbnailId)
      }

      const publishedAt = post.publishedAt
        ? new Date(post.publishedAt.replace(' ', 'T') + '+02:00').toISOString()
        : undefined

      await upsertByWpId(payload, 'posts', post.id, {
        title: post.title || post.slug,
        slug: post.slug,
        excerpt: stripHtml(post.excerpt).slice(0, 500) || undefined,
        content,
        categories: categoryIds,
        featuredImage,
        publishedAt,
        meta: {
          title: post.seo.metaTitle,
          description:
            post.seo.metaDescription || stripHtml(post.excerpt).slice(0, 160) || undefined,
        },
        _status: 'published',
      })
    } catch (err) {
      log.warn('Post import failed', {
        slug: post.slug,
        error: err instanceof Error ? err.message : String(err),
        details:
          err && typeof err === 'object' && 'data' in err
            ? (err as { data?: unknown }).data
            : undefined,
      })
    }
  }
  log.info('Posts done', { count: posts.length })

  // 5) Redirects
  const redirects = buildRedirectsFromPosts(publishedPosts(parsed.items))
  for (const redir of redirects) {
    await upsertRedirect(payload, redir.from, redir.to)
  }
  await upsertRedirect(payload, '/g-jugend', '/alte-herren')
  log.info('Redirects done', { count: redirects.length + 1 })

  // 6) Teams
  await seedTeams(payload)

  log.info('Migration apply complete')
}

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
    limit: limit || null,
    skipMedia,
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

  log.info('WXR report', report)

  if (!apply) {
    log.info('Dry-run only. Pass --apply to write into Payload.')
    process.exit(0)
  }

  await applyMigration()
  process.exit(0)
}

main().catch((err) => {
  log.error(err)
  process.exit(1)
})

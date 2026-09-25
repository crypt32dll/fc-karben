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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'

import { DEFAULT_TEAMS } from '../src/lib/content-catalog'
import { createLogger } from '../src/lib/logger'
import {
  attachments,
  buildRedirectsFromPosts,
  orphanAttachmentReport,
  parseWxr,
  publishedPages,
  publishedPosts,
  referencedAttachmentUrls,
  type WxrItem,
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

/** Lexical upload nodes need Payload media IDs — rewrite imgs to links for migration */
function prepareHtmlForLexical(html: string): string {
  return (html || '')
    .replace(/\[\/?[^\]]+\]/g, '')
    .replace(
      /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/gi,
      (_m, _pre, src: string) => `<p><a href="${src}">${src.split('/').pop() || src}</a></p>`,
    )
    .replace(/<\/?figure[^>]*>/gi, '')
    .trim()
}

function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.doc')) return 'application/msword'
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return 'application/octet-stream'
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

function stripUploadNodes(node: unknown): unknown {
  if (!node || typeof node !== 'object') return node
  const n = node as Record<string, unknown>
  if (n.type === 'upload') {
    return {
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'text',
          text: '[Bild]',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      textFormat: 0,
    }
  }
  if (Array.isArray(n.children)) {
    return { ...n, children: n.children.map(stripUploadNodes) }
  }
  if (n.root && typeof n.root === 'object') {
    return { ...n, root: stripUploadNodes(n.root) }
  }
  return n
}

async function htmlToLexical(payload: Payload, html: string) {
  const cleaned = prepareHtmlForLexical(html) || '<p></p>'
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  try {
    const lexical = convertHTMLToLexical({
      editorConfig,
      html: cleaned,
      JSDOM,
    })
    return stripUploadNodes(lexical)
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

async function downloadFile(url: string): Promise<{
  data: Buffer
  mimetype: string
  name: string
  size: number
} | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'fc-karben-migrator/1.0' },
      signal: AbortSignal.timeout(60_000),
    })
    if (!res.ok) {
      log.warn('Media download failed', { url, status: res.status })
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const name = decodeURIComponent(url.split('/').pop() || `file-${Date.now()}`)
    return {
      data: buf,
      mimetype: res.headers.get('content-type') || mimeFromUrl(url),
      name,
      size: buf.length,
    }
  } catch (err) {
    log.warn('Media download error', {
      url,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
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
      })
    } else {
      await payload.create({
        collection: 'teams',
        data,
        overrideAccess: true,
      })
    }
  }
  log.info('Teams seeded', { count: DEFAULT_TEAMS.length })
}

async function applyMigration() {
  // Ensure env is loaded (next/payload scripts usually load .env via dotenv in payload)
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
  // parent pass
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
      })
    }
  }
  log.info('Categories done', { count: parsed.categories.length })

  // 2) Media (referenced only)
  const mediaIdByWpId = new Map<number, number | string>()
  const mediaIdByUrl = new Map<string, number | string>()
  if (!skipMedia) {
    let i = 0
    for (const att of mediaItems) {
      i += 1
      if (!att.attachmentUrl) continue
      if (limit > 0 && i > limit * 3) break
      const existing = await findByWpId(payload, 'media', att.id)
      if (existing) {
        mediaIdByWpId.set(att.id, existing.id)
        mediaIdByUrl.set(att.attachmentUrl, existing.id)
        continue
      }
      const downloaded = await downloadFile(att.attachmentUrl)
      if (!downloaded) continue
      try {
        const doc = await payload.create({
          collection: 'media',
          data: {
            alt: att.title || att.slug || 'media',
            wpId: att.id,
            wpSourceUrl: att.attachmentUrl,
          },
          file: downloaded,
          overrideAccess: true,
        })
        mediaIdByWpId.set(att.id, doc.id)
        mediaIdByUrl.set(att.attachmentUrl, doc.id)
      } catch (err) {
        log.warn('Media create failed', {
          wpId: att.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
      if (i % 25 === 0) log.info('Media progress', { i, total: mediaItems.length })
    }
    log.info('Media done', { imported: mediaIdByWpId.size })
  }

  // 3) Pages
  for (const page of pages) {
    if (!page.slug || page.slug === 'home' || page.slug === 'contact') continue
    let pathname = `/${page.slug}`
    try {
      pathname = normalizePath(new URL(page.link).pathname)
    } catch {
      // keep slug path
    }
    try {
      const content = await htmlToLexical(payload, page.content)
      await upsertByWpId(payload, 'pages', page.id, {
        title: page.title || page.slug,
        slug: page.slug,
        path: pathname,
        content,
        seo: {
          metaTitle: page.seo.metaTitle,
          metaDescription: page.seo.metaDescription,
        },
        _status: 'published',
      })
    } catch (err) {
      log.warn('Page import failed', {
        slug: page.slug,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  log.info('Pages done', { count: pages.length })

  // 4) Posts
  for (const post of posts) {
    if (!post.slug) continue
    try {
      const content = await htmlToLexical(payload, post.content)
      const categoryIds = post.categories
        .map((c) => categoryIdBySlug.get(c))
        .filter(Boolean) as Array<number | string>

      let featuredImage: number | string | undefined
      const childMedia = attachments(parsed.items).find(
        (a) => a.parentId === post.id && a.attachmentUrl && mediaIdByWpId.has(a.id),
      )
      if (childMedia) featuredImage = mediaIdByWpId.get(childMedia.id)

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
        seo: {
          metaTitle: post.seo.metaTitle,
          metaDescription:
            post.seo.metaDescription ||
            stripHtml(post.excerpt).slice(0, 160) ||
            undefined,
        },
        _status: 'published',
      })
    } catch (err) {
      log.warn('Post import failed', {
        slug: post.slug,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  log.info('Posts done', { count: posts.length })

  // 5) Redirects
  const redirects = buildRedirectsFromPosts(publishedPosts(parsed.items))
  for (const redir of redirects) {
    const existing = await payload.find({
      collection: 'redirects',
      where: { from: { equals: redir.from } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'redirects',
        id: existing.docs[0].id,
        data: { to: redir.to, permanent: true },
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'redirects',
        data: { from: redir.from, to: redir.to, permanent: true },
        overrideAccess: true,
      })
    }
  }
  log.info('Redirects done', { count: redirects.length })

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
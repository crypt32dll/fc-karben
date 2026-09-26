/**
 * Sync featuredImage from WXR `_thumbnail_id` only.
 * Posts without a WP featured image get featuredImage cleared (blue placeholder).
 *
 *   pnpm exec tsx --env-file=.env scripts/backfill-featured-images.ts
 *   pnpm exec tsx --env-file=.env scripts/backfill-featured-images.ts --apply
 */
import './load-env.ts'

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { getPayload } from 'payload'

import { externalMediaStub } from '../src/lib/migration/media-loader'
import { attachments, parseWxr, publishedPosts } from '../src/lib/migration/wxr'

const apply = process.argv.includes('--apply')
const xml = readFileSync('content/wxr/export.xml', 'utf8')
const parsed = parseWxr(xml)
const posts = publishedPosts(parsed.items)
const attById = new Map(attachments(parsed.items).map((a) => [a.id, a]))

const configModule = await import(pathToFileURL(path.resolve('src/payload.config.ts')).href)
const payload = await getPayload({ config: configModule.default })

const findMediaByWpId = async (wpId: number) => {
  const res = await payload.find({
    collection: 'media',
    where: { wpId: { equals: wpId } },
    limit: 1,
    overrideAccess: true,
  })
  return res.docs[0] ?? null
}

const ensureMedia = async (wpId: number, url: string, alt: string) => {
  const existing = await findMediaByWpId(wpId)
  if (existing) return existing.id
  const stub = externalMediaStub(url)
  const doc = await payload.create({
    collection: 'media',
    data: { alt, wpId, wpSourceUrl: url },
    file: stub,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  return doc.id
}

let set = 0
let cleared = 0
let skipped = 0

for (const post of posts) {
  if (!post.slug || !post.id) continue
  const existing = await payload.find({
    collection: 'posts',
    where: { wpId: { equals: post.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
  if (!doc) continue

  const att = post.thumbnailId ? attById.get(post.thumbnailId) : undefined
  const wantUrl = att?.attachmentUrl

  if (!wantUrl || !post.thumbnailId) {
    if (doc.featuredImage) {
      console.log('clear (no WP thumb)', doc.slug)
      cleared += 1
      if (apply) {
        await payload.update({
          collection: 'posts',
          id: doc.id,
          data: { featuredImage: null },
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
      }
    } else {
      skipped += 1
    }
    continue
  }

  const mediaId = apply
    ? await ensureMedia(post.thumbnailId, wantUrl, att?.title || post.title || 'media')
    : null

  console.log('set', doc.slug, '→', wantUrl)
  set += 1
  if (apply && mediaId != null) {
    await payload.update({
      collection: 'posts',
      id: doc.id,
      data: { featuredImage: mediaId },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  }
}

console.log(JSON.stringify({ set, cleared, skippedNoChange: skipped, apply }, null, 2))
process.exit(0)

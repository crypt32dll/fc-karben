import './load-env.ts'

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import { prepareHtmlForLexical } from '../src/lib/migration/html-to-lexical'
import {
  attachments,
  parseWxr,
  publishedPosts,
  referencedAttachmentUrls,
} from '../src/lib/migration/wxr'

const slug = process.argv[2] || 'neuzugaenge-2020'
const xml = readFileSync('content/wxr/export.xml', 'utf8')
const parsed = parseWxr(xml)
const post = publishedPosts(parsed.items).find((p) => p.slug === slug)!

const map = new Map<string, string>()
for (const att of attachments(parsed.items)) {
  if (att.attachmentUrl && referencedAttachmentUrls(parsed.items).has(att.attachmentUrl)) {
    map.set(att.attachmentUrl, att.attachmentUrl)
  }
}

const cleaned = prepareHtmlForLexical(post.content || '', map)
console.log('has img tags', /<img/i.test(cleaned))
console.log('cleaned sample', cleaned.slice(0, 600))

const configModule = await import(pathToFileURL(path.resolve('src/payload.config.ts')).href)
const payload = await getPayload({ config: configModule.default })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const doc = convertHTMLToLexical({ editorConfig, html: cleaned || '<p></p>', JSDOM })

try {
  await payload.create({
    collection: 'posts',
    data: {
      title: `DEBUG2 ${slug}`,
      slug: `debug2-${slug}-${Date.now()}`,
      content: doc as never,
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  console.log('create with media map OK')
} catch (err) {
  console.error('FAILED', err instanceof Error ? err.message : err)
  const e = err as { data?: unknown; errors?: unknown }
  console.error(JSON.stringify({ data: e.data, errors: e.errors }, null, 2).slice(0, 5000))
}
process.exit(0)

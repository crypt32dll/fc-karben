import { XMLParser } from 'fast-xml-parser'

import { createLogger } from '../logger'
import { normalizePath, wpDatedPostToPresse } from '../redirects'

const log = createLogger('MigrationPipeline')

export type WxrSeo = {
  metaTitle?: string
  metaDescription?: string
}

export type WxrItem = {
  id: number
  title: string
  link: string
  slug: string
  postType: string
  status: string
  content: string
  excerpt: string
  publishedAt?: string
  categories: string[]
  attachmentUrl?: string
  parentId?: number
  thumbnailId?: number
  meta: Record<string, string>
  seo: WxrSeo
}

export type WxrCategory = {
  id: number
  name: string
  slug: string
  parentSlug?: string
  description?: string
}

export type ParsedWxr = {
  categories: WxrCategory[]
  items: WxrItem[]
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function cdata(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && '#text' in value) {
    return String((value as { '#text': unknown })['#text'] ?? '')
  }
  if (typeof value === 'object' && value !== null && '__cdata' in value) {
    return String((value as { __cdata: unknown }).__cdata ?? '')
  }
  return String(value)
}

/** Drop AIOSEO/Yoast placeholders that aren't real copy */
export function cleanSeoValue(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'a:0:{}') return undefined
  if (/%%[\w.-]+%%/.test(trimmed)) return undefined
  if (/#(post_|site_|separator)/i.test(trimmed)) return undefined
  return trimmed
}

export function extractSeoFromMeta(meta: Record<string, string>): WxrSeo {
  const metaTitle = cleanSeoValue(meta._aioseo_title || meta._yoast_wpseo_title)
  const metaDescription = cleanSeoValue(
    meta._aioseo_description || meta._yoast_wpseo_metadesc || meta._aioseo_og_description,
  )
  return {
    ...(metaTitle ? { metaTitle } : {}),
    ...(metaDescription ? { metaDescription } : {}),
  }
}

export function parseWxr(xml: string): ParsedWxr {
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    trimValues: true,
  })
  const doc = parser.parse(xml)
  const channel = doc?.rss?.channel
  if (!channel) {
    throw new Error('Invalid WXR: missing rss.channel')
  }

  const categories: WxrCategory[] = asArray(channel['wp:category']).map((cat) => ({
    id: Number(cat['wp:term_id']),
    name: cdata(cat['wp:cat_name']?.__cdata ?? cat['wp:cat_name']),
    slug: cdata(cat['wp:category_nicename']?.__cdata ?? cat['wp:category_nicename']),
    parentSlug: cdata(cat['wp:category_parent']?.__cdata ?? cat['wp:category_parent']) || undefined,
    description: cdata(cat['wp:category_description']?.__cdata ?? cat['wp:category_description']),
  }))

  const items: WxrItem[] = asArray(channel.item).map((item) => {
    const cats = asArray(item.category)
      .map((c) => {
        if (typeof c === 'string') return c
        const nicename = c?.['@_nicename'] || c?.['@_slug']
        if (nicename) return String(nicename)
        return cdata(c?.__cdata ?? c?.['#text'] ?? c)
      })
      .filter(Boolean)

    const meta: Record<string, string> = {}
    for (const entry of asArray(item['wp:postmeta'])) {
      const key = cdata(entry?.['wp:meta_key']?.__cdata ?? entry?.['wp:meta_key'])
      const value = cdata(entry?.['wp:meta_value']?.__cdata ?? entry?.['wp:meta_value'])
      if (key) meta[key] = value
    }

    const thumbRaw = meta._thumbnail_id
    const thumbnailId = thumbRaw && /^\d+$/.test(thumbRaw) ? Number(thumbRaw) : undefined

    return {
      id: Number(item['wp:post_id']),
      title: cdata(item.title?.__cdata ?? item.title),
      link: cdata(item.link?.__cdata ?? item.link),
      slug: cdata(item['wp:post_name']?.__cdata ?? item['wp:post_name']),
      postType: cdata(item['wp:post_type']?.__cdata ?? item['wp:post_type']),
      status: cdata(item['wp:status']?.__cdata ?? item['wp:status']),
      content: cdata(item['content:encoded']?.__cdata ?? item['content:encoded']),
      excerpt: cdata(item['excerpt:encoded']?.__cdata ?? item['excerpt:encoded']),
      publishedAt: cdata(item['wp:post_date']?.__cdata ?? item['wp:post_date']) || undefined,
      categories: cats,
      attachmentUrl:
        cdata(item['wp:attachment_url']?.__cdata ?? item['wp:attachment_url']) || undefined,
      parentId: item['wp:post_parent'] ? Number(item['wp:post_parent']) : undefined,
      thumbnailId,
      meta,
      seo: extractSeoFromMeta(meta),
    }
  })

  log.info('Parsed WXR', {
    categories: categories.length,
    items: items.length,
  })

  return { categories, items }
}

export function publishedPosts(items: WxrItem[]): WxrItem[] {
  return items.filter((i) => i.postType === 'post' && i.status === 'publish')
}

export function publishedPages(items: WxrItem[]): WxrItem[] {
  return items.filter((i) => i.postType === 'page' && i.status === 'publish')
}

export function attachments(items: WxrItem[]): WxrItem[] {
  return items.filter((i) => i.postType === 'attachment' && i.attachmentUrl)
}

/** Collect attachment IDs / URLs referenced in published content HTML or featured parents */
export function referencedAttachmentUrls(items: WxrItem[]): Set<string> {
  const published = [...publishedPosts(items), ...publishedPages(items)]
  const html = published.map((p) => p.content).join('\n')
  const urls = new Set<string>()

  for (const att of attachments(items)) {
    if (!att.attachmentUrl) continue
    const fileName = att.attachmentUrl.split('/').pop()
    if (fileName && html.includes(fileName)) {
      urls.add(att.attachmentUrl)
      continue
    }
    // parented to a published post/page
    if (att.parentId && published.some((p) => p.id === att.parentId)) {
      urls.add(att.attachmentUrl)
    }
  }

  log.info('Referenced attachments', { count: urls.size })
  return urls
}

export function orphanAttachmentReport(items: WxrItem[]): {
  total: number
  referenced: number
  orphans: number
  orphanUrls: string[]
} {
  const all = attachments(items)
  const referenced = referencedAttachmentUrls(items)
  const orphanUrls = all.map((a) => a.attachmentUrl!).filter((url) => !referenced.has(url))
  return {
    total: all.length,
    referenced: referenced.size,
    orphans: orphanUrls.length,
    orphanUrls,
  }
}

export function buildRedirectsFromPosts(items: WxrItem[]): Array<{ from: string; to: string }> {
  return publishedPosts(items)
    .map((post) => {
      try {
        const pathname = normalizePath(new URL(post.link).pathname)
        const to = wpDatedPostToPresse(pathname) ?? `/presse/${post.slug}`
        return { from: pathname, to }
      } catch {
        return null
      }
    })
    .filter((r): r is { from: string; to: string } => Boolean(r))
}

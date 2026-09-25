import { postPath, teamPath } from '../club-paths'
import { createLogger } from '../logger'
import { payloadMetaSchema } from './schemas'
import type { CatalogPost, CatalogSeo, CatalogTeam } from './types'

const log = createLogger('ContentCatalog')

export { postPath, teamPath }

/** Map Payload SEO plugin `meta` group (or legacy `seo` group) to CatalogSeo. */
export function mapSeo(meta: unknown): CatalogSeo | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const parsed = payloadMetaSchema.safeParse(meta)
  if (!parsed.success) {
    log.warn('Invalid SEO meta dropped', {
      issues: parsed.error.issues.map((i) => i.message),
    })
    return undefined
  }
  return parsed.data
}

/** Resolve Payload upload relation → URL + alt for ClubSite images. */
export function mapFeaturedImage(media: unknown): {
  featuredImageUrl: string | null
  featuredImageAlt: string | null
} {
  if (!media || typeof media !== 'object') {
    return { featuredImageUrl: null, featuredImageAlt: null }
  }
  const m = media as { url?: string | null; alt?: string | null }
  return {
    featuredImageUrl: typeof m.url === 'string' && m.url.length > 0 ? m.url : null,
    featuredImageAlt: typeof m.alt === 'string' ? m.alt : null,
  }
}

export function mapPostsForList(
  docs: Array<{
    id: string | number
    title: string
    slug: string
    excerpt?: string | null
    publishedAt?: string | null
  }>,
): CatalogPost[] {
  log.debug('mapPostsForList', { count: docs.length })
  return docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    publishedAt: doc.publishedAt,
    path: postPath(doc.slug),
  }))
}

export function mapTeamsForGrid(
  docs: Array<{
    id: string | number
    name: string
    slug: string
    shortLabel?: string | null
    league?: string | null
    summary?: string | null
    fussballDeUrl?: string | null
    syncMatches?: boolean | null
    active?: boolean | null
  }>,
): CatalogTeam[] {
  return docs
    .filter((d) => d.active !== false)
    .map((doc) => ({
      id: String(doc.id),
      name: doc.name,
      slug: doc.slug,
      shortLabel: doc.shortLabel,
      league: doc.league,
      summary: doc.summary,
      fussballDeUrl: doc.fussballDeUrl,
      syncMatches: doc.syncMatches,
      path: teamPath(doc.slug),
    }))
}

export function mapCategories(categories: unknown): Array<{ title: string; slug: string }> {
  if (!Array.isArray(categories)) return []
  return categories
    .filter((c): c is { title: string; slug: string } => typeof c === 'object' && c !== null)
    .map((c) => ({ title: c.title, slug: c.slug }))
}

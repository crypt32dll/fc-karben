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
  const m = media as { url?: string | null; alt?: string | null; wpSourceUrl?: string | null }
  const url =
    (typeof m.url === 'string' && m.url.length > 0 && m.url) ||
    (typeof m.wpSourceUrl === 'string' && m.wpSourceUrl.length > 0 && m.wpSourceUrl) ||
    null
  return {
    featuredImageUrl: url,
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
    fussballDeId?: string | null
    widgetSpielplanId?: string | null
    widgetTabelleId?: string | null
    reportCategorySlug?: string | null
    syncMatches?: boolean | null
    trainingTimes?: string | null
    photo?: unknown
    contacts?: Array<{
      role?: string | null
      name?: string | null
      phone?: string | null
      email?: string | null
    }> | null
    active?: boolean | null
  }>,
): CatalogTeam[] {
  return docs
    .filter((d) => d.active !== false)
    .map((doc) => {
      const photo = mapFeaturedImage(doc.photo)
      return {
        id: String(doc.id),
        name: doc.name,
        slug: doc.slug,
        shortLabel: doc.shortLabel,
        league: doc.league,
        summary: doc.summary,
        fussballDeUrl: doc.fussballDeUrl,
        fussballDeId: doc.fussballDeId,
        widgetSpielplanId: doc.widgetSpielplanId,
        widgetTabelleId: doc.widgetTabelleId,
        reportCategorySlug: doc.reportCategorySlug,
        syncMatches: doc.syncMatches,
        trainingTimes: doc.trainingTimes,
        photoUrl: photo.featuredImageUrl,
        photoAlt: photo.featuredImageAlt,
        contacts: (doc.contacts || [])
          .filter(
            (
              c,
            ): c is { role: string; name: string; phone?: string | null; email?: string | null } =>
              Boolean(c?.role && c?.name),
          )
          .map((c) => ({
            role: c.role,
            name: c.name,
            phone: c.phone,
            email: c.email,
          })),
        path: teamPath(doc.slug),
      }
    })
}

export function mapCategories(categories: unknown): Array<{ title: string; slug: string }> {
  if (!Array.isArray(categories)) return []
  return categories
    .filter((c): c is { title: string; slug: string } => typeof c === 'object' && c !== null)
    .map((c) => ({ title: c.title, slug: c.slug }))
}

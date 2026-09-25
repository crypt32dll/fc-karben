import { createLogger } from '../logger'
import type { CatalogPost, CatalogSeo, CatalogTeam } from './types'

const log = createLogger('ContentCatalog')

export function postPath(slug: string): string {
  return `/presse/${slug}`
}

export function teamPath(slug: string): string {
  return `/${slug}`
}

export function mapSeo(seo: Record<string, unknown> | null | undefined): CatalogSeo | undefined {
  if (!seo) return undefined
  const og = seo.ogImage as { url?: string } | number | string | null | undefined
  const ogImageUrl = typeof og === 'object' && og && 'url' in og ? og.url : undefined
  return {
    metaTitle: (seo.metaTitle as string) || null,
    metaDescription: (seo.metaDescription as string) || null,
    noIndex: Boolean(seo.noIndex),
    noFollow: Boolean(seo.noFollow),
    canonicalOverride: (seo.canonicalOverride as string) || null,
    ogImageUrl: ogImageUrl || null,
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

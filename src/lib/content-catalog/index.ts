import type { Metadata } from 'next'

import { createLogger } from '../logger'
import { getPayloadClient } from '../payload'
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildTitle,
  robotsFromFlags,
  type SeoInput,
} from '../seo'

const log = createLogger('ContentCatalog')

export type CatalogSeo = {
  metaTitle?: string | null
  metaDescription?: string | null
  noIndex?: boolean | null
  noFollow?: boolean | null
  canonicalOverride?: string | null
  ogImageUrl?: string | null
}

export type CatalogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  path: string
  content?: unknown
  categories?: Array<{ title: string; slug: string }>
  seo?: CatalogSeo
}

export type CatalogPage = {
  id: string
  title: string
  slug: string
  path: string
  content?: unknown
  layout?: unknown[] | null
  seo?: CatalogSeo
  updatedAt?: string | null
}

export type CatalogTeam = {
  id: string
  name: string
  slug: string
  shortLabel?: string | null
  league?: string | null
  summary?: string | null
  fussballDeUrl?: string | null
  syncMatches?: boolean | null
  path: string
  content?: unknown
}

export type CatalogNotice = {
  id: string
  title: string
  publishedAt?: string | null
  path: string
}

/** Pure helpers used by ContentCatalog — easy to unit test without Payload */

export function postPath(slug: string): string {
  return `/presse/${slug}`
}

export function teamPath(slug: string): string {
  return `/${slug}`
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

function mapSeo(seo: Record<string, unknown> | null | undefined): CatalogSeo | undefined {
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

export function catalogSeoToMetadata(
  input: {
    title: string
    path: string
    excerpt?: string | null
    publishedAt?: string | null
    updatedAt?: string | null
    seo?: CatalogSeo
    type?: 'website' | 'article'
  },
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fc-karben.de',
): Metadata {
  const seoInput: SeoInput = {
    title: input.seo?.metaTitle || input.title,
    description: input.seo?.metaDescription || input.excerpt || undefined,
    path: input.path,
    noIndex: input.seo?.noIndex || undefined,
    noFollow: input.seo?.noFollow || undefined,
    canonicalOverride: input.seo?.canonicalOverride,
    ogImageUrl: input.seo?.ogImageUrl,
    publishedAt: input.publishedAt,
    modifiedAt: input.updatedAt,
    type: input.type || 'website',
  }

  const robots = robotsFromFlags(seoInput.noIndex, seoInput.noFollow)
  const canonical = seoInput.canonicalOverride?.startsWith('http')
    ? seoInput.canonicalOverride
    : absoluteUrl(seoInput.canonicalOverride || input.path, { metadataBase: siteUrl })

  const meta: Metadata = {
    title: buildTitle(seoInput.title || input.title),
    description: seoInput.description || undefined,
    alternates: { canonical },
    robots,
    openGraph: {
      title: seoInput.title || input.title || undefined,
      description: seoInput.description || undefined,
      url: canonical,
      type: input.type === 'article' ? 'article' : 'website',
      images: seoInput.ogImageUrl ? [{ url: seoInput.ogImageUrl }] : undefined,
    },
  }

  if (input.type === 'article') {
    meta.other = {
      'script:ld+json': JSON.stringify(
        buildArticleJsonLd({
          headline: input.title,
          url: canonical,
          datePublished: input.publishedAt,
          dateModified: input.updatedAt,
          image: seoInput.ogImageUrl,
          publisherName: 'FC Karben',
        }),
      ),
    }
  }

  return meta
}

export async function listBeitrage(options?: {
  limit?: number
  page?: number
}): Promise<{ posts: CatalogPost[]; totalDocs: number; totalPages: number }> {
  const payload = await getPayloadClient()
  const limit = options?.limit ?? 24
  const page = options?.page ?? 1
  const result = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    page,
    depth: 1,
    overrideAccess: true,
  })

  const posts: CatalogPost[] = result.docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    publishedAt: doc.publishedAt,
    updatedAt: doc.updatedAt,
    path: postPath(doc.slug),
    seo: mapSeo(doc.seo as Record<string, unknown>),
    categories: Array.isArray(doc.categories)
      ? doc.categories
          .filter((c): c is { title: string; slug: string } => typeof c === 'object' && c !== null)
          .map((c) => ({ title: c.title, slug: c.slug }))
      : [],
  }))

  return { posts, totalDocs: result.totalDocs, totalPages: result.totalPages }
}

export async function getBeitragBySlug(slug: string): Promise<CatalogPost | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  if (!doc) return null

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    publishedAt: doc.publishedAt,
    updatedAt: doc.updatedAt,
    path: postPath(doc.slug),
    content: doc.content,
    seo: mapSeo(doc.seo as Record<string, unknown>),
    categories: Array.isArray(doc.categories)
      ? doc.categories
          .filter((c): c is { title: string; slug: string } => typeof c === 'object' && c !== null)
          .map((c) => ({ title: c.title, slug: c.slug }))
      : [],
  }
}

export async function getSeiteBySlug(slug: string): Promise<CatalogPage | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  if (!doc) return null

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    path: doc.path || `/${doc.slug}`,
    content: doc.content,
    layout: doc.layout as unknown[] | null,
    seo: mapSeo(doc.seo as Record<string, unknown>),
    updatedAt: doc.updatedAt,
  }
}

export async function getSeiteByPath(pathname: string): Promise<CatalogPage | null> {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [{ path: { equals: path } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  if (!doc) {
    const slug = path.split('/').filter(Boolean).pop()
    return slug ? getSeiteBySlug(slug) : null
  }

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    path: doc.path || path,
    content: doc.content,
    layout: doc.layout as unknown[] | null,
    seo: mapSeo(doc.seo as Record<string, unknown>),
    updatedAt: doc.updatedAt,
  }
}

export async function listMannschaften(): Promise<CatalogTeam[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'teams',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })
    if (result.docs.length) {
      return mapTeamsForGrid(result.docs)
    }
  } catch (err) {
    log.warn('listMannschaften fallback to DEFAULT_TEAMS', {
      error: err instanceof Error ? err.message : String(err),
    })
  }
  return DEFAULT_TEAMS
}

export async function getMannschaftBySlug(slug: string): Promise<CatalogTeam | null> {
  const teams = await listMannschaften()
  const fromList = teams.find((t) => t.slug === slug)
  if (!fromList) return null

  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'teams',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = result.docs[0]
    if (doc) {
      return {
        ...fromList,
        content: doc.content,
        summary: doc.summary || fromList.summary,
      }
    }
  } catch {
    // keep list data
  }
  return fromList
}

export async function resolveRedirect(fromPath: string): Promise<{ to: string; permanent: boolean } | null> {
  const from = fromPath.startsWith('/') ? fromPath : `/${fromPath}`
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = result.docs[0]
    if (!doc?.to) return null
    return { to: doc.to, permanent: doc.permanent !== false }
  } catch {
    return null
  }
}

export const DEFAULT_TEAMS: CatalogTeam[] = [
  {
    id: '1',
    name: '1. Mannschaft',
    slug: '1-mannschaft',
    shortLabel: '01',
    league: 'Gruppenliga · Günter-Reutzel-Sportfeld',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/01OT7G9AUK000000VV0AG80NVT74RFIN#!/',
    syncMatches: true,
    path: '/1-mannschaft',
  },
  {
    id: '2',
    name: '2. Mannschaft',
    slug: '2-mannschaft',
    shortLabel: '02',
    league: 'Kreisliga B',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-ii-fc-karben-hessen/-/saison/2627/team-id/01OT7GCS8S000000VV0AG80NVT74RFIN#!/',
    path: '/2-mannschaft',
  },
  {
    id: '3',
    name: '3. Mannschaft',
    slug: '3-mannschaft',
    shortLabel: '03',
    league: 'Kreisliga C',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/sg-karben-iii-fc-karben-hessen/-/saison/2627/team-id/02IDOPSOPK000000VS5489B1VUG7QVAU#!/',
    path: '/3-mannschaft',
  },
  {
    id: '4',
    name: 'E-Jugend',
    slug: 'e-jugend',
    shortLabel: '04',
    league: 'Jugendförderung',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02PSLBKJP0000000VS5489B1VVQNIHJA#!/',
    path: '/e-jugend',
  },
  {
    id: '5',
    name: 'Alte Herren',
    slug: 'alte-herren',
    shortLabel: '05',
    league: 'Ü35',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02M10U9VA4000000VS5489B1VVVHS1D7#!/',
    path: '/alte-herren',
  },
]

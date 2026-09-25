import { pathForDoc } from '../club-paths'
import { createLogger } from '../logger'
import { type MatchDto, pickNextMatch } from '../match-feed'
import { mapPageLayout } from '../page-builder'
import { getPayloadClient } from '../payload'
import { type RedirectRule, redirectRulesSchema } from '../redirects'
import type { SocialTileDto } from '../social-feed'
import { mapCatalogBody } from './body'
import { mapCategories, mapSeo, mapTeamsForGrid, postPath } from './mappers'
import type {
  CatalogHomepage,
  CatalogPage,
  CatalogPost,
  CatalogSeo,
  CatalogSiteSettings,
  CatalogSponsor,
  CatalogTeam,
} from './types'

const log = createLogger('ContentCatalog')

function docMeta(doc: { meta?: unknown; seo?: unknown }): CatalogSeo | undefined {
  return mapSeo((doc.meta || doc.seo) as Record<string, unknown> | undefined)
}

export async function findBeitrage(options?: {
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
    seo: docMeta(doc),
    categories: mapCategories(doc.categories),
  }))

  return { posts, totalDocs: result.totalDocs, totalPages: result.totalPages }
}

export async function findBeitragBySlug(slug: string): Promise<CatalogPost | null> {
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
    content: mapCatalogBody(doc.content),
    seo: docMeta(doc),
    categories: mapCategories(doc.categories),
  }
}

export async function findSeiteBySlug(slug: string): Promise<CatalogPage | null> {
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
    content: mapCatalogBody(doc.content),
    layout: mapPageLayout(doc.layout),
    seo: docMeta(doc),
    updatedAt: doc.updatedAt,
  }
}

export async function findSeiteByPath(pathname: string): Promise<CatalogPage | null> {
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
    return slug ? findSeiteBySlug(slug) : null
  }

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    path: doc.path || path,
    content: mapCatalogBody(doc.content),
    layout: mapPageLayout(doc.layout),
    seo: docMeta(doc),
    updatedAt: doc.updatedAt,
  }
}

export async function findMannschaften(): Promise<CatalogTeam[]> {
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
    return mapTeamsForGrid(result.docs)
  } catch (err) {
    log.warn('findMannschaften failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

export async function findMannschaftBySlug(slug: string): Promise<CatalogTeam | null> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'teams',
      where: {
        and: [{ slug: { equals: slug } }, { active: { equals: true } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = result.docs[0]
    if (!doc) return null
    const [mapped] = mapTeamsForGrid([doc])
    return mapped
      ? {
          ...mapped,
          content: mapCatalogBody(doc.content),
          summary: doc.summary || mapped.summary,
          seo: docMeta(doc),
        }
      : null
  } catch (err) {
    log.warn('findMannschaftBySlug failed', {
      slug,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

export async function findSponsoren(): Promise<CatalogSponsor[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'sponsors',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs.map((doc) => {
      const logo = doc.logo
      const logoUrl =
        typeof logo === 'object' && logo && 'url' in logo ? (logo.url as string) : null
      return {
        id: String(doc.id),
        name: doc.name,
        url: doc.url,
        logoUrl,
        sortOrder: doc.sortOrder ?? 0,
      }
    })
  } catch (err) {
    log.warn('findSponsoren failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

export async function findSocialTiles(): Promise<SocialTileDto[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'social-tiles',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 12,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs.map((doc) => {
      const image = doc.image
      const imageUrl =
        typeof image === 'object' && image && 'url' in image ? (image.url as string) : null
      return {
        id: String(doc.id),
        caption: doc.caption,
        url: doc.url,
        imageUrl,
        sortOrder: doc.sortOrder ?? 0,
      }
    })
  } catch (err) {
    log.warn('findSocialTiles failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

export async function findSiteSettings(): Promise<CatalogSiteSettings | null> {
  const payload = await getPayloadClient()
  try {
    const doc = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      overrideAccess: true,
    })
    const seo = mapSeo(doc.meta as Record<string, unknown> | undefined)
    return {
      clubName: doc.clubName || 'FC Karben e.V.',
      tagline: doc.tagline,
      foundingYear: doc.foundingYear,
      email: doc.email,
      address: doc.address,
      venue: doc.venue,
      social: doc.social,
      defaultSeo: {
        metaTitle: seo?.metaTitle ?? 'FC Karben e.V.',
        metaDescription:
          seo?.metaDescription ??
          'FC Karben e.V. — Fußball in Karben seit 2015. Mannschaften, News und Verein.',
        ogImageUrl: seo?.ogImageUrl ?? null,
      },
      gscVerification: doc.gscVerification,
    }
  } catch (err) {
    log.warn('findSiteSettings failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

export async function findHomepage(): Promise<CatalogHomepage | null> {
  const payload = await getPayloadClient()
  try {
    const doc = await payload.findGlobal({
      slug: 'homepage',
      depth: 1,
      overrideAccess: true,
    })
    return {
      heroEyebrow: doc.heroEyebrow,
      heroTitle: doc.heroTitle,
      heroLead: doc.heroLead,
      heroPrimaryCta: doc.heroPrimaryCta,
      heroSecondaryCta: doc.heroSecondaryCta,
      vereinIntro: doc.vereinIntro,
      layout: mapPageLayout(doc.layout),
    }
  } catch (err) {
    log.warn('findHomepage failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

function redirectDestination(doc: {
  to?:
    | {
        type?: string | null
        url?: string | null
        reference?: {
          relationTo?: string
          value?: { slug?: string; path?: string } | string | number
        }
      }
    | string
    | null
}): string | null {
  if (!doc.to) return null
  if (typeof doc.to === 'string') return doc.to
  if (doc.to.type === 'custom' && doc.to.url) return doc.to.url
  const ref = doc.to.reference
  if (doc.to.type === 'reference' && ref && typeof ref === 'object') {
    const value = ref.value
    if (value && typeof value === 'object') {
      return pathForDoc({
        relationTo: ref.relationTo,
        slug: 'slug' in value ? value.slug : undefined,
        path: 'path' in value ? value.path : undefined,
      })
    }
  }
  return null
}

export async function findRedirectRules(): Promise<RedirectRule[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'redirects',
      limit: 1000,
      depth: 1,
      overrideAccess: true,
      pagination: false,
    })
    const rules = result.docs.flatMap((doc) => {
      const to = redirectDestination(doc as never)
      if (!to || !doc.from) return []
      const type = (doc as { type?: string }).type
      const permanent = type !== '302' && type !== '307'
      return [{ from: doc.from, to, permanent }]
    })
    const parsed = redirectRulesSchema.safeParse(rules)
    if (!parsed.success) {
      log.warn('redirect rules failed Zod', {
        issues: parsed.error.issues.map((i) => i.message),
      })
      return []
    }
    return parsed.data
  } catch (err) {
    log.warn('findRedirectRules failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

export async function findUpcomingMatches(): Promise<MatchDto[]> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.find({
      collection: 'matches',
      where: {
        status: { in: ['scheduled', 'live'] },
      },
      sort: 'kickoff',
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs.map((doc) => ({
      externalId: doc.externalId || String(doc.id),
      kickoff: new Date(doc.kickoff),
      homeName: doc.homeName,
      awayName: doc.awayName,
      competition: doc.competition || undefined,
      venue: doc.venue || undefined,
      homeScore: doc.homeScore ?? null,
      awayScore: doc.awayScore ?? null,
      status: (doc.status as MatchDto['status']) || 'scheduled',
      sourceUrl: doc.sourceUrl || undefined,
    }))
  } catch (err) {
    log.warn('findUpcomingMatches failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

export async function findNextMatch(): Promise<MatchDto | null> {
  const matches = await findUpcomingMatches()
  return pickNextMatch(matches)
}

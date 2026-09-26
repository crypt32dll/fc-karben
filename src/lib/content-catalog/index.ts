import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'

import { CACHE_TAGS, CATALOG_REVALIDATE } from '../cache/revalidate'
import { getNextMatch as getNextMatchFromFeed, type MatchDto } from '../match-feed'
import type { RedirectRule } from '../redirects'
import { resolveRedirect } from '../redirects'
import { toNextMetadata } from '../seo'
import { getPublicSiteURL } from '../seo/generate'
import type { SocialTileDto } from '../social-feed'
import {
  findBeitragBySlug,
  findBeitrage,
  findBeitrageByCategorySlug,
  findHomepage,
  findMannschaftBySlug,
  findMannschaften,
  findRedirectRules,
  findSeiteByPath,
  findSeiteBySlug,
  findSiteSettings,
  findSocialTiles,
  findSponsoren,
} from './payload-adapter'
import { decideRootSlug, type RootSlugResolution } from './resolve-root-slug'
import { findSearchHits, type SearchHit } from './search'
import type {
  CatalogHomepage,
  CatalogPage,
  CatalogPost,
  CatalogSeo,
  CatalogSiteSettings,
  CatalogSponsor,
  CatalogTeam,
} from './types'

export type { CatalogBody } from './body'
export { mapCatalogBody } from './body'
export { mapPostsForList, mapTeamsForGrid, postPath, teamPath } from './mappers'
export { decideRootSlug, type RootSlugResolution } from './resolve-root-slug'
export type { SearchHit } from './search'
export type {
  CatalogHomepage,
  CatalogNotice,
  CatalogPage,
  CatalogPost,
  CatalogSeo,
  CatalogSiteSettings,
  CatalogSponsor,
  CatalogTeam,
} from './types'

async function draftOpts() {
  const { isEnabled } = await draftMode()
  return { draft: isEnabled }
}

export function catalogSeoToMetadata(
  input: {
    title: string
    path: string
    excerpt?: string | null
    publishedAt?: string | null
    updatedAt?: string | null
    seo?: CatalogSeo
    /** Fallback when SEO plugin has no explicit OG image (e.g. post featured image). */
    featuredImageUrl?: string | null
    type?: 'website' | 'article'
  },
  siteUrl = getPublicSiteURL(),
): Metadata {
  return toNextMetadata(
    {
      title: input.seo?.metaTitle || input.title,
      description: input.seo?.metaDescription || input.excerpt || undefined,
      path: input.path,
      noIndex: input.seo?.noIndex || undefined,
      noFollow: input.seo?.noFollow || undefined,
      canonicalOverride: input.seo?.canonicalOverride,
      ogImageUrl: input.seo?.ogImageUrl || input.featuredImageUrl || undefined,
      publishedAt: input.publishedAt,
      modifiedAt: input.updatedAt,
      type: input.type || 'website',
      headline: input.title,
    },
    { metadataBase: siteUrl },
  )
}

export async function listBeitrage(options?: {
  limit?: number
  page?: number
  categorySlug?: string
}): Promise<{ posts: CatalogPost[]; totalDocs: number; totalPages: number }> {
  const limit = options?.limit ?? 24
  const page = options?.page ?? 1
  const categorySlug = options?.categorySlug?.trim()
  const { draft } = await draftOpts()
  if (categorySlug) {
    if (draft) return findBeitrageByCategorySlug(categorySlug, { limit, page, draft: true })
    return unstable_cache(
      () => findBeitrageByCategorySlug(categorySlug, { limit, page }),
      ['list-beitrage-cat', categorySlug, String(limit), String(page)],
      { revalidate: CATALOG_REVALIDATE, tags: [CACHE_TAGS.posts] },
    )()
  }
  if (draft) return findBeitrage({ limit, page, draft: true })
  return unstable_cache(
    () => findBeitrage({ limit, page }),
    ['list-beitrage', String(limit), String(page)],
    { revalidate: CATALOG_REVALIDATE, tags: [CACHE_TAGS.posts] },
  )()
}

export async function getBeitragBySlug(slug: string): Promise<CatalogPost | null> {
  const { draft } = await draftOpts()
  if (draft) return findBeitragBySlug(slug, { draft: true })
  return unstable_cache(() => findBeitragBySlug(slug), ['beitrag', slug], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.posts],
  })()
}

export async function getSeiteBySlug(slug: string): Promise<CatalogPage | null> {
  const { draft } = await draftOpts()
  if (draft) return findSeiteBySlug(slug, { draft: true })
  return unstable_cache(() => findSeiteBySlug(slug), ['seite-slug', slug], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.pages],
  })()
}

export async function getSeiteByPath(pathname: string): Promise<CatalogPage | null> {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const { draft } = await draftOpts()
  if (draft) return findSeiteByPath(path, { draft: true })
  return unstable_cache(() => findSeiteByPath(path), ['seite-path', path], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.pages],
  })()
}

export async function listMannschaften(): Promise<CatalogTeam[]> {
  const { draft } = await draftOpts()
  if (draft) return findMannschaften({ draft: true })
  return unstable_cache(() => findMannschaften(), ['list-mannschaften'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.teams],
  })()
}

export async function getMannschaftBySlug(slug: string): Promise<CatalogTeam | null> {
  const { draft } = await draftOpts()
  if (draft) return findMannschaftBySlug(slug, { draft: true })
  return unstable_cache(() => findMannschaftBySlug(slug), ['mannschaft', slug], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.teams],
  })()
}

export async function listSponsoren(): Promise<CatalogSponsor[]> {
  return unstable_cache(() => findSponsoren(), ['list-sponsoren'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.sponsors],
  })()
}

export async function listSocialTiles(): Promise<SocialTileDto[]> {
  return unstable_cache(() => findSocialTiles(), ['list-social-tiles'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.socialTiles],
  })()
}

export async function getSiteSettings(): Promise<CatalogSiteSettings | null> {
  return unstable_cache(() => findSiteSettings(), ['site-settings'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.siteSettings],
  })()
}

export async function getHomepage(): Promise<CatalogHomepage | null> {
  const { draft } = await draftOpts()
  if (draft) return findHomepage({ draft: true })
  return unstable_cache(() => findHomepage(), ['homepage'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.homepage],
  })()
}

export async function listRedirectRules(): Promise<RedirectRule[]> {
  return unstable_cache(() => findRedirectRules(), ['redirect-rules'], {
    revalidate: CATALOG_REVALIDATE,
    tags: [CACHE_TAGS.redirects],
  })()
}

/** Resolve /:slug collision between Seite, Mannschaft, and Redirect. */
export async function resolveRootSlug(slug: string): Promise<RootSlugResolution> {
  const [page, team, rules] = await Promise.all([
    getSeiteBySlug(slug),
    getMannschaftBySlug(slug),
    listRedirectRules(),
  ])
  return decideRootSlug({
    slug,
    page,
    team,
    redirect: resolveRedirect(`/${slug}`, rules),
  })
}

export async function searchContent(query: string, limit = 24): Promise<SearchHit[]> {
  return findSearchHits(query, limit)
}

/** Thin pass-through: MatchFeed owns CMS read + cache + wall-clock pick. */
export async function getNextMatch(): Promise<MatchDto | null> {
  return getNextMatchFromFeed()
}

/** Load shared block context once per page render. */
export async function getRenderContextData() {
  const [teams, sponsors, socialTiles, { posts }, nextMatch] = await Promise.all([
    listMannschaften(),
    listSponsoren(),
    listSocialTiles(),
    listBeitrage({ limit: 6 }),
    getNextMatch(),
  ])
  return {
    teams,
    sponsors,
    socialTiles,
    nextMatch,
    notices: posts.map((p) => ({
      title: p.title,
      publishedAt: p.publishedAt,
      path: p.path,
      featuredImageUrl: p.featuredImageUrl,
      featuredImageAlt: p.featuredImageAlt,
    })),
  }
}

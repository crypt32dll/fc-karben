import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'

import { CACHE_TAGS, CATALOG_REVALIDATE_SECONDS } from '../cache/revalidate'
import type { RedirectRule } from '../redirects'
import { toNextMetadata } from '../seo'
import type { SocialTileDto } from '../social-feed'
import {
  findBeitragBySlug,
  findBeitrage,
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
import type {
  CatalogHomepage,
  CatalogPage,
  CatalogPost,
  CatalogSeo,
  CatalogSiteSettings,
  CatalogSponsor,
  CatalogTeam,
} from './types'

export { mapPostsForList, mapTeamsForGrid, postPath, teamPath } from './mappers'
export { DEFAULT_TEAMS } from './seed-teams'
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
  return toNextMetadata(
    {
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
      headline: input.title,
    },
    { metadataBase: siteUrl },
  )
}

export async function listBeitrage(options?: {
  limit?: number
  page?: number
}): Promise<{ posts: CatalogPost[]; totalDocs: number; totalPages: number }> {
  const limit = options?.limit ?? 24
  const page = options?.page ?? 1
  return unstable_cache(
    () => findBeitrage({ limit, page }),
    ['list-beitrage', String(limit), String(page)],
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CACHE_TAGS.posts] },
  )()
}

export async function getBeitragBySlug(slug: string): Promise<CatalogPost | null> {
  return unstable_cache(() => findBeitragBySlug(slug), ['beitrag', slug], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.posts],
  })()
}

export async function getSeiteBySlug(slug: string): Promise<CatalogPage | null> {
  return unstable_cache(() => findSeiteBySlug(slug), ['seite-slug', slug], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.pages],
  })()
}

export async function getSeiteByPath(pathname: string): Promise<CatalogPage | null> {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return unstable_cache(() => findSeiteByPath(path), ['seite-path', path], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.pages],
  })()
}

export async function listMannschaften(): Promise<CatalogTeam[]> {
  return unstable_cache(() => findMannschaften(), ['list-mannschaften'], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.teams],
  })()
}

export async function getMannschaftBySlug(slug: string): Promise<CatalogTeam | null> {
  return unstable_cache(() => findMannschaftBySlug(slug), ['mannschaft', slug], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.teams],
  })()
}

export async function listSponsoren(): Promise<CatalogSponsor[]> {
  return unstable_cache(() => findSponsoren(), ['list-sponsoren'], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.sponsors],
  })()
}

export async function listSocialTiles(): Promise<SocialTileDto[]> {
  return unstable_cache(() => findSocialTiles(), ['list-social-tiles'], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.socialTiles],
  })()
}

export async function getSiteSettings(): Promise<CatalogSiteSettings | null> {
  return unstable_cache(() => findSiteSettings(), ['site-settings'], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.siteSettings],
  })()
}

export async function getHomepage(): Promise<CatalogHomepage | null> {
  return unstable_cache(() => findHomepage(), ['homepage'], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.homepage],
  })()
}

export async function listRedirectRules(): Promise<RedirectRule[]> {
  return unstable_cache(() => findRedirectRules(), ['redirect-rules'], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.redirects],
  })()
}

/** Load shared block context once per page render. */
export async function getRenderContextData() {
  const [teams, sponsors, socialTiles, { posts }] = await Promise.all([
    listMannschaften(),
    listSponsoren(),
    listSocialTiles(),
    listBeitrage({ limit: 6 }),
  ])
  return {
    teams,
    sponsors,
    socialTiles,
    notices: posts.map((p) => ({
      title: p.title,
      publishedAt: p.publishedAt,
      path: p.path,
    })),
  }
}

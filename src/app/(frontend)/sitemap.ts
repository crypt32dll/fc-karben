import type { MetadataRoute } from 'next'

import { listBeitrage, listMannschaften } from '@/lib/content-catalog'
import { clubAppRoutes, clubStaticPagePaths } from '@/lib/club-paths'
import { getPublicSiteURL } from '@/lib/seo/generate'

export const revalidate = false

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getPublicSiteURL()
  const staticPaths = [clubAppRoutes.home === '/' ? '' : clubAppRoutes.home, ...clubStaticPagePaths()]

  const now = new Date()
  const [teams, { posts }] = await Promise.all([listMannschaften(), listBeitrage({ limit: 500 })])

  return [
    ...staticPaths.map((path) => ({
      url: `${site}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
    ...teams.map((team) => ({
      url: `${site}${team.path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${site}${post.path}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}

import type { MetadataRoute } from 'next'

import { allowSearchIndexing, getPublicSiteURL } from '@/lib/seo/generate'

export default function robots(): MetadataRoute.Robots {
  const site = getPublicSiteURL()

  if (!allowSearchIndexing()) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}

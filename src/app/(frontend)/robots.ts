import type { MetadataRoute } from 'next'

import { getPublicSiteURL } from '@/lib/seo/generate'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production'
  const site = getPublicSiteURL()

  if (!isProd) {
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

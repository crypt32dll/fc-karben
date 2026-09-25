import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production'
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://fc-karben.de'

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

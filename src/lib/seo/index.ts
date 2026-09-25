export type SeoInput = {
  title?: string | null
  description?: string | null
  path: string
  siteName?: string
  noIndex?: boolean
  noFollow?: boolean
  canonicalOverride?: string | null
  ogImageUrl?: string | null
  publishedAt?: string | null
  modifiedAt?: string | null
  type?: 'website' | 'article'
}

export type AbsoluteUrlOptions = {
  metadataBase: string
}

export function absoluteUrl(path: string, { metadataBase }: AbsoluteUrlOptions): string {
  const base = metadataBase.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function buildTitle(pageTitle: string | null | undefined, siteName = 'FC Karben'): string {
  if (!pageTitle || pageTitle === siteName) return siteName
  return `${pageTitle} | ${siteName}`
}

export function buildCanonical(input: SeoInput, opts: AbsoluteUrlOptions): string {
  if (input.canonicalOverride) {
    if (input.canonicalOverride.startsWith('http')) return input.canonicalOverride
    return absoluteUrl(input.canonicalOverride, opts)
  }
  return absoluteUrl(input.path, opts)
}

export function buildOrganizationJsonLd(opts: {
  name: string
  url: string
  logoUrl?: string | null
  sameAs?: string[]
  address?: string | null
  foundingDate?: string | number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: opts.name,
    url: opts.url,
    logo: opts.logoUrl || undefined,
    sameAs: opts.sameAs?.filter(Boolean),
    address: opts.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: opts.address,
          addressLocality: 'Karben',
          addressCountry: 'DE',
        }
      : undefined,
    foundingDate: opts.foundingDate ? String(opts.foundingDate) : undefined,
  }
}

export function buildArticleJsonLd(opts: {
  headline: string
  url: string
  datePublished?: string | null
  dateModified?: string | null
  image?: string | null
  publisherName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: opts.headline,
    url: opts.url,
    datePublished: opts.datePublished || undefined,
    dateModified: opts.dateModified || opts.datePublished || undefined,
    image: opts.image || undefined,
    author: {
      '@type': 'Organization',
      name: opts.publisherName,
    },
    publisher: {
      '@type': 'Organization',
      name: opts.publisherName,
    },
  }
}

export function robotsFromFlags(noIndex?: boolean, noFollow?: boolean) {
  return {
    index: !noIndex,
    follow: !noFollow,
  }
}

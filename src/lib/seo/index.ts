import type { Metadata } from 'next'

import { allowSearchIndexing, getPublicSiteURL } from './generate'

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
  /** Original headline for JSON-LD (may differ from meta title) */
  headline?: string | null
}

export type AbsoluteUrlOptions = {
  metadataBase: string
}

/** Default share image when a doc has no featured/OG image. */
export const DEFAULT_OG_IMAGE_PATH = '/logo.png'

export function absoluteUrl(path: string, { metadataBase }: AbsoluteUrlOptions): string {
  const base = metadataBase.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/**
 * Strip repeated ` | SiteName` suffixes from CMS / migrated titles so the
 * layout `title.template` (`%s | FC Karben`) only appends the brand once.
 */
export function normalizePageTitle(
  pageTitle: string | null | undefined,
  siteName = 'FC Karben',
): string {
  let t = (pageTitle || '').replace(/\s+/g, ' ').trim()
  if (!t) return siteName

  const suffix = ` | ${siteName}`
  while (t.endsWith(suffix)) {
    t = t.slice(0, -suffix.length).trim()
  }
  // Also strip " | FC Karben e.V." style leftovers
  const evSuffix = ` | ${siteName} e.V.`
  while (t.endsWith(evSuffix)) {
    t = t.slice(0, -evSuffix.length).trim()
  }

  return t || siteName
}

/** Absolute document title (for OG / places without the layout template). */
export function buildTitle(pageTitle: string | null | undefined, siteName = 'FC Karben'): string {
  const segment = normalizePageTitle(pageTitle, siteName)
  if (segment === siteName || segment === `${siteName} e.V.`) return segment
  return `${segment} | ${siteName}`
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
    address: opts.address ? toPostalAddress(opts.address) : undefined,
    foundingDate: opts.foundingDate ? String(opts.foundingDate) : undefined,
  }
}

/** Parse CMS address lines like "Karl-Liebknecht-Str. 48, 61184 Karben". */
export function toPostalAddress(raw: string) {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(.*?),\s*(\d{5})\s+(.+)$/)
  if (match) {
    return {
      '@type': 'PostalAddress' as const,
      streetAddress: match[1]!.trim(),
      postalCode: match[2],
      addressLocality: match[3]!.trim(),
      addressCountry: 'DE',
    }
  }
  const loose = trimmed.match(/(\d{5})\s+([A-Za-zÄÖÜäöüß.\-\s]+)$/)
  if (loose) {
    const street = trimmed.slice(0, loose.index).replace(/[,\s]+$/, '').trim()
    return {
      '@type': 'PostalAddress' as const,
      streetAddress: street || undefined,
      postalCode: loose[1],
      addressLocality: loose[2]!.trim(),
      addressCountry: 'DE',
    }
  }
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: trimmed,
    postalCode: '61184',
    addressLocality: 'Karben',
    addressCountry: 'DE',
  }
}

export type BreadcrumbCrumb = {
  name: string
  /** Absolute or site-relative URL. Omit on the last crumb (current page). */
  path?: string | null
}

/** Sitewide WebSite + SearchAction (Sitelinks search box when Google shows it). */
export function buildWebSiteJsonLd(opts: {
  name: string
  url: string
  searchUrlTemplate: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name,
    url: opts.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: opts.searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbJsonLd(
  crumbs: BreadcrumbCrumb[],
  opts: AbsoluteUrlOptions,
) {
  const itemListElement = crumbs.map((crumb, index) => {
    const position = index + 1
    const isLast = index === crumbs.length - 1
    const item =
      crumb.path && !isLast
        ? absoluteUrl(crumb.path, opts)
        : crumb.path
          ? absoluteUrl(crumb.path, opts)
          : undefined
    return {
      '@type': 'ListItem' as const,
      position,
      name: crumb.name,
      ...(item ? { item } : {}),
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

export function buildArticleJsonLd(opts: {
  headline: string
  url: string
  datePublished?: string | null
  dateModified?: string | null
  image?: string | null
  description?: string | null
  articleSection?: string | null
  publisherName: string
  publisherLogoUrl?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: opts.headline,
    url: opts.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
    datePublished: opts.datePublished || undefined,
    dateModified: opts.dateModified || opts.datePublished || undefined,
    image: opts.image || undefined,
    description: opts.description || undefined,
    articleSection: opts.articleSection || undefined,
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: opts.publisherName,
    },
    publisher: {
      '@type': 'Organization',
      name: opts.publisherName,
      ...(opts.publisherLogoUrl
        ? {
            logo: {
              '@type': 'ImageObject',
              url: opts.publisherLogoUrl,
            },
          }
        : {}),
    },
  }
}

/** Presse index — CollectionPage + compact ItemList (not every archive row). */
export function buildCollectionPageJsonLd(opts: {
  name: string
  url: string
  description?: string | null
  items: Array<{ name: string; url: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    url: opts.url,
    description: opts.description || undefined,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    },
  }
}

export function buildSportsTeamJsonLd(opts: {
  name: string
  url: string
  sport?: string | null
  description?: string | null
  image?: string | null
  memberOfName?: string | null
  memberOfUrl?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: opts.name,
    url: opts.url,
    sport: opts.sport || 'Soccer',
    description: opts.description || undefined,
    image: opts.image || undefined,
    memberOf: opts.memberOfName
      ? {
          '@type': 'SportsOrganization',
          name: opts.memberOfName,
          url: opts.memberOfUrl || undefined,
        }
      : undefined,
  }
}

export function robotsFromFlags(noIndex?: boolean, noFollow?: boolean) {
  const blockAll = !allowSearchIndexing()
  return {
    index: blockAll ? false : !noIndex,
    follow: blockAll ? false : !noFollow,
  }
}

function resolveOgImageUrl(input: SeoInput, metadataBase: string): string {
  if (input.ogImageUrl?.trim()) {
    const raw = input.ogImageUrl.trim()
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    return absoluteUrl(raw.startsWith('/') ? raw : `/${raw}`, { metadataBase })
  }
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH, { metadataBase })
}

/** Canonical Next.js Metadata factory — exclusive SeoSurface seam for ClubSite. */
export function toNextMetadata(
  input: SeoInput,
  opts?: AbsoluteUrlOptions & { siteName?: string },
): Metadata {
  const metadataBase = opts?.metadataBase || getPublicSiteURL()
  const siteName = opts?.siteName || input.siteName || 'FC Karben'
  const canonical = buildCanonical(input, { metadataBase })
  const robots = robotsFromFlags(input.noIndex, input.noFollow)
  const pageTitle = normalizePageTitle(input.title || siteName, siteName)
  const absoluteTitle = buildTitle(pageTitle, siteName)
  const ogImage = resolveOgImageUrl(input, metadataBase)

  return {
    // Segment only — root layout `title.template` appends ` | FC Karben` once.
    title: pageTitle,
    description: input.description || undefined,
    alternates: { canonical },
    robots,
    openGraph: {
      title: absoluteTitle,
      description: input.description || undefined,
      url: canonical,
      locale: 'de_DE',
      type: input.type === 'article' ? 'article' : 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle,
      description: input.description || undefined,
      images: [ogImage],
    },
  }
}

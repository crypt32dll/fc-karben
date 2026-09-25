import type { Metadata } from 'next'

import { getPublicSiteURL, allowSearchIndexing } from './generate'


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
  const blockAll = !allowSearchIndexing()
  return {
    index: blockAll ? false : !noIndex,
    follow: blockAll ? false : !noFollow,
  }
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
  const titleText = input.title || siteName

  const meta: Metadata = {
    title: buildTitle(titleText, siteName),
    description: input.description || undefined,
    alternates: { canonical },
    robots,
    openGraph: {
      title: titleText,
      description: input.description || undefined,
      url: canonical,
      locale: 'de_DE',
      type: input.type === 'article' ? 'article' : 'website',
      images: input.ogImageUrl ? [{ url: input.ogImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: input.description || undefined,
      images: input.ogImageUrl ? [input.ogImageUrl] : undefined,
    },
  }

  if (input.type === 'article') {
    meta.other = {
      'script:ld+json': JSON.stringify(
        buildArticleJsonLd({
          headline: input.headline || titleText,
          url: canonical,
          datePublished: input.publishedAt,
          dateModified: input.modifiedAt,
          image: input.ogImageUrl,
          publisherName: siteName,
        }),
      ),
    }
  }

  return meta
}

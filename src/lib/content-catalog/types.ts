import type { PageLayoutView } from '../page-builder'
import type { CatalogBody } from './body'

export type { CatalogBody } from './body'

export type CatalogSeo = {
  metaTitle?: string | null
  metaDescription?: string | null
  noIndex?: boolean | null
  noFollow?: boolean | null
  canonicalOverride?: string | null
  ogImageUrl?: string | null
}

export type CatalogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  path: string
  content?: CatalogBody | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  categories?: Array<{ title: string; slug: string }>
  seo?: CatalogSeo
}

export type CatalogPage = {
  id: string
  title: string
  slug: string
  path: string
  content?: CatalogBody | null
  layout?: PageLayoutView | null
  seo?: CatalogSeo
  updatedAt?: string | null
}

export type CatalogTeam = {
  id: string
  name: string
  slug: string
  shortLabel?: string | null
  league?: string | null
  summary?: string | null
  fussballDeUrl?: string | null
  syncMatches?: boolean | null
  path: string
  content?: CatalogBody | null
  seo?: CatalogSeo
}

export type CatalogNotice = {
  id: string
  title: string
  publishedAt?: string | null
  path: string
}

export type CatalogSponsor = {
  id: string
  name: string
  url?: string | null
  logoUrl?: string | null
  sortOrder: number
}

export type CatalogSiteSettings = {
  clubName: string
  tagline?: string | null
  foundingYear?: number | null
  email?: string | null
  address?: string | null
  venue?: string | null
  social?: {
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
  }
  defaultSeo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImageUrl?: string | null
  }
  gscVerification?: string | null
}

export type CatalogHomepage = {
  heroEyebrow?: string | null
  heroTitle?: string | null
  heroLead?: string | null
  heroPrimaryCta?: { label?: string | null; href?: string | null }
  heroSecondaryCta?: { label?: string | null; href?: string | null }
  vereinIntro?: string | null
  layout?: PageLayoutView | null
}

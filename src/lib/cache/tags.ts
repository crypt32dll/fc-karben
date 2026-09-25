/** Cache tag names — Next-free so CMS modules can declare without importing next/cache. */
export const CACHE_TAGS = {
  posts: 'posts',
  pages: 'pages',
  teams: 'teams',
  sponsors: 'sponsors',
  socialTiles: 'social-tiles',
  redirects: 'redirects',
  homepage: 'homepage',
  siteSettings: 'site-settings',
  matches: 'matches',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/**
 * Data Cache TTL for ContentCatalog.
 * `false` = tag-only (on-demand via Payload hooks); no blind time expiry.
 */
export const CATALOG_REVALIDATE = false as const

/** @deprecated Alias — prefer CATALOG_REVALIDATE. */
export const CATALOG_REVALIDATE_SECONDS = CATALOG_REVALIDATE

export type CachePolicy = {
  tags: CacheTag[]
  /** Static paths always revalidated (Full Route Cache). */
  paths?: string[]
  /** Extra paths derived from the changed document. */
  pathsFromDoc?: (doc: unknown) => string[]
}

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

/** Default ISR window for ClubSite catalog reads (seconds). */
export const CATALOG_REVALIDATE_SECONDS = 300

export type CachePolicy = {
  tags: CacheTag[]
  /** Static paths always revalidated. */
  paths?: string[]
  /** Extra paths derived from the changed document (Phase 1 doc-aware bust). */
  pathsFromDoc?: (doc: unknown) => string[]
}

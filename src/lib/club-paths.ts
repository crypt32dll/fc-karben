/** Canonical ClubSite paths — single source for SEO, redirects, search, catalog, nav. */

export function postPath(slug: string): string {
  const s = slug.replace(/^\/+|\/+$/g, '')
  return `/presse/${s}`
}

export function teamPath(slug: string): string {
  const s = slug.replace(/^\/+|\/+$/g, '')
  return `/${s}`
}

export function pagePath(slug: string, pathHint?: string | null): string {
  if (pathHint) {
    return pathHint.startsWith('/') ? pathHint : `/${pathHint}`
  }
  return teamPath(slug)
}

export function pathForDoc(input: {
  collectionSlug?: string | null
  relationTo?: string | null
  slug?: string | null
  path?: string | null
}): string {
  const relation = input.collectionSlug || input.relationTo || 'pages'
  if (input.path) return pagePath('', input.path)
  if (!input.slug) return '/'
  if (relation === 'posts') return postPath(input.slug)
  if (relation === 'teams') return teamPath(input.slug)
  return pagePath(input.slug)
}

/**
 * Known Payload `pages` documents: slug (+ optional canonical `path` field).
 * Keep in sync with CMS pages / WXR migration.
 */
export const clubPages = {
  verein: { slug: 'verein', path: '/verein' },
  vorstand: { slug: 'vorstand', path: '/verein/vorstand' },
  vereinssatzung: { slug: 'vereinssatzung', path: '/verein/vereinssatzung' },
  mitgliedWerden: { slug: 'mitglied-werden', path: '/verein/mitglied-werden' },
  beitragsstruktur: { slug: 'beitragsstruktur', path: '/verein/beitragsstruktur' },
  platzbelegung: { slug: 'platzbelegung', path: '/verein/platzbelegung' },
  gremien: { slug: 'gremien', path: '/verein/gremien' },
  presse: { slug: 'presse', path: '/presse' },
  spielberichte: { slug: 'spielberichte', path: '/spielberichte' },
  sponsoren: { slug: 'sponsoren', path: '/sponsoren' },
  formulare: { slug: 'formulare', path: '/formulare' },
  anfahrt: { slug: 'anfahrt', path: '/anfahrt' },
  impressum: { slug: 'impressum', path: '/impressum' },
  datenschutz: { slug: 'datenschutz', path: '/datenschutz' },
} as const

export type ClubPageKey = keyof typeof clubPages

/** Known Payload `teams` documents (slug = public URL segment). */
export const clubTeams = {
  first: { slug: '1-mannschaft', label: '1. Mannschaft' },
  second: { slug: '2-mannschaft', label: '2. Mannschaft' },
  third: { slug: '3-mannschaft', label: '3. Mannschaft' },
  eJugend: { slug: 'e-jugend', label: 'E-Jugend' },
  alteHerren: { slug: 'alte-herren', label: 'Alte Herren' },
} as const

export type ClubTeamKey = keyof typeof clubTeams

/** App Router routes that are not CMS documents. */
export const clubAppRoutes = {
  home: '/',
  search: '/suche',
  teamsSection: '/#mannschaften',
} as const

export function hrefForPage(key: ClubPageKey): string {
  const page = clubPages[key]
  return pagePath(page.slug, page.path)
}

export function hrefForTeam(key: ClubTeamKey): string {
  return teamPath(clubTeams[key].slug)
}

export function hrefForSearch(query?: string): string {
  const q = query?.trim()
  if (!q) return clubAppRoutes.search
  return `${clubAppRoutes.search}?q=${encodeURIComponent(q)}`
}

/** Sitemap / static index paths derived from CMS page registry. */
export function clubStaticPagePaths(): string[] {
  return Object.values(clubPages).map((p) => pagePath(p.slug, p.path))
}

export function isTeamPath(pathname: string): boolean {
  return Object.values(clubTeams).some((t) => pathname === teamPath(t.slug))
}

/**
 * Paths that are already canonical ClubSite routes — proxy can skip CMS redirect lookup.
 * (Redirects only matter for legacy/unknown inbound URLs.)
 */
export function isKnownClubSitePath(pathname: string): boolean {
  const p = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  if (p === '/' || p === clubAppRoutes.search) return true
  if (p === '/presse' || p.startsWith('/presse/')) return true
  if (isTeamPath(p)) return true
  return Object.values(clubPages).some((page) => pagePath(page.slug, page.path) === p)
}

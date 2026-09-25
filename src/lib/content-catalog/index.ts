import { createLogger } from '../logger'

const log = createLogger('ContentCatalog')

export type CatalogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  path: string
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
}

export type CatalogNotice = {
  id: string
  title: string
  publishedAt?: string | null
  path: string
}

/** Pure helpers used by ContentCatalog — easy to unit test without Payload */

export function postPath(slug: string): string {
  return `/presse/${slug}`
}

export function teamPath(slug: string): string {
  return `/${slug}`
}

export function mapPostsForList(
  docs: Array<{
    id: string | number
    title: string
    slug: string
    excerpt?: string | null
    publishedAt?: string | null
  }>,
): CatalogPost[] {
  log.debug('mapPostsForList', { count: docs.length })
  return docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    publishedAt: doc.publishedAt,
    path: postPath(doc.slug),
  }))
}

export function mapTeamsForGrid(
  docs: Array<{
    id: string | number
    name: string
    slug: string
    shortLabel?: string | null
    league?: string | null
    summary?: string | null
    fussballDeUrl?: string | null
    syncMatches?: boolean | null
    active?: boolean | null
  }>,
): CatalogTeam[] {
  return docs
    .filter((d) => d.active !== false)
    .map((doc) => ({
      id: String(doc.id),
      name: doc.name,
      slug: doc.slug,
      shortLabel: doc.shortLabel,
      league: doc.league,
      summary: doc.summary,
      fussballDeUrl: doc.fussballDeUrl,
      syncMatches: doc.syncMatches,
      path: teamPath(doc.slug),
    }))
}

export const DEFAULT_TEAMS: CatalogTeam[] = [
  {
    id: '1',
    name: '1. Mannschaft',
    slug: '1-mannschaft',
    shortLabel: '01',
    league: 'Gruppenliga · Günter-Reutzel-Sportfeld',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/01OT7G9AUK000000VV0AG80NVT74RFIN#!/',
    syncMatches: true,
    path: '/1-mannschaft',
  },
  {
    id: '2',
    name: '2. Mannschaft',
    slug: '2-mannschaft',
    shortLabel: '02',
    league: 'Kreisliga B',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-ii-fc-karben-hessen/-/saison/2627/team-id/01OT7GCS8S000000VV0AG80NVT74RFIN#!/',
    path: '/2-mannschaft',
  },
  {
    id: '3',
    name: '3. Mannschaft',
    slug: '3-mannschaft',
    shortLabel: '03',
    league: 'Kreisliga C',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/sg-karben-iii-fc-karben-hessen/-/saison/2627/team-id/02IDOPSOPK000000VS5489B1VUG7QVAU#!/',
    path: '/3-mannschaft',
  },
  {
    id: '4',
    name: 'E-Jugend',
    slug: 'e-jugend',
    shortLabel: '04',
    league: 'Jugendförderung',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02PSLBKJP0000000VS5489B1VVQNIHJA#!/',
    path: '/e-jugend',
  },
  {
    id: '5',
    name: 'Alte Herren',
    slug: 'alte-herren',
    shortLabel: '05',
    league: 'Ü35',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02M10U9VA4000000VS5489B1VVVHS1D7#!/',
    path: '/alte-herren',
  },
]

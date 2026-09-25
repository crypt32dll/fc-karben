import { extractFussballDeTeamId } from '../match-feed'

/** Seed roster for MigrationPipeline load — not part of ContentCatalog. */
export type SeedTeam = {
  name: string
  slug: string
  shortLabel: string
  league: string
  fussballDeUrl: string
  fussballDeId?: string
  syncMatches?: boolean
  path: string
}

function teamFromUrl(
  partial: Omit<SeedTeam, 'fussballDeId'> & { fussballDeUrl: string },
): SeedTeam {
  return {
    ...partial,
    fussballDeId: extractFussballDeTeamId(partial.fussballDeUrl) ?? undefined,
  }
}

export const DEFAULT_TEAMS: SeedTeam[] = [
  teamFromUrl({
    name: '1. Mannschaft',
    slug: '1-mannschaft',
    shortLabel: '01',
    league: 'Gruppenliga · Günter-Reutzel-Sportfeld',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/01OT7G9AUK000000VV0AG80NVT74RFIN#!/',
    syncMatches: true,
    path: '/1-mannschaft',
  }),
  teamFromUrl({
    name: '2. Mannschaft',
    slug: '2-mannschaft',
    shortLabel: '02',
    league: 'Kreisliga B',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-ii-fc-karben-hessen/-/saison/2627/team-id/01OT7GCS8S000000VV0AG80NVT74RFIN#!/',
    path: '/2-mannschaft',
  }),
  teamFromUrl({
    name: '3. Mannschaft',
    slug: '3-mannschaft',
    shortLabel: '03',
    league: 'Kreisliga C',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/sg-karben-iii-fc-karben-hessen/-/saison/2627/team-id/02IDOPSOPK000000VS5489B1VUG7QVAU#!/',
    path: '/3-mannschaft',
  }),
  teamFromUrl({
    name: 'E-Jugend',
    slug: 'e-jugend',
    shortLabel: '04',
    league: 'Jugendförderung',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02PSLBKJP0000000VS5489B1VVQNIHJA#!/',
    path: '/e-jugend',
  }),
  teamFromUrl({
    name: 'Alte Herren',
    slug: 'alte-herren',
    shortLabel: '05',
    league: 'Ü35',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02M10U9VA4000000VS5489B1VVVHS1D7#!/',
    path: '/alte-herren',
  }),
]

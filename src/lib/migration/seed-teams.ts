import { extractFussballDeTeamId } from '../match-feed'

/** Seed roster for MigrationPipeline load — not part of ContentCatalog. */
export type SeedTeam = {
  name: string
  slug: string
  shortLabel: string
  league: string
  fussballDeUrl: string
  fussballDeId?: string
  widgetSpielplanId?: string
  widgetTabelleId?: string
  reportCategorySlug?: string
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
    widgetSpielplanId: 'b25a6f2a-3183-4001-a124-6de8af1c9b65',
    widgetTabelleId: '8037ae4f-d8d2-4248-949f-4bbf7b5339fb',
    reportCategorySlug: 'spielberichte-1-mannschaft',
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
    widgetSpielplanId: '8cf21fc1-894b-42b0-8f53-257f6d6b3a9f',
    widgetTabelleId: 'c49682d4-7ae6-4a19-883b-faf2ea8dd8bc',
    reportCategorySlug: 'spielberichte-2-mannschaft',
    path: '/2-mannschaft',
  }),
  teamFromUrl({
    name: '3. Mannschaft',
    slug: '3-mannschaft',
    shortLabel: '03',
    league: 'Kreisliga C',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/sg-karben-iii-fc-karben-hessen/-/saison/2627/team-id/02IDOPSOPK000000VS5489B1VUG7QVAU#!/',
    widgetSpielplanId: '6f2a67a0-ffd3-4c38-a424-e014ec590f65',
    widgetTabelleId: '51bbe4c7-6444-44b2-a311-3dea7f594045',
    reportCategorySlug: 'spielberichte-3-mannschaft',
    path: '/3-mannschaft',
  }),
  teamFromUrl({
    name: 'E-Jugend',
    slug: 'e-jugend',
    shortLabel: '04',
    league: 'Jugendförderung',
    fussballDeUrl:
      'https://www.fussball.de/mannschaft/fc-karben-fc-karben-hessen/-/saison/2627/team-id/02PSLBKJP0000000VS5489B1VVQNIHJA#!/',
    widgetSpielplanId: '4bd0aba8-ca05-480f-a58f-bf845f91f704',
    widgetTabelleId: '7f44a749-33fa-40c9-9214-c93dc9b7dcc3',
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

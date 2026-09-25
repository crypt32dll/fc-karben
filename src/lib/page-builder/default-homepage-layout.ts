import type { PageLayoutView } from './schemas'

type HomepageHeroSource = {
  heroEyebrow?: string | null
  heroTitle?: string | null
  heroLead?: string | null
  heroPrimaryCta?: { label?: string | null; href?: string | null }
  heroSecondaryCta?: { label?: string | null; href?: string | null }
  vereinIntro?: string | null
}

/**
 * Default homepage PageLayoutView when CMS layout is empty.
 * Maps legacy hero* fields into blocks so ClubSite has one render path.
 */
export function defaultHomepageLayout(homepage?: HomepageHeroSource | null): PageLayoutView {
  return [
    {
      blockType: 'hero',
      id: 'default-hero',
      eyebrow: homepage?.heroEyebrow || 'Gruppenliga · Saison 2025/26',
      title: homepage?.heroTitle || 'Mit Leidenschaft für Karben.',
      lead:
        homepage?.heroLead ||
        'Der FC Karben e.V. ist die fußballerische Heimat der Stadt Karben — vom Bambini-Training bis zur ersten Mannschaft. Gegründet 2015, getragen von echter Vereinsliebe.',
      primaryCta: {
        label: homepage?.heroPrimaryCta?.label || 'Jetzt Mitglied werden',
        href: homepage?.heroPrimaryCta?.href || '/verein/mitglied-werden',
      },
      secondaryCta: {
        label: homepage?.heroSecondaryCta?.label || 'Mannschaften ansehen',
        href: homepage?.heroSecondaryCta?.href || '/#mannschaften',
      },
    },
    {
      blockType: 'scoreboard',
      id: 'default-scoreboard',
      label: 'Nächstes Spiel',
      fallbackText: 'Spielplan wird aus Fussball.de synchronisiert (1. Mannschaft)',
    },
    {
      blockType: 'teamGrid',
      id: 'default-teams',
      eyebrow: 'Unsere Teams',
      heading: 'Mannschaften',
    },
    {
      blockType: 'postList',
      id: 'default-posts',
      eyebrow: 'Aktuelles',
      heading: 'Presse',
      limit: 4,
    },
    {
      blockType: 'socialGrid',
      id: 'default-social',
      eyebrow: 'Live von Instagram',
      heading: 'Auf Social Media',
      maxTiles: 6,
    },
    {
      blockType: 'cta',
      id: 'default-verein',
      heading: 'Der Verein',
      text:
        homepage?.vereinIntro ||
        'Der FC Karben e.V. wurde im Mai 2015 gegründet und ist seitdem als fußballerische Heimat in der Stadt Karben gewachsen.',
      buttonLabel: 'Vereinssatzung ansehen',
      buttonHref: '/verein/vereinssatzung',
      variant: 'navy',
    },
    {
      blockType: 'sponsors',
      id: 'default-sponsors',
      eyebrow: 'Unsere Sponsoren',
    },
  ]
}

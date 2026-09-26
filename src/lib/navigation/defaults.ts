import { type ClubTeamKey, clubAppRoutes, clubTeams, hrefForPage, hrefForTeam } from '../club-paths'

export type NavChild = {
  label: string
  href: string
}

export type NavItem = {
  label: string
  href: string
  children?: NavChild[]
}

const TEAM_KEYS: ClubTeamKey[] = ['first', 'second', 'third', 'eJugend', 'alteHerren']

/** Default Hauptnavigation — seed / fallback when CMS array is empty. */
export function defaultPrimaryNav(): NavItem[] {
  return [
    { label: 'Home', href: clubAppRoutes.home },
    {
      label: 'Mannschaften',
      href: clubAppRoutes.teamsSection,
      children: TEAM_KEYS.map((key) => ({
        label: clubTeams[key].label,
        href: hrefForTeam(key),
      })),
    },
    {
      label: 'Verein',
      href: hrefForPage('verein'),
      children: [
        { label: 'Vorstand', href: hrefForPage('vorstand') },
        { label: 'Vereinssatzung', href: hrefForPage('vereinssatzung') },
        { label: 'Mitglied werden', href: hrefForPage('mitgliedWerden') },
        { label: 'Beitragsstruktur', href: hrefForPage('beitragsstruktur') },
        { label: 'Platzbelegung', href: hrefForPage('platzbelegung') },
        { label: 'Formulare', href: hrefForPage('formulare') },
      ],
    },
    {
      label: 'Presse',
      href: hrefForPage('presse'),
    },
    { label: 'Sponsoren', href: hrefForPage('sponsoren') },
    { label: 'Anfahrt', href: hrefForPage('anfahrt') },
  ]
}

/** Default footer columns when CMS footerNav is empty. */
export function defaultFooterNav(): Array<{ heading: string; items: NavChild[] }> {
  return [
    {
      heading: 'Verein',
      items: [
        { label: 'Vorstand', href: hrefForPage('vorstand') },
        { label: 'Vereinssatzung', href: hrefForPage('vereinssatzung') },
        { label: 'Mitglied werden', href: hrefForPage('mitgliedWerden') },
        { label: 'Beitragsstruktur', href: hrefForPage('beitragsstruktur') },
        { label: 'Platzbelegung', href: hrefForPage('platzbelegung') },
        { label: 'Formulare', href: hrefForPage('formulare') },
      ],
    },
    {
      heading: 'Mannschaften',
      items: TEAM_KEYS.map((key) => ({
        label: clubTeams[key].label,
        href: hrefForTeam(key),
      })),
    },
    {
      heading: 'Kontakt',
      items: [
        { label: 'Anfahrt', href: hrefForPage('anfahrt') },
        { label: 'Suche', href: clubAppRoutes.search },
      ],
    },
  ]
}

export function normalizeNavItems(raw: unknown): NavItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaultPrimaryNav()
  const items: NavItem[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    const label = typeof e.label === 'string' ? e.label.trim() : ''
    const href = typeof e.href === 'string' ? e.href.trim() : ''
    if (!label || !href) continue
    const children: NavChild[] = []
    if (Array.isArray(e.children)) {
      for (const child of e.children) {
        if (!child || typeof child !== 'object') continue
        const c = child as Record<string, unknown>
        const cLabel = typeof c.label === 'string' ? c.label.trim() : ''
        const cHref = typeof c.href === 'string' ? c.href.trim() : ''
        if (cLabel && cHref) children.push({ label: cLabel, href: cHref })
      }
    }
    items.push({ label, href, children: children.length ? children : undefined })
  }
  return items.length ? items : defaultPrimaryNav()
}

export function normalizeFooterNav(raw: unknown): Array<{ heading: string; items: NavChild[] }> {
  if (!Array.isArray(raw) || raw.length === 0) return defaultFooterNav()
  const cols: Array<{ heading: string; items: NavChild[] }> = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    const heading = typeof e.heading === 'string' ? e.heading.trim() : ''
    if (!heading || !Array.isArray(e.items)) continue
    const items: NavChild[] = []
    for (const item of e.items) {
      if (!item || typeof item !== 'object') continue
      const i = item as Record<string, unknown>
      const label = typeof i.label === 'string' ? i.label.trim() : ''
      const href = typeof i.href === 'string' ? i.href.trim() : ''
      if (label && href) items.push({ label, href })
    }
    if (items.length) cols.push({ heading, items })
  }
  return cols.length ? cols : defaultFooterNav()
}

export function navItemIsActive(item: NavItem, pathname: string): boolean {
  if (item.href === '/' || item.href === clubAppRoutes.home) {
    return pathname === '/'
  }
  const base = item.href.split('#')[0]
  if (base && pathname === base) return true
  if (base && base !== '/' && pathname.startsWith(`${base}/`)) return true
  if (item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))) {
    return true
  }
  return false
}

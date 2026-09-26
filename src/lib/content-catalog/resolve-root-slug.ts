import type { CatalogPage, CatalogTeam } from './types'

export type RootSlugResolution =
  | { kind: 'seite'; page: CatalogPage; team: CatalogTeam | null }
  | { kind: 'mannschaft'; team: CatalogTeam; page: CatalogPage | null }
  | { kind: 'redirect'; to: string; permanent: boolean }
  | { kind: 'not_found' }

function pageHasBody(page: CatalogPage | null | undefined): boolean {
  if (!page) return false
  if (page.content?.root) return true
  return Array.isArray(page.layout) && page.layout.length > 0
}

/**
 * Collision policy for /:slug —
 * Mannschaft owns the slug when present (TeamTabs + widgets); companion Seite
 * body is passed through for the Team tab. Else Seite / Verein redirect / Redirect map.
 */
export function decideRootSlug(input: {
  slug: string
  page: CatalogPage | null
  team: CatalogTeam | null
  redirect: { to: string; permanent: boolean } | null
}): RootSlugResolution {
  const { slug, page, team, redirect } = input

  if (team) {
    return {
      kind: 'mannschaft',
      team,
      page: pageHasBody(page) ? page : null,
    }
  }

  if (page) {
    if (page.path && page.path !== `/${slug}` && page.path.startsWith('/verein/')) {
      return { kind: 'redirect', to: page.path, permanent: true }
    }
    return { kind: 'seite', page, team: null }
  }

  if (redirect) {
    return { kind: 'redirect', to: redirect.to, permanent: redirect.permanent }
  }

  return { kind: 'not_found' }
}

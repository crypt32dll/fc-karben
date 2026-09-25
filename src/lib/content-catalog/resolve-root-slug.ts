import type { CatalogPage, CatalogTeam } from './types'

export type RootSlugResolution =
  | { kind: 'seite'; page: CatalogPage; team: CatalogTeam | null }
  | { kind: 'mannschaft'; team: CatalogTeam }
  | { kind: 'redirect'; to: string; permanent: boolean }
  | { kind: 'not_found' }

function pageHasBody(page: CatalogPage | null | undefined): boolean {
  if (!page) return false
  if (page.content?.root) return true
  return Array.isArray(page.layout) && page.layout.length > 0
}

/**
 * Collision policy for /:slug —
 * empty Seite + Mannschaft → Mannschaft; Seite with body wins (optional team chrome);
 * Verein canonical path → redirect; else CMS/built-in Redirect map.
 */
export function decideRootSlug(input: {
  slug: string
  page: CatalogPage | null
  team: CatalogTeam | null
  redirect: { to: string; permanent: boolean } | null
}): RootSlugResolution {
  const { slug, page, team, redirect } = input

  if (team && !pageHasBody(page)) {
    return { kind: 'mannschaft', team }
  }

  if (page) {
    if (page.path && page.path !== `/${slug}` && page.path.startsWith('/verein/')) {
      return { kind: 'redirect', to: page.path, permanent: true }
    }
    return { kind: 'seite', page, team }
  }

  if (redirect) {
    return { kind: 'redirect', to: redirect.to, permanent: redirect.permanent }
  }

  return { kind: 'not_found' }
}

/** Canonical ClubSite paths — single source for SEO, redirects, search, catalog. */

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

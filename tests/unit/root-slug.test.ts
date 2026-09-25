import { describe, expect, it } from 'vitest'

import { mapCatalogBody } from '../../src/lib/content-catalog/body'
import { decideRootSlug } from '../../src/lib/content-catalog/resolve-root-slug'
import type { CatalogPage, CatalogTeam } from '../../src/lib/content-catalog/types'

const team = (slug: string): CatalogTeam => ({
  id: '1',
  name: 'Team',
  slug,
  path: `/${slug}`,
})

const page = (partial: Partial<CatalogPage> & Pick<CatalogPage, 'slug'>): CatalogPage => ({
  id: '1',
  title: 'Seite',
  path: `/${partial.slug}`,
  ...partial,
})

describe('mapCatalogBody', () => {
  it('accepts Lexical root shape', () => {
    expect(mapCatalogBody({ root: { type: 'root', children: [] } })).toEqual({
      root: { type: 'root', children: [] },
    })
  })

  it('rejects missing root', () => {
    expect(mapCatalogBody({ foo: 1 })).toBeNull()
    expect(mapCatalogBody(null)).toBeNull()
  })
})

describe('decideRootSlug', () => {
  it('prefers Mannschaft when Seite has no body', () => {
    const hit = decideRootSlug({
      slug: '1-mannschaft',
      page: page({ slug: '1-mannschaft' }),
      team: team('1-mannschaft'),
      redirect: null,
    })
    expect(hit.kind).toBe('mannschaft')
  })

  it('prefers Seite when it has layout', () => {
    const hit = decideRootSlug({
      slug: 'info',
      page: page({
        slug: 'info',
        layout: [{ blockType: 'spacer', id: '1', size: 'md' }],
      }),
      team: team('info'),
      redirect: null,
    })
    expect(hit.kind).toBe('seite')
  })

  it('redirects Verein canonical path', () => {
    const hit = decideRootSlug({
      slug: 'vorstand',
      page: page({ slug: 'vorstand', path: '/verein/vorstand' }),
      team: null,
      redirect: null,
    })
    expect(hit).toEqual({ kind: 'redirect', to: '/verein/vorstand', permanent: true })
  })

  it('uses Redirect map as last resort', () => {
    const hit = decideRootSlug({
      slug: 'old',
      page: null,
      team: null,
      redirect: { to: '/new', permanent: true },
    })
    expect(hit).toEqual({ kind: 'redirect', to: '/new', permanent: true })
  })
})

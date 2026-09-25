import { describe, expect, it } from 'vitest'

import { normalizePath, resolveRedirect, wpDatedPostToPresse } from '../../src/lib/redirects/index'

describe('RedirectMap', () => {
  it('maps WP dated URLs to presse', () => {
    expect(wpDatedPostToPresse('/2026/05/18/einladung-zur-12-mitgliederversammlung/')).toBe(
      '/presse/einladung-zur-12-mitgliederversammlung',
    )
  })

  it('normalizes paths', () => {
    expect(normalizePath('verein/vorstand/')).toBe('/verein/vorstand')
  })

  it('retires g-jugend to presse', () => {
    expect(resolveRedirect('/g-jugend', [])).toEqual({ to: '/presse', permanent: true })
  })

  it('uses explicit rules first', () => {
    expect(resolveRedirect('/old', [{ from: '/old', to: '/new', permanent: true }])).toEqual({
      to: '/new',
      permanent: true,
    })
  })
})

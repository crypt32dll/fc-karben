import { describe, expect, it } from 'vitest'

import {
  isSafeRedirectTarget,
  normalizePath,
  resolveRedirect,
  wpDatedPostToPresse,
} from '../../src/lib/redirects/index'

describe('RedirectMap', () => {
  it('maps WP dated URLs to presse', () => {
    expect(wpDatedPostToPresse('/2026/05/18/einladung-zur-12-mitgliederversammlung/')).toBe(
      '/presse/einladung-zur-12-mitgliederversammlung',
    )
  })

  it('normalizes paths', () => {
    expect(normalizePath('verein/vorstand/')).toBe('/verein/vorstand')
  })

  it('maps g-jugend page to alte-herren', () => {
    expect(resolveRedirect('/g-jugend', [])).toEqual({ to: '/alte-herren', permanent: true })
  })

  it('retires g-jugend category to presse', () => {
    expect(resolveRedirect('/category/g-jugend', [])).toEqual({ to: '/presse', permanent: true })
  })

  it('uses explicit rules first', () => {
    expect(resolveRedirect('/old', [{ from: '/old', to: '/new', permanent: true }])).toEqual({
      to: '/new',
      permanent: true,
    })
  })

  it('rejects open redirects', () => {
    expect(isSafeRedirectTarget('https://evil.example/phish')).toBe(false)
    expect(isSafeRedirectTarget('//evil.example')).toBe(false)
    expect(isSafeRedirectTarget('/presse/ok')).toBe(true)
  })
})

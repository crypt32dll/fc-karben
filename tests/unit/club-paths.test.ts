import { describe, expect, it } from 'vitest'

import {
  clubAppRoutes,
  clubPages,
  clubTeams,
  hrefForPage,
  hrefForSearch,
  hrefForTeam,
  isTeamPath,
} from '../../src/lib/club-paths'

describe('club-paths CMS registry', () => {
  it('builds page hrefs from CMS slugs/paths', () => {
    expect(hrefForPage('mitgliedWerden')).toBe('/verein/mitglied-werden')
    expect(hrefForPage('presse')).toBe('/presse')
    expect(hrefForPage('mitgliedWerden')).toContain(clubPages.mitgliedWerden.slug)
  })

  it('builds team hrefs from CMS slugs', () => {
    expect(hrefForTeam('first')).toBe('/1-mannschaft')
    expect(hrefForTeam('eJugend')).toBe(`/${clubTeams.eJugend.slug}`)
  })

  it('builds search URLs', () => {
    expect(hrefForSearch()).toBe(clubAppRoutes.search)
    expect(hrefForSearch('Vorstand')).toBe('/suche?q=Vorstand')
  })

  it('detects team paths', () => {
    expect(isTeamPath('/2-mannschaft')).toBe(true)
    expect(isTeamPath('/presse')).toBe(false)
  })
})

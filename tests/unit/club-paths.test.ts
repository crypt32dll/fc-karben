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

  it('skips redirect lookup for known ClubSite paths', async () => {
    const { isKnownClubSitePath } = await import('../../src/lib/club-paths')
    expect(isKnownClubSitePath('/')).toBe(true)
    expect(isKnownClubSitePath('/presse')).toBe(true)
    expect(isKnownClubSitePath('/presse/foo')).toBe(true)
    expect(isKnownClubSitePath('/verein/vorstand')).toBe(true)
    expect(isKnownClubSitePath('/suche')).toBe(true)
    expect(isKnownClubSitePath('/2024/01/01/old-post')).toBe(false)
  })
})

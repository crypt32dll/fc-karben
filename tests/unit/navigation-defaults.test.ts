import { describe, expect, it } from 'vitest'

import {
  defaultPrimaryNav,
  navItemIsActive,
  normalizeNavItems,
} from '../../src/lib/navigation/defaults'

describe('navigation defaults', () => {
  it('includes Mannschaften children deeplinks', () => {
    const nav = defaultPrimaryNav()
    const teams = nav.find((i) => i.label === 'Mannschaften')
    expect(teams?.children?.some((c) => c.href === '/1-mannschaft')).toBe(true)
    expect(teams?.children?.length).toBeGreaterThanOrEqual(5)
  })

  it('falls back when CMS array empty', () => {
    expect(normalizeNavItems([])).toEqual(defaultPrimaryNav())
  })

  it('marks verein child paths active on parent', () => {
    const verein = defaultPrimaryNav().find((i) => i.label === 'Verein')!
    expect(verein.children?.some((c) => c.href === '/verein/platzbelegung')).toBe(true)
    expect(navItemIsActive(verein, '/verein/vorstand')).toBe(true)
    expect(navItemIsActive(verein, '/verein/platzbelegung')).toBe(true)
    expect(navItemIsActive(verein, '/presse')).toBe(false)
  })
})

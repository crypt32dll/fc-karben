import { describe, expect, it } from 'vitest'

import { normalizePostgresUrl } from '../../src/lib/postgres-url'

describe('normalizePostgresUrl', () => {
  it('upgrades require to verify-full', () => {
    expect(normalizePostgresUrl('postgresql://u:p@h/db?sslmode=require')).toBe(
      'postgresql://u:p@h/db?sslmode=verify-full',
    )
  })

  it('adds verify-full when sslmode missing', () => {
    expect(normalizePostgresUrl('postgresql://u:p@h/db')).toBe(
      'postgresql://u:p@h/db?sslmode=verify-full',
    )
  })

  it('leaves verify-full unchanged', () => {
    const url = 'postgresql://u:p@h/db?sslmode=verify-full'
    expect(normalizePostgresUrl(url)).toBe(url)
  })
})

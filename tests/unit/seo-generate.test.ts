import { describe, expect, it } from 'vitest'

import {
  generateSeoDescription,
  generateSeoTitle,
  getPublicSiteURL,
  truncateSeoDescription,
} from '../../src/lib/seo/generate'

describe('SEO generate helpers', () => {
  it('builds title template', () => {
    expect(generateSeoTitle({ title: 'Vorstand' })).toBe('Vorstand')
  })

  it('uses excerpt for description when present', () => {
    const longEnough =
      'Kurztext aus dem Excerpt-Feld mit genug Zeichen für das SEO Soft-Minimum von siebzig.'
    expect(longEnough.length).toBeGreaterThanOrEqual(70)
    expect(
      generateSeoDescription({
        title: 'Seite',
        excerpt: longEnough,
      }),
    ).toBe(longEnough)
  })

  it('pads short excerpts to soft SEO length', () => {
    const out = generateSeoDescription({
      title: 'Seite',
      excerpt: 'Kurztext aus dem Excerpt-Feld.',
    })
    expect(out.length).toBeGreaterThanOrEqual(70)
    expect(out).toContain('Kurztext aus dem Excerpt-Feld.')
  })

  it('falls back to Lexical plaintext for pages without excerpt', () => {
    const desc = generateSeoDescription({
      title: 'Vereinssatzung',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Die Satzung regelt den Verein.', version: 1 }],
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
    })
    expect(desc).toContain('Satzung')
  })

  it('never returns empty description', () => {
    expect(generateSeoDescription({ title: 'Nur Titel' }).length).toBeGreaterThan(10)
  })

  it('truncates long descriptions to plugin max (150)', () => {
    const long = 'Wort '.repeat(80)
    const out = truncateSeoDescription(long)
    expect(out.length).toBeLessThanOrEqual(150)
    expect(out.endsWith('…')).toBe(true)
  })

  it('never exceeds 150 even for excerpt longer than the limit', () => {
    const excerpt = 'x'.repeat(200)
    expect(generateSeoDescription({ title: 'T', excerpt }).length).toBeLessThanOrEqual(150)
  })

  it('uses Vercel production host over NEXT_PUBLIC_SITE_URL', () => {
    const prevSite = process.env.NEXT_PUBLIC_SITE_URL
    const prevVercel = process.env.VERCEL
    const prevEnv = process.env.VERCEL_ENV
    const prevProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
    const prevUrl = process.env.VERCEL_URL
    process.env.VERCEL = '1'
    process.env.VERCEL_ENV = 'production'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'fc-karben.de'
    process.env.VERCEL_URL = 'fc-karben-git-main.vercel.app'
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
    expect(getPublicSiteURL()).toBe('https://fc-karben.de')
    process.env.NEXT_PUBLIC_SITE_URL = prevSite
    process.env.VERCEL = prevVercel
    process.env.VERCEL_ENV = prevEnv
    process.env.VERCEL_PROJECT_PRODUCTION_URL = prevProd
    process.env.VERCEL_URL = prevUrl
  })

  it('uses VERCEL_URL on preview deployments', () => {
    const prevSite = process.env.NEXT_PUBLIC_SITE_URL
    const prevVercel = process.env.VERCEL
    const prevEnv = process.env.VERCEL_ENV
    const prevProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
    const prevUrl = process.env.VERCEL_URL
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL = '1'
    process.env.VERCEL_ENV = 'preview'
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    process.env.VERCEL_URL = 'fc-karben-git-feat.vercel.app'
    expect(getPublicSiteURL()).toBe('https://fc-karben-git-feat.vercel.app')
    process.env.NEXT_PUBLIC_SITE_URL = prevSite
    process.env.VERCEL = prevVercel
    process.env.VERCEL_ENV = prevEnv
    process.env.VERCEL_PROJECT_PRODUCTION_URL = prevProd
    process.env.VERCEL_URL = prevUrl
  })
})

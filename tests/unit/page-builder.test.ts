import { describe, expect, it } from 'vitest'

import { pathForDoc, postPath, teamPath } from '../../src/lib/club-paths'
import { mapSeo } from '../../src/lib/content-catalog/mappers'
import { defaultHomepageLayout } from '../../src/lib/page-builder/default-homepage-layout'
import { mapPageLayout } from '../../src/lib/page-builder/map-layout'

describe('mapPageLayout (Zod-only adapter)', () => {
  it('maps a hero block and drops unknown types', () => {
    const layout = mapPageLayout([
      {
        id: '1',
        blockType: 'hero',
        title: 'Mit Leidenschaft',
        eyebrow: 'Gruppenliga',
        primaryCta: { label: 'Mitglied', href: '/verein/mitglied-werden' },
      },
      { id: 'x', blockType: 'notARealBlock', title: 'nope' },
      { id: '2', blockType: 'cta', heading: 'Join', buttonLabel: 'Go', buttonHref: '/x' },
    ])

    expect(layout).toHaveLength(2)
    expect(layout[0]).toMatchObject({ blockType: 'hero', title: 'Mit Leidenschaft' })
    expect(layout[1]).toMatchObject({ blockType: 'cta', buttonHref: '/x' })
  })

  it('extracts media urls for image and downloads via Zod transform', () => {
    const layout = mapPageLayout([
      {
        blockType: 'image',
        image: { url: 'https://cdn.example/a.jpg', alt: 'Team' },
        caption: 'Foto',
      },
      {
        blockType: 'downloads',
        heading: 'Formulare',
        files: [{ label: 'Antrag', file: { url: 'https://cdn.example/a.pdf' } }],
      },
    ])

    expect(layout[0]).toMatchObject({
      blockType: 'image',
      imageUrl: 'https://cdn.example/a.jpg',
      caption: 'Foto',
    })
    expect(layout[1]).toMatchObject({
      blockType: 'downloads',
      files: [{ label: 'Antrag', url: 'https://cdn.example/a.pdf' }],
    })
  })
})

describe('mapSeo Zod', () => {
  it('maps plugin meta.title to CatalogSeo.metaTitle', () => {
    expect(
      mapSeo({
        title: 'Presse',
        description: 'News',
        image: { url: 'https://cdn.example/og.jpg' },
        noIndex: true,
      }),
    ).toEqual({
      metaTitle: 'Presse',
      metaDescription: 'News',
      noIndex: true,
      noFollow: false,
      canonicalOverride: null,
      ogImageUrl: 'https://cdn.example/og.jpg',
    })
  })
})

describe('clubPaths', () => {
  it('builds canonical paths', () => {
    expect(postPath('spielbericht')).toBe('/presse/spielbericht')
    expect(teamPath('1-mannschaft')).toBe('/1-mannschaft')
    expect(pathForDoc({ relationTo: 'posts', slug: 'x' })).toBe('/presse/x')
    expect(pathForDoc({ path: '/verein/vorstand' })).toBe('/verein/vorstand')
  })
})

describe('defaultHomepageLayout', () => {
  it('produces a full block stack from hero fields', () => {
    const layout = defaultHomepageLayout({
      heroTitle: 'Test Hero',
      vereinIntro: 'Intro',
    })
    expect(layout[0]).toMatchObject({ blockType: 'hero', title: 'Test Hero' })
    expect(layout.map((b) => b.blockType)).toEqual([
      'hero',
      'scoreboard',
      'teamGrid',
      'postList',
      'socialGrid',
      'cta',
      'sponsors',
    ])
  })
})

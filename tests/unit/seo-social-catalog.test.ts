import { describe, expect, it } from 'vitest'
import { mapPostsForList } from '../../src/lib/content-catalog/mappers'
import { cleanSeoValue, extractSeoFromMeta } from '../../src/lib/migration/wxr'
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildOrganizationJsonLd,
  buildTitle,
  robotsFromFlags,
  toNextMetadata,
} from '../../src/lib/seo/index'
import { selectSocialTiles } from '../../src/lib/social-feed/index'

describe('SeoSurface', () => {
  it('builds title template', () => {
    expect(buildTitle('Presse')).toBe('Presse | FC Karben')
  })

  it('builds absolute urls', () => {
    expect(absoluteUrl('/presse', { metadataBase: 'https://fc-karben.de' })).toBe(
      'https://fc-karben.de/presse',
    )
  })

  it('builds organization json-ld', () => {
    const json = buildOrganizationJsonLd({
      name: 'FC Karben e.V.',
      url: 'https://fc-karben.de',
      foundingDate: 2015,
    })
    expect(json['@type']).toBe('SportsOrganization')
  })

  it('article author is organization not person', () => {
    const json = buildArticleJsonLd({
      headline: 'Test',
      url: 'https://fc-karben.de/presse/test',
      publisherName: 'FC Karben',
    })
    expect(json.author).toEqual({ '@type': 'Organization', name: 'FC Karben' })
  })

  it('robots flags', () => {
    expect(robotsFromFlags(true, false)).toEqual({ index: false, follow: true })
  })

  it('toNextMetadata is the exclusive metadata factory', () => {
    const meta = toNextMetadata(
      { title: 'Presse', path: '/presse', description: 'News' },
      { metadataBase: 'https://fc-karben.de' },
    )
    expect(meta.title).toBe('Presse | FC Karben')
    expect(meta.alternates?.canonical).toBe('https://fc-karben.de/presse')
  })
})

describe('SocialFeed', () => {
  it('sorts and limits tiles', () => {
    const tiles = selectSocialTiles(
      [
        { id: '2', sortOrder: 2, imageUrl: 'b.jpg' },
        { id: '1', sortOrder: 1, imageUrl: 'a.jpg' },
        { id: '3', sortOrder: 3, url: 'https://ig' },
      ],
      2,
    )
    expect(tiles.map((t) => t.id)).toEqual(['1', '2'])
  })
})

describe('ContentCatalog', () => {
  it('maps posts to presse paths', () => {
    const posts = mapPostsForList([{ id: 1, title: 'A', slug: 'a' }])
    expect(posts[0].path).toBe('/presse/a')
  })
})

describe('MigrationPipeline SEO', () => {
  it('keeps real AIOSEO descriptions', () => {
    expect(
      cleanSeoValue('1. Mannschaft FC Karben, Tabelle, Termine, Kontakt, Spielberichte'),
    ).toBeTruthy()
  })

  it('drops placeholder SEO templates', () => {
    expect(cleanSeoValue('%%title%% %%sep%% %%sitename%%')).toBeUndefined()
    expect(cleanSeoValue('#post_title Vereinsheim #separator_sa #site_title')).toBeUndefined()
    expect(cleanSeoValue('#post_content')).toBeUndefined()
  })

  it('extracts AIOSEO over empty yoast', () => {
    const seo = extractSeoFromMeta({
      _aioseo_description: 'Der FC Karben stellt die Weichen neu',
      _yoast_wpseo_metadesc: '%%title%%',
    })
    expect(seo.metaDescription).toContain('FC Karben')
  })
})

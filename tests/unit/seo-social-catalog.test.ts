import { describe, expect, it } from 'vitest'
import { mapPostsForList } from '../../src/lib/content-catalog/mappers'
import { cleanSeoValue, extractSeoFromMeta } from '../../src/lib/migration/wxr'
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildTitle,
  buildWebSiteJsonLd,
  normalizePageTitle,
  robotsFromFlags,
  toNextMetadata,
} from '../../src/lib/seo/index'
import {
  mapFeedframerPostToTile,
  resolveSocialTiles,
  selectSocialTiles,
} from '../../src/lib/social-feed/index'

describe('SeoSurface', () => {
  it('normalizes titles that already include the brand', () => {
    expect(normalizePageTitle('Vorstand | FC Karben')).toBe('Vorstand')
    expect(normalizePageTitle('Vorstand | FC Karben | FC Karben')).toBe('Vorstand')
  })

  it('builds absolute title once', () => {
    expect(buildTitle('Presse')).toBe('Presse | FC Karben')
    expect(buildTitle('Presse | FC Karben')).toBe('Presse | FC Karben')
  })

  it('toNextMetadata uses page segment (layout template adds brand)', () => {
    const meta = toNextMetadata(
      { title: 'Vorstand | FC Karben', path: '/verein/vorstand', description: 'x'.repeat(80) },
      { metadataBase: 'https://fc-karben.de' },
    )
    expect(meta.title).toBe('Vorstand')
    expect(meta.openGraph?.images).toBeTruthy()
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
      address: 'Karl-Liebknecht-Str. 48, 61184 Karben',
    })
    expect(json['@type']).toBe('SportsOrganization')
    expect(json.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Karl-Liebknecht-Str. 48',
      postalCode: '61184',
      addressLocality: 'Karben',
      addressCountry: 'DE',
    })
  })

  it('builds article json-ld with publisher logo and section', () => {
    const json = buildArticleJsonLd({
      headline: 'Testbericht',
      url: 'https://fc-karben.de/presse/test',
      publisherName: 'FC Karben e.V.',
      publisherLogoUrl: 'https://fc-karben.de/logo.png',
      articleSection: 'Spielberichte',
      description: 'Kurztext',
    })
    expect(json['@type']).toBe('NewsArticle')
    expect(json.articleSection).toBe('Spielberichte')
    expect(json.publisher).toMatchObject({
      '@type': 'Organization',
      logo: { '@type': 'ImageObject', url: 'https://fc-karben.de/logo.png' },
    })
  })

  it('builds website search action and breadcrumbs', () => {
    const site = buildWebSiteJsonLd({
      name: 'FC Karben',
      url: 'https://fc-karben.de',
      searchUrlTemplate: 'https://fc-karben.de/suche?q={search_term_string}',
    })
    expect(site.potentialAction).toMatchObject({
      '@type': 'SearchAction',
      'query-input': 'required name=search_term_string',
    })

    const crumbs = buildBreadcrumbJsonLd(
      [
        { name: 'Presse', path: '/presse' },
        { name: 'Bericht', path: '/presse/bericht' },
      ],
      { metadataBase: 'https://fc-karben.de' },
    )
    expect(crumbs.itemListElement).toHaveLength(2)
    expect(crumbs.itemListElement[0]).toMatchObject({
      position: 1,
      item: 'https://fc-karben.de/presse',
    })
  })

  it('article author is organization not person', () => {
    const json = buildArticleJsonLd({
      headline: 'Test',
      url: 'https://fc-karben.de/presse/test',
      publisherName: 'FC Karben',
    })
    expect(json.author).toEqual({ '@type': 'Organization', name: 'FC Karben' })
  })

  it('robots flags respect staging gate', () => {
    const prev = process.env.ALLOW_SEARCH_INDEXING
    process.env.ALLOW_SEARCH_INDEXING = 'true'
    expect(robotsFromFlags(true, false)).toEqual({ index: false, follow: true })
    expect(robotsFromFlags(false, false)).toEqual({ index: true, follow: true })
    delete process.env.ALLOW_SEARCH_INDEXING
    expect(robotsFromFlags(false, false)).toEqual({ index: false, follow: false })
    process.env.ALLOW_SEARCH_INDEXING = prev
  })

  it('toNextMetadata is the exclusive metadata factory', () => {
    const meta = toNextMetadata(
      { title: 'Presse', path: '/presse', description: 'News' },
      { metadataBase: 'https://fc-karben.de' },
    )
    expect(meta.title).toBe('Presse')
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

  it('maps Feedframer posts to tiles (prefers thumbnail for video)', () => {
    const image = mapFeedframerPostToTile(
      {
        id: 'p1',
        caption: 'Tor!',
        mediaType: 'IMAGE',
        mediaUrl: 'https://cdn.example/a.jpg',
        thumbnailUrl: null,
        permalink: 'https://instagram.com/p/1',
        timestamp: '2026-01-01T00:00:00Z',
        likeCount: 1,
        commentsCount: 0,
      },
      0,
    )
    expect(image).toMatchObject({
      id: 'ff-p1',
      imageUrl: 'https://cdn.example/a.jpg',
      url: 'https://instagram.com/p/1',
      source: 'feedframer',
    })

    const video = mapFeedframerPostToTile(
      {
        id: 'p2',
        caption: null,
        mediaType: 'REELS',
        mediaUrl: 'https://cdn.example/v.mp4',
        thumbnailUrl: 'https://cdn.example/thumb.jpg',
        permalink: 'https://instagram.com/p/2',
        timestamp: '2026-01-01T00:00:00Z',
        likeCount: null,
        commentsCount: null,
      },
      1,
    )
    expect(video?.imageUrl).toBe('https://cdn.example/thumb.jpg')
  })

  it('resolveSocialTiles falls back to CMS when live feed empty', async () => {
    const tiles = await resolveSocialTiles({
      cmsTiles: async () => [{ id: 'cms-1', sortOrder: 0, imageUrl: 'cms.jpg', source: 'cms' }],
    })
    expect(tiles[0]?.id).toBe('cms-1')
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

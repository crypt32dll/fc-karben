import { describe, expect, it } from 'vitest'

import {
  imgsToLinks,
  prepareHtmlForLexical,
  rewriteImgSrcs,
} from '../../src/lib/migration/html-to-lexical'

describe('html-to-lexical image rewrite', () => {
  it('converts bare imgs to links', () => {
    const out = imgsToLinks(
      '<p>Hi <img src="https://fc-karben.de/wp-content/uploads/a.jpg" alt="x"></p>',
    )
    expect(out).not.toMatch(/<img/i)
    expect(out).toContain('<a href="https://fc-karben.de/wp-content/uploads/a.jpg">a.jpg</a>')
  })

  it('unwraps linked imgs without nesting anchors', () => {
    const html =
      '<strong><a href="https://fc-karben.de/wp-content/uploads/Kay.jpg"><img src="https://fc-karben.de/wp-content/uploads/Kay-150x150.jpg"></a>Name</strong>'
    const out = imgsToLinks(html)
    expect(out).not.toMatch(/<img/i)
    expect(out).not.toMatch(/<a[^>]*>\s*<p>\s*<a/i)
    expect(out).toContain('Kay-150x150.jpg')
  })

  it('never leaves imgs when a media map is present', () => {
    const map = new Map([
      [
        'https://fc-karben.de/wp-content/uploads/a.jpg',
        'https://fc-karben.de/wp-content/uploads/a.jpg',
      ],
    ])
    const out = rewriteImgSrcs('<img src="https://fc-karben.de/wp-content/uploads/a.jpg">', map)
    expect(out).not.toMatch(/<img/i)
    expect(out).toContain('href="https://fc-karben.de/wp-content/uploads/a.jpg"')
  })

  it('prepareHtmlForLexical with map still strips imgs', () => {
    const map = new Map([
      [
        'https://fc-karben.de/wp-content/uploads/a.jpg',
        'https://fc-karben.de/wp-content/uploads/a.jpg',
      ],
    ])
    const out = prepareHtmlForLexical(
      '<p><img src="https://fc-karben.de/wp-content/uploads/a.jpg"></p>',
      map,
    )
    expect(out).not.toMatch(/<img/i)
  })
})

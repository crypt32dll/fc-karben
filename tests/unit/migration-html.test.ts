import { describe, expect, it } from 'vitest'

import {
  canonicalizePageSlug,
  normalizeWpHtml,
  prepareHtmlForLexical,
} from '../../src/lib/migration/html-to-lexical'
import { isAllowedMediaHost } from '../../src/lib/migration/media-loader'

describe('html-to-lexical normalizer', () => {
  it('converts tabby shortcodes to headings', () => {
    const html = normalizeWpHtml('[tabby title="Team"]Kader[/tabbyending]')
    expect(html).toContain('<h3>Team</h3>')
    expect(html).not.toContain('[tabby')
  })

  it('strips fussball.de widget scripts', () => {
    const html = normalizeWpHtml(
      '<script src="https://www.fussball.de/widgets.js"></script><p>Hallo</p>',
    )
    expect(html).not.toContain('script')
    expect(html).toContain('Hallo')
  })

  it('canonicalizes g-jugend to alte-herren', () => {
    expect(canonicalizePageSlug('g-jugend')).toEqual({
      slug: 'alte-herren',
      pathHint: '/alte-herren',
    })
  })

  it('rewrites known img srcs', () => {
    const map = new Map([
      ['https://fc-karben.de/wp-content/uploads/a.jpg', '/api/media/file/a.jpg'],
    ])
    const out = prepareHtmlForLexical(
      '<img src="https://fc-karben.de/wp-content/uploads/a.jpg" alt="x">',
      map,
    )
    expect(out).toContain('/api/media/file/a.jpg')
  })
})

describe('media-loader allowlist', () => {
  it('allows club hosts', () => {
    expect(isAllowedMediaHost('https://fc-karben.de/wp-content/uploads/x.jpg')).toBe(true)
    expect(isAllowedMediaHost('https://www.fc-karben.de/a.png')).toBe(true)
  })

  it('rejects unknown hosts', () => {
    expect(isAllowedMediaHost('https://evil.example/x.jpg')).toBe(false)
  })
})

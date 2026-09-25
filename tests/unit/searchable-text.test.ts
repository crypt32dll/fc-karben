import { describe, expect, it } from 'vitest'

import { searchablePlainText } from '../../src/lib/search/searchable-text'

const lexical = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
})

describe('searchablePlainText', () => {
  it('extracts Lexical body text', () => {
    const text = searchablePlainText({
      content: lexical('Der FC Karben siegt im Derby.'),
    })
    expect(text).toContain('Der FC Karben siegt im Derby.')
  })

  it('includes page-builder block copy', () => {
    const text = searchablePlainText({
      layout: [
        {
          blockType: 'richText',
          heading: 'Mitgliedschaft',
          body: lexical('Werde Teil des Vereins.'),
        },
        {
          blockType: 'cta',
          heading: 'Jetzt mitmachen',
          text: 'Anmeldung online',
          buttonLabel: 'Formular öffnen',
        },
      ],
    })
    expect(text).toContain('Mitgliedschaft')
    expect(text).toContain('Werde Teil des Vereins.')
    expect(text).toContain('Jetzt mitmachen')
    expect(text).toContain('Formular öffnen')
  })
})

import { describe, expect, it } from 'vitest'

import {
  embeddedImageFromLexicalLink,
  embeddedImageFromLink,
} from '../../src/lib/rich-text/embedded-image-link'

describe('embeddedImageFromLink', () => {
  it('turns a filename link to a club image into an image', () => {
    expect(
      embeddedImageFromLink(
        'https://fc-karben.de/wp-content/uploads/2026/08/Dritte-Gruener-Rasen-scaled.png',
        'Dritte-Gruener-Rasen-scaled.png',
      ),
    ).toEqual({
      src: 'https://fc-karben.de/wp-content/uploads/2026/08/Dritte-Gruener-Rasen-scaled.png',
      alt: 'Dritte Gruener Rasen',
      width: undefined,
      height: undefined,
    })
  })

  it('reads width and height from a WordPress size suffix', () => {
    expect(
      embeddedImageFromLink(
        'https://fc-karben.de/wp-content/uploads/2026/08/Erste-Gruener-Rasen-1024x683.png',
        'Erste-Gruener-Rasen-1024x683.png',
      ),
    ).toMatchObject({ width: 1024, height: 683, alt: 'Erste Gruener Rasen' })
  })

  it('keeps download links that do not use the filename as their label', () => {
    expect(
      embeddedImageFromLink(
        'https://fc-karben.de/wp-content/uploads/2024/09/Mitgliedsantrag.pdf',
        'Ansehen',
      ),
    ).toBeNull()
    expect(
      embeddedImageFromLink(
        'https://fc-karben.de/wp-content/uploads/2026/08/foto.png',
        'Mannschaftsfoto ansehen',
      ),
    ).toBeNull()
  })

  it('rejects images on other hosts', () => {
    expect(embeddedImageFromLink('https://evil.example/foto.png', 'foto.png')).toBeNull()
  })

  it('reads a lexical link node', () => {
    expect(
      embeddedImageFromLexicalLink({
        type: 'link',
        fields: {
          linkType: 'custom',
          url: 'https://fc-karben.de/wp-content/uploads/2026/08/a37cfd44-3ee6-4ebe-b58d-34db05d221bb-1024x768.jpeg',
        },
        children: [
          {
            type: 'text',
            text: 'a37cfd44-3ee6-4ebe-b58d-34db05d221bb-1024x768.jpeg',
          },
        ],
      }),
    ).toMatchObject({ alt: 'Foto', width: 1024, height: 768 })
  })
})

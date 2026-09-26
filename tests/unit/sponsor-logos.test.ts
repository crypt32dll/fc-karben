import { describe, expect, it } from 'vitest'

import { parseSponsorLogoSections } from '../../src/lib/content-catalog/sponsor-logos'
import type { CatalogBody } from '../../src/lib/content-catalog'

describe('parseSponsorLogoSections', () => {
  it('groups logos under headings into sections', () => {
    const data = {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Hauptsponsoren:' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                fields: {
                  linkType: 'custom',
                  url: 'https://fc-karben.de/wp-content/uploads/2018/01/kk_logo_sp.jpg',
                },
                children: [{ type: 'text', text: 'kk_logo_sp.jpg' }],
              },
            ],
          },
        ],
      },
    } as CatalogBody

    const sections = parseSponsorLogoSections(data)
    expect(sections).toHaveLength(1)
    expect(sections[0].heading).toBe('Hauptsponsoren')
    expect(sections[0].logos).toHaveLength(1)
  })
})

import { describe, expect, it } from 'vitest'

import { pageBlocks } from '../../src/blocks'

describe('Page Builder blocks', () => {
  it('exposes editor blocks for composing pages', () => {
    const slugs = pageBlocks.map((b) => b.slug)
    expect(slugs).toContain('hero')
    expect(slugs).toContain('richText')
    expect(slugs).toContain('cta')
    expect(slugs).toContain('teamGrid')
    expect(slugs).toContain('downloads')
    expect(slugs.length).toBeGreaterThanOrEqual(8)
  })

  it('does not hardcode DEFAULT_TEAMS inside RenderBlocks module', async () => {
    const src = await import('node:fs').then((fs) =>
      fs.readFileSync(
        new URL('../../src/components/blocks/RenderBlocks.tsx', import.meta.url),
        'utf8',
      ),
    )
    expect(src).not.toContain('DEFAULT_TEAMS')
    expect(src).toContain('context.teams')
  })
})

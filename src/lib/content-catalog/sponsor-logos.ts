import type { CatalogBody } from '@/lib/content-catalog'
import {
  type EmbeddedImage,
  embeddedImageFromLexicalLink,
} from '@/lib/rich-text/embedded-image-link'

export type SponsorLogoSection = {
  heading: string
  logos: EmbeddedImage[]
}

/**
 * Walk Lexical body: h3 section titles + consecutive logo filename-links → grid groups.
 * Other nodes are ignored (sponsoren page is logo-only content).
 */
export function parseSponsorLogoSections(
  data: CatalogBody | null | undefined,
): SponsorLogoSection[] {
  const children = data?.root?.children
  if (!Array.isArray(children)) return []

  const sections: SponsorLogoSection[] = []
  let current: SponsorLogoSection = { heading: '', logos: [] }

  const flush = () => {
    if (current.logos.length > 0 || current.heading) {
      sections.push(current)
    }
    current = { heading: '', logos: [] }
  }

  for (const node of children) {
    if (!node || typeof node !== 'object') continue
    const n = node as {
      type?: string
      tag?: string
      children?: unknown[]
    }

    if (n.type === 'heading') {
      flush()
      current.heading = textOf(n).replace(/:\s*$/, '').trim()
      continue
    }

    if (n.type === 'paragraph' && Array.isArray(n.children)) {
      for (const child of n.children) {
        const image = embeddedImageFromLexicalLink(child)
        if (image) current.logos.push(image)
      }
    }
  }
  flush()
  return sections.filter((s) => s.logos.length > 0)
}

function textOf(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const current = node as { text?: unknown; children?: unknown }
  if (typeof current.text === 'string') return current.text
  if (!Array.isArray(current.children)) return ''
  return current.children.map((child) => textOf(child)).join('')
}

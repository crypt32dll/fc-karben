import { lexicalToPlainText } from '../seo/generate'

/** Soft cap so search rows stay lean in Postgres. */
export const SEARCH_BODY_MAX = 40_000

const LAYOUT_TEXT_KEYS = [
  'eyebrow',
  'title',
  'heading',
  'lead',
  'text',
  'caption',
  'buttonLabel',
] as const

type SearchableDoc = {
  content?: unknown
  layout?: unknown
  excerpt?: string | null
  summary?: string | null
}

function layoutToPlainText(layout: unknown): string {
  if (!Array.isArray(layout)) return ''

  const parts: string[] = []
  for (const block of layout) {
    if (!block || typeof block !== 'object') continue
    const b = block as Record<string, unknown>

    for (const key of LAYOUT_TEXT_KEYS) {
      const value = b[key]
      if (typeof value === 'string' && value.trim()) parts.push(value.trim())
    }

    if (b.body) parts.push(lexicalToPlainText(b.body))

    for (const ctaKey of ['primaryCta', 'secondaryCta'] as const) {
      const cta = b[ctaKey]
      if (cta && typeof cta === 'object') {
        const label = (cta as { label?: unknown }).label
        if (typeof label === 'string' && label.trim()) parts.push(label.trim())
      }
    }
  }

  return parts.join(' ')
}

/** Flatten Lexical body + page-builder blocks into searchable plain text. */
export function searchablePlainText(doc: SearchableDoc): string {
  const parts = [
    doc.excerpt?.trim() || '',
    doc.summary?.trim() || '',
    lexicalToPlainText(doc.content),
    layoutToPlainText(doc.layout),
  ]

  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SEARCH_BODY_MAX)
}

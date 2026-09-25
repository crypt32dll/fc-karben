import { lexicalToPlainText, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from './generate'

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type HeadingHit = {
  tag: HeadingTag
  text: string
  source: 'lexical' | 'layout'
}

export type SeoIssueCode =
  | 'missing-meta-title'
  | 'missing-meta-description'
  | 'meta-title-too-long'
  | 'meta-title-too-short'
  | 'meta-description-too-long'
  | 'meta-description-too-short'
  | 'duplicate-h1-in-body'
  | 'multiple-h1-in-body'
  | 'heading-level-skip'
  | 'no-subheadings-long-body'
  | 'empty-title'

export type SeoContentAudit = {
  title: string
  headingCounts: Record<HeadingTag, number>
  headings: HeadingHit[]
  paragraphCount: number
  plainTextLength: number
  issues: SeoIssueCode[]
  suggestions: string[]
}

const HEADING_TAGS: HeadingTag[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/** Bodies longer than this without h2–h5 are flagged as flat. */
export const LONG_BODY_PLAIN_MIN = 400
/** Soft SEO guidance (plugin max still applies for "too long"). */
export const META_TITLE_SOFT_MIN = 20
export const META_DESCRIPTION_SOFT_MIN = 70

type LexicalNode = {
  type?: string
  tag?: string
  children?: LexicalNode[]
  text?: string
  [key: string]: unknown
}

function isHeadingTag(tag: string): tag is HeadingTag {
  return (HEADING_TAGS as string[]).includes(tag)
}

function nodePlainText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.children)) return ''
  return node.children.map(nodePlainText).join('')
}

/** Walk Lexical editor state and collect heading nodes (h1–h6). */
export function collectLexicalHeadings(content: unknown): HeadingHit[] {
  if (!content || typeof content !== 'object') return []
  const root = (content as { root?: LexicalNode }).root
  if (!root) return []

  const hits: HeadingHit[] = []

  const walk = (node: LexicalNode) => {
    if (node.type === 'heading' && typeof node.tag === 'string' && isHeadingTag(node.tag)) {
      const text = nodePlainText(node).replace(/\s+/g, ' ').trim()
      hits.push({ tag: node.tag, text, source: 'lexical' })
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child)
    }
  }

  walk(root)
  return hits
}

export function countLexicalParagraphs(content: unknown): number {
  if (!content || typeof content !== 'object') return 0
  const root = (content as { root?: LexicalNode }).root
  if (!root) return 0

  let count = 0
  const walk = (node: LexicalNode) => {
    if (node.type === 'paragraph') count += 1
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child)
    }
  }
  walk(root)
  return count
}

/** Page-builder block headings count as structural h2 (section titles). */
export function collectLayoutHeadings(layout: unknown): HeadingHit[] {
  if (!Array.isArray(layout)) return []
  const hits: HeadingHit[] = []

  for (const block of layout) {
    if (!block || typeof block !== 'object') continue
    const b = block as Record<string, unknown>
    const heading = typeof b.heading === 'string' ? b.heading.trim() : ''
    if (heading) {
      hits.push({ tag: 'h2', text: heading, source: 'layout' })
    }
    if (b.body) {
      hits.push(...collectLexicalHeadings(b.body))
    }
  }

  return hits
}

function emptyCounts(): Record<HeadingTag, number> {
  return { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 }
}

function detectHeadingSkips(orderedTags: HeadingTag[]): boolean {
  let lastLevel = 1 // page template H1
  for (const tag of orderedTags) {
    const level = Number(tag.slice(1))
    if (level > lastLevel + 1) return true
    lastLevel = Math.max(lastLevel, level)
  }
  return false
}

export function auditSeoContent(input: {
  title?: string | null
  meta?: { title?: string | null; description?: string | null } | null
  content?: unknown
  layout?: unknown
  /** Frontend already renders doc title as <h1> (pages/posts/teams). */
  templateProvidesH1?: boolean
}): SeoContentAudit {
  const title = (input.title || '').trim()
  const metaTitle = input.meta?.title?.trim() || ''
  const metaDescription = input.meta?.description?.trim() || ''
  const templateProvidesH1 = input.templateProvidesH1 !== false

  const headings = [
    ...collectLexicalHeadings(input.content),
    ...collectLayoutHeadings(input.layout),
  ]
  const paragraphCount = countLexicalParagraphs(input.content)
  const plainTextLength = lexicalToPlainText(input.content).length

  const headingCounts = emptyCounts()
  for (const h of headings) headingCounts[h.tag] += 1

  const issues: SeoIssueCode[] = []
  const suggestions: string[] = []

  if (!title) issues.push('empty-title')

  if (!metaTitle) {
    issues.push('missing-meta-title')
    suggestions.push('Meta-Titel setzen (oder pnpm migrate:seo -- --apply).')
  } else if (metaTitle.length > SEO_TITLE_MAX) {
    issues.push('meta-title-too-long')
  } else if (metaTitle.length < META_TITLE_SOFT_MIN) {
    issues.push('meta-title-too-short')
  }

  if (!metaDescription) {
    issues.push('missing-meta-description')
    suggestions.push('Meta-Description setzen (oder pnpm migrate:seo -- --apply).')
  } else if (metaDescription.length > SEO_DESCRIPTION_MAX) {
    issues.push('meta-description-too-long')
  } else if (metaDescription.length < META_DESCRIPTION_SOFT_MIN) {
    issues.push('meta-description-too-short')
  }

  const lexicalH1 = headings.filter((h) => h.tag === 'h1' && h.source === 'lexical')
  if (templateProvidesH1 && lexicalH1.length > 0) {
    issues.push('duplicate-h1-in-body')
    suggestions.push(
      'Body enthält h1, Seite rendert Titel bereits als h1 — Body-Überschriften auf h2–h5 ändern.',
    )
  }
  if (lexicalH1.length > 1) {
    issues.push('multiple-h1-in-body')
  }

  const bodyTags = headings
    .filter((h) => h.source === 'lexical')
    .map((h) => h.tag)
  if (detectHeadingSkips(bodyTags)) {
    issues.push('heading-level-skip')
    suggestions.push('Überschriften-Hierarchie prüfen (kein Sprung z. B. h2 → h4).')
  }

  const subheadCount =
    headingCounts.h2 + headingCounts.h3 + headingCounts.h4 + headingCounts.h5 + headingCounts.h6
  if (plainTextLength >= LONG_BODY_PLAIN_MIN && subheadCount === 0 && paragraphCount >= 4) {
    issues.push('no-subheadings-long-body')
    suggestions.push(
      'Langer Fließtext ohne h2–h5 — Abschnitte mit Zwischenüberschriften strukturieren.',
    )
  }

  return {
    title,
    headingCounts,
    headings,
    paragraphCount,
    plainTextLength,
    issues,
    suggestions,
  }
}

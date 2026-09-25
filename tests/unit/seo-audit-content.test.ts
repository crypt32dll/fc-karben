import { describe, expect, it } from 'vitest'

import {
  auditSeoContent,
  collectLexicalHeadings,
  LONG_BODY_PLAIN_MIN,
} from '../../src/lib/seo/audit-content'

function lexicalDoc(
  children: Array<Record<string, unknown>>,
): { root: { type: 'root'; children: unknown[] } } {
  return { root: { type: 'root', children } }
}

function heading(tag: string, text: string) {
  return {
    type: 'heading',
    tag,
    children: [{ type: 'text', text, version: 1 }],
    version: 1,
  }
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, version: 1 }],
    version: 1,
  }
}

describe('seo audit-content', () => {
  it('collects lexical headings', () => {
    const hits = collectLexicalHeadings(
      lexicalDoc([heading('h2', 'Abschnitt'), heading('h3', 'Detail')]),
    )
    expect(hits.map((h) => h.tag)).toEqual(['h2', 'h3'])
    expect(hits[0].text).toBe('Abschnitt')
  })

  it('flags duplicate h1 when template already provides one', () => {
    const audit = auditSeoContent({
      title: 'Beitragsstruktur',
      meta: { title: 'Beitragsstruktur | FC Karben', description: 'x'.repeat(80) },
      content: lexicalDoc([heading('h1', 'Nochmal Titel'), paragraph('Text')]),
      templateProvidesH1: true,
    })
    expect(audit.issues).toContain('duplicate-h1-in-body')
  })

  it('flags long flat bodies without subheadings', () => {
    const body = 'Wort '.repeat(Math.ceil(LONG_BODY_PLAIN_MIN / 5))
    const audit = auditSeoContent({
      title: 'Lang',
      meta: { title: 'Lang genug für SEO Titel', description: 'y'.repeat(80) },
      content: lexicalDoc([
        paragraph(body),
        paragraph(body),
        paragraph(body),
        paragraph(body),
      ]),
    })
    expect(audit.issues).toContain('no-subheadings-long-body')
    expect(audit.suggestions.some((s) => s.includes('h2'))).toBe(true)
  })

  it('flags heading level skips', () => {
    const audit = auditSeoContent({
      title: 'Skip',
      meta: { title: 'Skip Titel ist lang genug', description: 'z'.repeat(80) },
      content: lexicalDoc([heading('h2', 'A'), heading('h4', 'B')]),
    })
    expect(audit.issues).toContain('heading-level-skip')
  })

  it('flags missing meta', () => {
    const audit = auditSeoContent({
      title: 'Ohne Meta',
      content: lexicalDoc([paragraph('Kurz')]),
    })
    expect(audit.issues).toEqual(
      expect.arrayContaining(['missing-meta-title', 'missing-meta-description']),
    )
  })
})

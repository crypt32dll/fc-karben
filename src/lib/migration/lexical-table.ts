/**
 * Build Lexical table nodes for Payload rich text (EXPERIMENTAL_TableFeature).
 * headerState: 0 = td, 1 = row header (th).
 */

type LexicalText = {
  type: 'text'
  text: string
  format: number
  mode: 'normal'
  style: string
  detail: number
  version: 1
}

type LexicalParagraph = {
  type: 'paragraph'
  children: LexicalText[]
  format: string
  indent: number
  version: 1
  direction: 'ltr' | null
  textFormat: number
  textStyle: string
}

type LexicalTableCell = {
  type: 'tablecell'
  children: LexicalParagraph[]
  headerState: number
  colSpan: number
  rowSpan: number
  backgroundColor: null
  format: string
  indent: number
  version: 1
  direction: 'ltr' | null
}

type LexicalTableRow = {
  type: 'tablerow'
  children: LexicalTableCell[]
  format: string
  indent: number
  version: 1
  direction: 'ltr' | null
}

export type LexicalTable = {
  type: 'table'
  children: LexicalTableRow[]
  format: string
  indent: number
  version: 1
  direction: 'ltr' | null
}

function textNode(text: string, bold = false): LexicalText {
  return {
    type: 'text',
    text,
    format: bold ? 1 : 0,
    mode: 'normal',
    style: '',
    detail: 0,
    version: 1,
  }
}

function paragraph(text: string, bold = false): LexicalParagraph {
  return {
    type: 'paragraph',
    children: text ? [textNode(text, bold)] : [],
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    textFormat: bold ? 1 : 0,
    textStyle: '',
  }
}

function cell(text: string, header = false): LexicalTableCell {
  return {
    type: 'tablecell',
    children: [paragraph(text)],
    headerState: header ? 1 : 0,
    colSpan: 1,
    rowSpan: 1,
    backgroundColor: null,
    format: '',
    indent: 0,
    version: 1,
    direction: null,
  }
}

/** rows[0] treated as header when `headerRow` is true. */
export function lexicalTable(rows: string[][], headerRow = true): LexicalTable {
  return {
    type: 'table',
    children: rows.map((row, rowIndex) => ({
      type: 'tablerow' as const,
      children: row.map((value) => cell(value, headerRow && rowIndex === 0)),
      format: '',
      indent: 0,
      version: 1 as const,
      direction: null,
    })),
    format: '',
    indent: 0,
    version: 1,
    direction: null,
  }
}

export function lexicalParagraph(text: string, bold = false): LexicalParagraph {
  return paragraph(text, bold)
}

/** Very small HTML table extractor — enough for WP beitragsstruktur markup. */
export function parseSimpleHtmlTable(html: string): string[][] | null {
  const tableMatch = html.match(/<table[\s\S]*?<\/table>/i)
  if (!tableMatch) return null
  const rows: string[][] = []
  const trRe = /<tr[\s\S]*?<\/tr>/gi
  let tr: RegExpExecArray | null
  while ((tr = trRe.exec(tableMatch[0]))) {
    const cells: string[] = []
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
    let c: RegExpExecArray | null
    while ((c = cellRe.exec(tr[0]))) {
      cells.push(
        c[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
    }
    if (cells.length) rows.push(cells)
  }
  return rows.length ? rows : null
}

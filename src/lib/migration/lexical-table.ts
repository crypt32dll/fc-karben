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

const CLUB_ORIGIN = 'https://fc-karben.de'

export function absoluteClubMediaUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href
  const path = href.startsWith('/') ? href : `/${href}`
  return `${CLUB_ORIGIN}${path}`
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tableCellHtmlRows(html: string): string[][] | null {
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
      cells.push(c[1])
    }
    if (cells.length) rows.push(cells)
  }
  return rows.length ? rows : null
}

/** Very small HTML table extractor — enough for WP beitragsstruktur markup. */
export function parseSimpleHtmlTable(html: string): string[][] | null {
  const raw = tableCellHtmlRows(html)
  if (!raw) return null
  return raw.map((row) => row.map(stripTags))
}

export type RichTableTextCell = { text: string; bold?: boolean }
export type RichTableLinkCell = { label: string; href: string; newTab?: boolean }
export type RichTableCell = RichTableTextCell | RichTableLinkCell

function isLinkCell(cell: RichTableCell): cell is RichTableLinkCell {
  return 'href' in cell && 'label' in cell
}

/** Parse WP table cells preserving bold text and anchor links. */
export function parseHtmlTableCells(html: string): RichTableCell[][] | null {
  const raw = tableCellHtmlRows(html)
  if (!raw) return null
  return raw.map((row) =>
    row.map((cellHtml): RichTableCell => {
      const linkMatch = cellHtml.match(/<a\s+([^>]+)>([\s\S]*?)<\/a>/i)
      if (linkMatch) {
        const attrs = linkMatch[1]
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/i)
        const href = hrefMatch ? absoluteClubMediaUrl(hrefMatch[1]) : CLUB_ORIGIN
        return {
          label: stripTags(linkMatch[2]),
          href,
          newTab: true,
        }
      }
      const bold = /<(strong|b)\b/i.test(cellHtml)
      return { text: stripTags(cellHtml), bold }
    }),
  )
}

type LexicalLink = {
  type: 'link'
  children: LexicalText[]
  fields: {
    linkType: 'custom'
    url: string
    newTab: boolean
  }
  format: string
  indent: number
  version: 3
  direction: 'ltr' | null
  id?: string
}

type LexicalInline = LexicalText | LexicalLink

type LexicalRichParagraph = Omit<LexicalParagraph, 'children'> & {
  children: LexicalInline[]
}

type LexicalRichTableCell = Omit<LexicalTableCell, 'children'> & {
  children: LexicalRichParagraph[]
}

type LexicalRichTableRow = Omit<LexicalTableRow, 'children'> & {
  children: LexicalRichTableCell[]
}

export type LexicalRichTable = Omit<LexicalTable, 'children'> & {
  children: LexicalRichTableRow[]
}

function richParagraph(cell: RichTableCell): LexicalRichParagraph {
  if (isLinkCell(cell)) {
    const link: LexicalLink = {
      type: 'link',
      children: [textNode(cell.label)],
      fields: {
        linkType: 'custom',
        url: cell.href,
        newTab: cell.newTab ?? true,
      },
      format: '',
      indent: 0,
      version: 3,
      direction: null,
    }
    return {
      type: 'paragraph',
      children: [link],
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      textFormat: 0,
      textStyle: '',
    }
  }
  return {
    type: 'paragraph',
    children: cell.text ? [textNode(cell.text, Boolean(cell.bold))] : [],
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    textFormat: cell.bold ? 1 : 0,
    textStyle: '',
  }
}

function richCell(value: RichTableCell, header = false): LexicalRichTableCell {
  return {
    type: 'tablecell',
    children: [richParagraph(value)],
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

/** Table with text and/or link cells (Formulare downloads). */
export function lexicalTableRich(rows: RichTableCell[][], headerRow = true): LexicalRichTable {
  return {
    type: 'table',
    children: rows.map((row, rowIndex) => ({
      type: 'tablerow' as const,
      children: row.map((value) => richCell(value, headerRow && rowIndex === 0)),
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

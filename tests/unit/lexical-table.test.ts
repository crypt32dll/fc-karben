import { describe, expect, it } from 'vitest'

import {
  absoluteClubMediaUrl,
  lexicalTable,
  lexicalTableRich,
  parseHtmlTableCells,
  parseSimpleHtmlTable,
} from '../../src/lib/migration/lexical-table'

describe('lexical-table', () => {
  it('parses a simple HTML table', () => {
    const rows = parseSimpleHtmlTable(`
      <table><tbody>
        <tr><th>A</th><th>B</th></tr>
        <tr><td>1</td><td>2</td></tr>
      </tbody></table>
    `)
    expect(rows).toEqual([
      ['A', 'B'],
      ['1', '2'],
    ])
  })

  it('builds Lexical table nodes with header row', () => {
    const table = lexicalTable(
      [
        ['Berechnungsart', 'pro Monat'],
        ['Rentner', '4,50 €'],
      ],
      true,
    )
    expect(table.type).toBe('table')
    expect(table.children).toHaveLength(2)
    expect(table.children[0].children[0].headerState).toBe(1)
    expect(table.children[1].children[0].headerState).toBe(0)
    expect(table.children[1].children[1].children[0].children[0].text).toBe('4,50 €')
  })

  it('parses cells with links and absolute media URLs', () => {
    const rows = parseHtmlTableCells(`
      <table><tr>
        <td><strong>Antrag:</strong></td>
        <td><a href="/wp-content/uploads/x.pdf">Ansehen</a></td>
      </tr></table>
    `)
    expect(rows).toHaveLength(1)
    expect(rows![0][0]).toEqual({ text: 'Antrag:', bold: true })
    expect(rows![0][1]).toEqual({
      label: 'Ansehen',
      href: 'https://fc-karben.de/wp-content/uploads/x.pdf',
      newTab: true,
    })
    expect(absoluteClubMediaUrl('/a.pdf')).toBe('https://fc-karben.de/a.pdf')
  })

  it('builds rich table with link nodes', () => {
    const table = lexicalTableRich(
      [
        [
          { text: 'Antrag', bold: true },
          { label: 'Download', href: 'https://example.com/a.pdf' },
        ],
      ],
      false,
    )
    const link = table.children[0].children[1].children[0].children[0]
    expect(link.type).toBe('link')
    expect((link as { fields: { url: string } }).fields.url).toBe('https://example.com/a.pdf')
  })
})

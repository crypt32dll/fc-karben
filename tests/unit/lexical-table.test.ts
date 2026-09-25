import { describe, expect, it } from 'vitest'

import {
  lexicalTable,
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
})

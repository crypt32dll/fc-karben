/**
 * Restore Formulare download table with absolute WordPress media URLs.
 *
 *   pnpm exec tsx --env-file=.env scripts/fix-formulare-table.ts
 */
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

import { getPayload } from 'payload'

import {
  lexicalParagraph,
  lexicalTableRich,
  parseHtmlTableCells,
} from '../src/lib/migration/lexical-table'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const MEDIA = 'https://fc-karben.de/wp-content/uploads'

/** Absolute HTTPS links so downloads work on Vercel preview/production hosts. */
const FORMULARE_TABLE = `
<table><tbody>
<tr>
  <td><strong>Antrag Vereinsmitgliedschaft:</strong></td>
  <td><a href="${MEDIA}/2024/09/Mitgliedsantrag-09-2024.pdf" target="_blank" rel="noopener">Ansehen</a></td>
  <td><a href="${MEDIA}/2024/09/Mitgliedsantrag-09-2024.pdf" download>Herunterladen</a></td>
</tr>
<tr>
  <td><strong>Antrag Spielerpass:</strong></td>
  <td><a href="${MEDIA}/2017/09/antrag_spielerpass_hfv.doc" target="_blank" rel="noopener">Ansehen</a></td>
  <td><a href="${MEDIA}/2017/09/antrag_spielerpass_hfv.doc" download>Herunterladen</a></td>
</tr>
<tr>
  <td><strong>Antrag Fördermitgliedschaft:</strong></td>
  <td><a href="${MEDIA}/2024/06/Foerdermitgliedsantrag.pdf" target="_blank" rel="noopener">Ansehen</a></td>
  <td><a href="${MEDIA}/2024/06/Foerdermitgliedsantrag.pdf" download>Herunterladen</a></td>
</tr>
<tr>
  <td><strong>Abmeldung Spieler:</strong></td>
  <td><a href="${MEDIA}/2017/09/abmeldung_spieler.doc" target="_blank" rel="noopener">Ansehen</a></td>
  <td><a href="${MEDIA}/2017/09/abmeldung_spieler.doc" download>Herunterladen</a></td>
</tr>
<tr>
  <td><strong>Abmeldung durch Verein:</strong></td>
  <td><a href="${MEDIA}/2017/09/abmeldung_durch_verein_hfv.pdf" target="_blank" rel="noopener">Ansehen</a></td>
  <td><a href="${MEDIA}/2017/09/abmeldung_durch_verein_hfv.pdf" download>Herunterladen</a></td>
</tr>
</tbody></table>
`.trim()

async function main() {
  const rows = parseHtmlTableCells(FORMULARE_TABLE)
  if (!rows?.length) throw new Error('Failed to parse Formulare table')

  const content = {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: [
        lexicalParagraph(
          'Hier findest du die wichtigsten Vereinsformulare zum Ansehen und Download.',
        ),
        lexicalTableRich(rows, false),
      ],
    },
  }

  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'formulare' } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
  if (!doc) throw new Error('Seite formulare not found')

  const updated = await payload.update({
    collection: 'pages',
    id: doc.id,
    data: { content, _status: 'published' },
    draft: false,
    overrideAccess: true,
  })

  const linkCount = JSON.stringify(updated.content).match(/"type":"link"/g)?.length ?? 0
  console.log('Updated formulare', {
    id: doc.id,
    rows: rows.length,
    linkNodes: linkCount,
    sampleHref: rows[0]?.[1] && 'href' in rows[0][1] ? rows[0][1].href : null,
  })
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

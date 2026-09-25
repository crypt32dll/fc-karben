/**
 * Restore Formulare download table after WP→Lexical flattened <table> to paragraphs.
 * Usage: pnpm exec tsx --env-file=.env scripts/fix-formulare-table.ts
 */
import { getPayload } from 'payload'

import {
  lexicalParagraph,
  lexicalTableRich,
  parseHtmlTableCells,
} from '../src/lib/migration/lexical-table'
import config from '../src/payload.config'

const FORMULARE_TABLE = `<table><tbody><tr><td><strong>Antrag Vereinsmitgliedschaft:</strong></td><td><a href="https://fc-karben.de/wp-content/uploads/2024/09/Mitgliedsantrag-09-2024.pdf" target="_blank" rel="noopener" title="">Ansehen</a></td><td><a href="https://fc-karben.de/wp-content/uploads/2024/09/Mitgliedsantrag-09-2024.pdf" title="">Herunterladen</a></td></tr><tr><td><strong>Antrag Spielerpass:</strong></td><td><a href="/wp-content/uploads/2017/09/antrag_spielerpass_hfv.doc" target="_blank" rel="noreferrer noopener">Ansehen</a></td><td><a href="/wp-content/uploads/2017/09/antrag_spielerpass_hfv.doc">Herunterladen</a></td></tr><tr><td><strong>Antrag Fördermitgliedschaft:</strong></td><td><a href="https://fc-karben.de/wp-content/uploads/2024/06/Foerdermitgliedsantrag.pdf" target="_blank" rel="noopener" title="Formulare">Ansehen</a></td><td><a href="/wp-content/uploads/2024/06/Foerdermitgliedsantrag.pdf" title="">Herunterladen</a></td></tr><tr><td><strong>Abmeldung Spieler:</strong></td><td><a href="/wp-content/uploads/2017/09/abmeldung_spieler.doc" target="_blank" rel="noreferrer noopener">Ansehen</a></td><td><a href="/wp-content/uploads/2017/09/abmeldung_spieler.doc">Herunterladen</a></td></tr><tr><td><strong>Abmeldung durch Verein:</strong></td><td><a href="/wp-content/uploads/2017/09/abmeldung_durch_verein_hfv.pdf" target="_blank" rel="noreferrer noopener">Ansehen</a></td><td><a href="/wp-content/uploads/2017/09/abmeldung_durch_verein_hfv.pdf">Herunterladen</a></td></tr></tbody></table>`

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

  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'formulare' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
  if (!doc) throw new Error('Seite formulare not found')

  await payload.update({
    collection: 'pages',
    id: doc.id,
    data: { content },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  console.log('Updated formulare', { id: doc.id, rows: rows.length })
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

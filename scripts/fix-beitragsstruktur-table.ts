/**
 * Restore Beitragsstruktur membership fee table after WP→Lexical flattened <table> to paragraphs.
 * Usage: pnpm exec tsx --env-file=.env scripts/fix-beitragsstruktur-table.ts
 */
import { getPayload } from 'payload'
import {
  lexicalParagraph,
  lexicalTable,
  parseSimpleHtmlTable,
} from '../src/lib/migration/lexical-table'
import config from '../src/payload.config'

const WXR_SNIPPET = `<strong>Übersicht Mitgliedsbeiträge Stand 01. Januar 2023</strong>:
<table>
<tbody>
<tr>
<th style="text-align: left;">Berechnungsart</th>
<th style="text-align: left;">pro Monat</th>
<th style="text-align: left;">pro Jahr</th>
</tr>
<tr>
<td>Rentner</td>
<td>4,50 €</td>
<td>54 €</td>
</tr>
<tr>
<td>Studenten / Auszubildende(*1)</td>
<td>5,50 €</td>
<td>66 €</td>
</tr>
<tr>
<td>Jugendspieler</td>
<td>3,50 €</td>
<td>42 €</td>
</tr>
<tr>
<td>Erwachsene</td>
<td>8,50 €</td>
<td>102 €</td>
</tr>
<tr>
<td>Familie(*2)</td>
<td>16 €</td>
<td>192 €</td>
</tr>
<tr>
<td>Sonderbeitr. Jugendspieler(*3)</td>
<td>–</td>
<td>156 €</td>
</tr>
</tbody>
</table>`

function buildContent() {
  const rows = parseSimpleHtmlTable(WXR_SNIPPET)
  if (!rows) throw new Error('Failed to parse fee table')

  const children = [
    {
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      textFormat: 1,
      textStyle: '',
      children: [
        {
          type: 'text',
          text: 'Übersicht Mitgliedsbeiträge Stand 01. Januar 2023',
          format: 1,
          mode: 'normal',
          style: '',
          detail: 0,
          version: 1,
        },
        {
          type: 'text',
          text: ':',
          format: 0,
          mode: 'normal',
          style: '',
          detail: 0,
          version: 1,
        },
      ],
    },
    lexicalTable(rows, true),
    lexicalParagraph('Ergänzung zur Berechnungsart:', true),
    lexicalParagraph(
      '(*1) bis zur Vollendung des 25. Lebensjahres, danach Erwachsenenbeitrag. Ausnahmen nur gegen Nachweis.',
    ),
    lexicalParagraph('(*2) inkl. aller Kinder bis zur Vollendung des 18. Lebensjahr'),
    lexicalParagraph(
      '(*3) Dieser Betrag wird direkt an die KSV-Jugendabteilung weitergegeben. Die einmalige Aufnahmegebühr für neue Mitglieder beträgt 10€.',
    ),
    { type: 'horizontalrule', version: 1 },
    lexicalParagraph('Hinweise:', true),
    lexicalParagraph(
      'Beginn der Mitgliedschaft / Beitragsberechnung: Als Eintrittsdatum gilt das Datum der Unterschrift. Die Beitragsberechnung beginnt ab dem Eintrittsdatum.',
    ),
    lexicalParagraph(
      'Austritt / Kündigung: Der Austritt aus dem Verein kann nur durch schriftliche Erklärung per Brief oder E-Mail gegenüber dem Vorstand mit einer 14tägigen Frist zu einem Quartalsende erfolgen. Eine Abmeldung vom Spielbetrieb Fußball ist unabhängig vom Vereinsaustritt. Ein Austritt ist in diesem Falle in der hier genannten Form separat zu stellen, ansonsten besteht die Mitgliedschaft im Verein in vollem Umfang weiter.',
    ),
    lexicalParagraph(
      'SEPA-Lastschriftmandat / Pre-Notification / Fälligkeitsavis: Zum Einzug der Mitgliedsbeiträge wird mit dem Zahler ein SEPA-Lastschriftmandat abgeschlossen. Der Beitragseinzug erfolgt zu den unter Einzugstermine genannten Fälligkeiten. Über den regelmäßigen Einzug von Forderungen sowie über Einmalzahlungen wird der Zahler spätestens 2 Tage vor Lastschrifteinzug mittels Avis (Pre-Notification) informiert.',
    ),
    lexicalParagraph('Einzugstermine – Wiederkehrende Zahlungen:', true),
    lexicalParagraph('Einzug jährlich: 05. Januar'),
    lexicalParagraph('Einzug halbjährlich: 05. Januar und 05. Juli'),
    lexicalParagraph(
      'Fällt der genannte Zahltag nicht auf einen Bankarbeitstag, erfolgt der Einzug am unmittelbar darauf folgenden Bankarbeitstag.',
    ),
  ]

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children,
    },
  }
}

async function main() {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'beitragsstruktur' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
  if (!doc) {
    throw new Error('Seite beitragsstruktur not found')
  }

  const content = buildContent()
  await payload.update({
    collection: 'pages',
    id: doc.id,
    data: { content },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  // Revalidate homepage paths for verein page
  const { revalidateCatalogPaths, revalidateCatalogTags } = await import(
    '../src/lib/cache/revalidate'
  )
  const { CACHE_TAGS } = await import('../src/lib/cache/tags')
  revalidateCatalogTags(CACHE_TAGS.pages)
  revalidateCatalogPaths('/verein/beitragsstruktur', '/verein')

  console.log('Updated beitragsstruktur', {
    id: doc.id,
    rows: parseSimpleHtmlTable(WXR_SNIPPET)?.length,
  })
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

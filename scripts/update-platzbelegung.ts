/**
 * Restore Platzbelegung intro copy after WXR stripped the Google Calendar iframe.
 * Usage: pnpm exec tsx scripts/update-platzbelegung.ts
 */
import './load-env.ts'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

const HTML = `
<p>Hier siehst du die aktuelle Belegung des Günter-Reutzel-Sportfelds. Trainingszeiten und Termine stehen im Kalender — bitte vor Nutzung des Platzes kurz prüfen.</p>
`.trim()

async function main() {
  const payload = await getPayload({ config: (await import('../src/payload.config.ts')).default })
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'platzbelegung' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
  if (!doc) throw new Error('Seite platzbelegung not found')

  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const content = convertHTMLToLexical({ editorConfig, html: HTML, JSDOM })

  await payload.update({
    collection: 'pages',
    id: doc.id,
    draft: false,
    overrideAccess: true,
    data: { content },
  })

  console.log('Updated platzbelegung', { id: doc.id })
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

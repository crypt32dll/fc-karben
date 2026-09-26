#!/usr/bin/env tsx
/**
 * Seed Kontakt-Freitext (contactContent) on Teams from the live WordPress copy.
 *
 *   pnpm exec tsx --env-file=.env scripts/seed-team-contacts.ts
 *   pnpm exec tsx --env-file=.env scripts/seed-team-contacts.ts -- --apply
 */
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import { createLogger } from '../src/lib/logger'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const log = createLogger('seed:team-contacts')
const apply = process.argv.includes('--apply')

/** Kontakt HTML per Mannschafts-Slug (from fc-karben.de WXR). */
const CONTACT_HTML: Record<string, string> = {
  '1-mannschaft': `
<p>Trainer: Maik Zinnecker – Telefon: 017630799164 – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a><br>
Co-Trainer: Carsten Borngräber – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a><br>
Team-Manager:</p>
`.trim(),
  '2-mannschaft': `
<p>Trainer: Sebastian Schlosser – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a><br>
Team-Manager: Carl Goronzy – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a></p>
`.trim(),
  '3-mannschaft': `
<p>Trainer: Marc Andre Karaiskos – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a><br>
Co-Trainer: Oliver Podstawa – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a></p>
`.trim(),
  'e-jugend': `
<p>Du hast Interesse am Verein oder an einem Probetraining? Dann nimm gerne Kontakt zu unserer Jugendleitung oder dem E-Jugend Trainerteam auf, um weitere Informationen zu erhalten oder einen Termin zu vereinbaren:</p>
<p>Jugendleiter: Jan Zschemisch – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a> – Mobilnr. 0175 4148464<br>
Trainer: René Levy – Mobilnr. 0176 83302933<br>
Trainer: Joachim Stilger – Mobilnr. 017620970798</p>
`.trim(),
  'alte-herren': `
<p>Trainer: Rochus Stobbe – Tel.: 015142620902 – E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a></p>
`.trim(),
}

async function main() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  let updated = 0
  for (const [slug, html] of Object.entries(CONTACT_HTML)) {
    const found = await payload.find({
      collection: 'teams',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) {
      log.warn('Team missing', { slug })
      continue
    }

    const existing = (doc as { contactContent?: unknown }).contactContent
    if (existing) {
      log.info('Skip — contactContent already set', { slug })
      continue
    }

    const contactContent = convertHTMLToLexical({ editorConfig, html, JSDOM })
    log.info(apply ? 'Set contactContent' : 'Would set contactContent', { slug })
    if (apply) {
      await payload.update({
        collection: 'teams',
        id: doc.id,
        data: {
          contactContent,
          // Drop incomplete placeholder rows that block CMS saves (empty role/name).
          contacts: (
            (doc as { contacts?: Array<{ role?: string | null; name?: string | null }> | null })
              .contacts || []
          ).filter((c) => Boolean(c?.role?.trim() && c?.name?.trim())),
          _status: 'published',
        },
        draft: false,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    }
    updated += 1
  }

  log.info('Done', { apply, updated })
  if (!apply) log.info('Dry-run only. Pass --apply to write.')
  process.exit(0)
}

main().catch((err) => {
  log.error('Failed', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})

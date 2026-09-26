#!/usr/bin/env tsx
/**
 * Audit CMS texts for SEO meta + heading structure (h1–h5).
 * Read-only by default — reports where meta or subheadings need work.
 *
 *   pnpm audit:seo
 *   pnpm audit:seo -- --collections pages,posts,teams
 *   pnpm audit:seo -- --json                        # machine-readable
 *   pnpm audit:seo -- --only-issues                 # skip clean docs
 *
 * Page/post/team templates already render the title as <h1>.
 * Body h1s are flagged as duplicates; long flat bodies suggest h2–h5.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { loadEnvFile } from 'node:process'
import { pathToFileURL } from 'node:url'

import { getPayload, type Payload } from 'payload'

import { createLogger } from '../src/lib/logger'
import {
  auditSeoContent,
  type SeoContentAudit,
  type SeoIssueCode,
} from '../src/lib/seo/audit-content'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const log = createLogger('audit:seo')

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

const asJson = process.argv.includes('--json')
const onlyIssues = process.argv.includes('--only-issues')
const collectionsArg = arg('--collections') || 'pages,posts,teams'
const collections = collectionsArg
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean) as Array<'pages' | 'posts' | 'teams'>

type DocReport = {
  collection: string
  id: string | number
  slug?: string | null
  path?: string | null
  audit: SeoContentAudit
}

function headlineOf(doc: Record<string, unknown>, collection: string): string {
  if (collection === 'teams') return String(doc.name || '')
  return String(doc.title || '')
}

async function auditCollection(
  payload: Payload,
  collection: 'pages' | 'posts' | 'teams',
): Promise<DocReport[]> {
  const reports: DocReport[] = []
  let page = 1

  for (;;) {
    const result = await payload.find({
      collection,
      limit: 50,
      page,
      depth: 0,
      overrideAccess: true,
    })

    for (const raw of result.docs) {
      const doc = raw as Record<string, unknown>
      const audit = auditSeoContent({
        title: headlineOf(doc, collection),
        meta: (doc.meta as { title?: string | null; description?: string | null } | null) || null,
        content: doc.content,
        layout: doc.layout,
        templateProvidesH1: true,
      })

      if (onlyIssues && audit.issues.length === 0) continue

      reports.push({
        collection,
        id: doc.id as string | number,
        slug: typeof doc.slug === 'string' ? doc.slug : null,
        path: typeof doc.path === 'string' ? doc.path : null,
        audit,
      })
    }

    if (page >= result.totalPages) break
    page += 1
  }

  return reports
}

function summarizeIssues(reports: DocReport[]): Record<SeoIssueCode, number> {
  const counts = {} as Record<SeoIssueCode, number>
  for (const r of reports) {
    for (const code of r.audit.issues) {
      counts[code] = (counts[code] || 0) + 1
    }
  }
  return counts
}

function printHuman(reports: DocReport[]) {
  const withIssues = reports.filter((r) => r.audit.issues.length > 0)
  const clean = reports.length - withIssues.length

  log.info('SEO content audit', {
    docs: reports.length,
    withIssues: withIssues.length,
    clean: onlyIssues ? '(hidden)' : clean,
    issueCounts: summarizeIssues(withIssues),
  })

  for (const r of withIssues) {
    const { audit } = r
    const location = r.path || r.slug || String(r.id)
    console.log(`\n[${r.collection}] ${location} — "${audit.title || '(ohne Titel)'}"`)
    console.log(
      `  headings: h1=${audit.headingCounts.h1} h2=${audit.headingCounts.h2} h3=${audit.headingCounts.h3} h4=${audit.headingCounts.h4} h5=${audit.headingCounts.h5} | paragraphs=${audit.paragraphCount} | bodyChars=${audit.plainTextLength}`,
    )
    console.log(`  issues: ${audit.issues.join(', ')}`)
    for (const s of audit.suggestions) {
      console.log(`  → ${s}`)
    }
    if (audit.headings.length) {
      for (const h of audit.headings) {
        console.log(`  · ${h.tag} (${h.source}): ${h.text.slice(0, 80)}`)
      }
    }
  }

  if (withIssues.length === 0) {
    console.log('\nKeine SEO-/Überschriften-Probleme gefunden.')
  } else {
    console.log(
      `\n${withIssues.length} Dokument(e) mit Hinweisen. Meta fixen: pnpm migrate:seo -- --apply`,
    )
  }
}

async function main() {
  process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'dev-secret-change-me'

  const configModule = await import(pathToFileURL(path.resolve('src/payload.config.ts')).href)
  const payload = await getPayload({ config: configModule.default })

  const reports: DocReport[] = []
  for (const collection of collections) {
    reports.push(...(await auditCollection(payload, collection)))
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          collections,
          onlyIssues,
          issueCounts: summarizeIssues(reports.filter((r) => r.audit.issues.length > 0)),
          docs: reports,
        },
        null,
        2,
      ),
    )
  } else {
    printHuman(reports)
  }

  process.exit(0)
}

main().catch((err) => {
  log.error('SEO audit failed', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})

#!/usr/bin/env tsx
/**
 * Live SEO crawl from sitemap.xml (staging/production).
 *
 *   pnpm exec tsx scripts/crawl-seo-sitemap.ts
 *   pnpm exec tsx scripts/crawl-seo-sitemap.ts -- --base https://fc-karben-three.vercel.app
 *   pnpm exec tsx scripts/crawl-seo-sitemap.ts -- --limit 30
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { createLogger } from '../src/lib/logger'
import { META_DESCRIPTION_SOFT_MIN, META_TITLE_SOFT_MIN } from '../src/lib/seo/audit-content'
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from '../src/lib/seo/generate'

const log = createLogger('crawl:seo')

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const BASE = (arg('base') || 'https://fc-karben-three.vercel.app').replace(/\/$/, '')
const LIMIT = Number(arg('limit') || '0') || 0
const CONCURRENCY = Number(arg('concurrency') || '8') || 8
const SITEMAP_FILE = arg('sitemap')

type IssueCode =
  | 'http-error'
  | 'missing-title'
  | 'title-too-short'
  | 'title-too-long'
  | 'title-duplicated-brand'
  | 'missing-meta-description'
  | 'meta-description-too-short'
  | 'meta-description-too-long'
  | 'missing-canonical'
  | 'canonical-mismatch'
  | 'missing-og-title'
  | 'missing-og-description'
  | 'missing-og-image'
  | 'missing-h1'
  | 'multiple-h1'
  | 'noindex'
  | 'missing-json-ld'

type PageAudit = {
  url: string
  status: number
  title: string | null
  description: string | null
  canonical: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  h1Count: number
  h1Texts: string[]
  robots: string | null
  hasJsonLd: boolean
  issues: IssueCode[]
}

function metaContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    'i',
  )
  const m = html.match(re)
  return m?.[1] || m?.[2] || null
}

function linkHref(html: string, rel: string): string | null {
  const re = new RegExp(
    `<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${rel}["']`,
    'i',
  )
  const m = html.match(re)
  return m?.[1] || m?.[2] || null
}

function titleText(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m?.[1]?.replace(/\s+/g, ' ').trim() || null
}

function h1s(html: string): string[] {
  const out: string[] = []
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi
  for (const m of html.matchAll(re)) {
    out.push(
      m[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
  }
  return out
}

function auditHtml(url: string, status: number, html: string): PageAudit {
  const title = titleText(html)
  const description = metaContent(html, 'description')
  const canonical = linkHref(html, 'canonical')
  const ogTitle = metaContent(html, 'og:title')
  const ogDescription = metaContent(html, 'og:description')
  const ogImage = metaContent(html, 'og:image')
  const robots = metaContent(html, 'robots')
  const h1Texts = h1s(html)
  const hasJsonLd = /application\/ld\+json/i.test(html)
  const issues: IssueCode[] = []

  if (status < 200 || status >= 400) issues.push('http-error')

  if (!title) issues.push('missing-title')
  else {
    if (title.length < META_TITLE_SOFT_MIN) issues.push('title-too-short')
    if (title.length > SEO_TITLE_MAX + 20) issues.push('title-too-long') // template adds site name
    if (/\| FC Karben \| FC Karben/i.test(title)) issues.push('title-duplicated-brand')
  }

  if (!description) issues.push('missing-meta-description')
  else {
    if (description.length < META_DESCRIPTION_SOFT_MIN) issues.push('meta-description-too-short')
    if (description.length > SEO_DESCRIPTION_MAX) issues.push('meta-description-too-long')
  }

  if (!canonical) issues.push('missing-canonical')
  else {
    const normUrl = url.replace(/\/$/, '') || url
    const normCanon = canonical.replace(/\/$/, '')
    if (normCanon !== normUrl && normCanon !== `${normUrl}/`) {
      // allow trailing slash variance only; flag host/path mismatches
      try {
        const u = new URL(url)
        const c = new URL(canonical)
        if (u.pathname.replace(/\/$/, '') !== c.pathname.replace(/\/$/, '') || u.host !== c.host) {
          issues.push('canonical-mismatch')
        }
      } catch {
        issues.push('canonical-mismatch')
      }
    }
  }

  if (!ogTitle) issues.push('missing-og-title')
  if (!ogDescription) issues.push('missing-og-description')
  if (!ogImage) issues.push('missing-og-image')

  if (h1Texts.length === 0) issues.push('missing-h1')
  if (h1Texts.length > 1) issues.push('multiple-h1')

  if (robots && /noindex/i.test(robots)) issues.push('noindex')
  if (!hasJsonLd) issues.push('missing-json-ld')

  return {
    url,
    status,
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    h1Count: h1Texts.length,
    h1Texts,
    robots,
    hasJsonLd,
    issues,
  }
}

async function loadUrls(): Promise<string[]> {
  if (SITEMAP_FILE) {
    const { readFileSync } = await import('node:fs')
    const xml = readFileSync(SITEMAP_FILE, 'utf8')
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  }
  const res = await fetch(`${BASE}/sitemap.xml`, {
    headers: { Accept: 'application/xml,text/xml,*/*' },
  })
  if (!res.ok) throw new Error(`sitemap.xml HTTP ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

async function fetchPage(url: string): Promise<PageAudit> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        Accept: 'text/html',
        'User-Agent': 'fc-karben-seo-crawl/1.0',
      },
    })
    const html = await res.text()
    return auditHtml(url, res.status, html)
  } catch {
    return {
      url,
      status: 0,
      title: null,
      description: null,
      canonical: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      h1Count: 0,
      h1Texts: [],
      robots: null,
      hasJsonLd: false,
      issues: ['http-error'],
    }
  }
}

async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx]!)
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()))
  return out
}

async function main() {
  let urls: string[]
  try {
    urls = await loadUrls()
  } catch (err) {
    log.error('Failed to load sitemap', {
      error: err instanceof Error ? err.message : String(err),
      hint: 'Pass --sitemap path/to/sitemap.xml',
    })
    // fallback to uploaded file if present
    const fallback =
      '/Users/crypt32dll/.cursor/projects/Users-crypt32dll-workspace-fc-karben/uploads/sitemap-0.xml'
    const { existsSync, readFileSync } = await import('node:fs')
    if (!existsSync(fallback)) process.exit(1)
    const xml = readFileSync(fallback, 'utf8')
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    log.warn('Using uploaded sitemap fallback', { count: urls.length })
  }

  if (LIMIT > 0) urls = urls.slice(0, LIMIT)
  log.info('Crawling', { count: urls.length, base: BASE, concurrency: CONCURRENCY })

  const results = await mapPool(urls, CONCURRENCY, fetchPage)
  const withIssues = results.filter((r) => r.issues.length)

  const byIssue: Record<string, string[]> = {}
  for (const r of results) {
    for (const code of r.issues) {
      const list = byIssue[code]
      if (list) list.push(r.url)
      else byIssue[code] = [r.url]
    }
  }

  const summary = {
    crawledAt: new Date().toISOString(),
    base: BASE,
    total: results.length,
    clean: results.length - withIssues.length,
    withIssues: withIssues.length,
    issueCounts: Object.fromEntries(
      Object.entries(byIssue)
        .map(([k, v]) => [k, v.length])
        .sort((a, b) => (b[1] as number) - (a[1] as number)),
    ),
    byIssue: Object.fromEntries(Object.entries(byIssue).map(([k, v]) => [k, v.slice(0, 40)])),
    samples: withIssues.slice(0, 25).map((r) => ({
      url: r.url,
      status: r.status,
      title: r.title,
      descriptionLen: r.description?.length ?? 0,
      h1Count: r.h1Count,
      issues: r.issues,
    })),
  }

  const outPath = path.resolve('tmp/seo-crawl-report.json')
  writeFileSync(outPath, JSON.stringify({ summary, results }, null, 2))
  log.info('Report written', { outPath, ...summary.issueCounts, clean: summary.clean })
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((err) => {
  log.error('Failed', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

/** Matches @payloadcms/plugin-seo defaults.description.maxLength */
export const SEO_DESCRIPTION_MAX = 150
/** Matches @payloadcms/plugin-seo defaults.title.maxLength */
export const SEO_TITLE_MAX = 60
const SITE_NAME = 'FC Karben'

/**
 * Public site origin for SEO, Preview, Live Preview, redirects.
 *
 * On Vercel (system env, no config needed):
 * - production → `VERCEL_PROJECT_PRODUCTION_URL` (custom domain / prod host)
 * - preview/dev deploy → `VERCEL_URL` (this deployment)
 *
 * Optional override: `NEXT_PUBLIC_SITE_URL` (local, or force a canonical host).
 */
export function getPublicSiteURL(): string {
  const override = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const onVercel = Boolean(process.env.VERCEL)

  if (onVercel) {
    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, '')
    const deploymentHost = process.env.VERCEL_URL?.replace(/\/$/, '')

    if (process.env.VERCEL_ENV === 'production' && productionHost) {
      return `https://${productionHost}`
    }
    if (deploymentHost) {
      return `https://${deploymentHost}`
    }
    if (productionHost) {
      return `https://${productionHost}`
    }
  }

  if (override) return override
  return 'http://localhost:3000'
}

/**
 * Soft-launch / staging gate. Indexing stays off until explicitly enabled
 * via ALLOW_SEARCH_INDEXING=true (e.g. on Vercel at cutover).
 */
export function allowSearchIndexing(): boolean {
  return process.env.ALLOW_SEARCH_INDEXING === 'true'
}

/** Lexical rich text → plain string for meta description. */
export function lexicalToPlainText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  try {
    const text = convertLexicalToPlaintext({
      data: content as SerializedEditorState,
    })
    return text.replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}

function truncateAtWord(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  const budget = Math.max(1, max - 1) // room for …
  let sliced = cleaned.slice(0, budget)
  const lastSpace = sliced.lastIndexOf(' ')
  const minKeep = Math.floor(max * 0.5)
  if (lastSpace > minKeep) sliced = sliced.slice(0, lastSpace)
  const result = `${sliced.trimEnd()}…`
  return result.length <= max ? result : `${cleaned.slice(0, max - 1).trimEnd()}…`
}

export function truncateSeoDescription(text: string, max = SEO_DESCRIPTION_MAX): string {
  return truncateAtWord(text, max)
}

export function truncateSeoTitle(text: string, max = SEO_TITLE_MAX): string {
  return truncateAtWord(text, max)
}

type SeoDoc = {
  title?: string | null
  name?: string | null
  excerpt?: string | null
  summary?: string | null
  content?: unknown
  slug?: string | null
  path?: string | null
}

/** Shared with @payloadcms/plugin-seo generateTitle. */
export function generateSeoTitle(doc: SeoDoc): string {
  const headline = doc.title || doc.name || SITE_NAME
  if (headline === SITE_NAME) return truncateSeoTitle(SITE_NAME)
  if (headline.includes('|')) return truncateSeoTitle(headline)
  return truncateSeoTitle(`${headline} | ${SITE_NAME}`)
}

/**
 * Shared with @payloadcms/plugin-seo generateDescription.
 * Prefers excerpt/summary, then Lexical body, then a title-based fallback
 * so Auto-generate never returns an empty string for pages.
 * Always ≤ SEO_DESCRIPTION_MAX (150) to match the CMS length indicator.
 */
export function generateSeoDescription(doc: SeoDoc): string {
  const fromExcerpt = (doc.excerpt || doc.summary || '').trim()
  if (fromExcerpt) return truncateSeoDescription(fromExcerpt)

  const fromBody = lexicalToPlainText(doc.content)
  if (fromBody) return truncateSeoDescription(fromBody)

  const headline = (doc.title || doc.name || '').trim()
  if (headline) {
    return truncateSeoDescription(`${headline} — FC Karben e.V. Fußball in Karben.`)
  }
  return 'FC Karben e.V. — Fußball in Karben seit 2015.'
}

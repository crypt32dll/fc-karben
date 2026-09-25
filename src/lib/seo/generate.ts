import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

const SEO_DESCRIPTION_MAX = 160
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

export function truncateSeoDescription(text: string, max = SEO_DESCRIPTION_MAX): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  const sliced = cleaned.slice(0, max - 1)
  const lastSpace = sliced.lastIndexOf(' ')
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`
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
  if (headline === SITE_NAME || headline.includes('|')) return headline
  return `${headline} | ${SITE_NAME}`
}

/**
 * Shared with @payloadcms/plugin-seo generateDescription.
 * Prefers excerpt/summary, then Lexical body, then a title-based fallback
 * so Auto-generate never returns an empty string for pages.
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

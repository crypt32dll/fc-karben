import { getPublicSiteURL } from '@/lib/seo/generate'

export { getPublicSiteURL }

/** Safe relative path for draftMode redirect. */
export function normalizePreviewPath(path: string | null | undefined): string | null {
  if (!path) return null
  let p = path.trim()
  if (!p.startsWith('/')) p = `/${p}`
  if (p.startsWith('//') || p.includes('://')) return null
  return p
}

/**
 * Absolute Preview URL → enables Next draftMode then redirects to `path`.
 * Used by admin.preview and admin.livePreview.url.
 */
export function formatDraftPreviewURL(path: string): string {
  const safe = normalizePreviewPath(path) || '/'
  const params = new URLSearchParams({
    path: safe,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })
  return `${getPublicSiteURL()}/api/preview?${params.toString()}`
}

export function previewURLForPage(doc: { slug?: string | null; path?: string | null }): string {
  const path =
    doc.path && String(doc.path).startsWith('/')
      ? String(doc.path)
      : doc.slug
        ? `/${doc.slug}`
        : '/'
  return formatDraftPreviewURL(path)
}

export function previewURLForPost(doc: { slug?: string | null }): string {
  if (!doc.slug) return formatDraftPreviewURL('/presse')
  return formatDraftPreviewURL(`/presse/${doc.slug}`)
}

export function previewURLForTeam(doc: { slug?: string | null }): string {
  if (!doc.slug) return formatDraftPreviewURL('/')
  return formatDraftPreviewURL(`/${doc.slug}`)
}

export function previewURLForHomepage(): string {
  return formatDraftPreviewURL('/')
}

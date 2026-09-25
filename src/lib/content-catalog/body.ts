/**
 * ClubSite-owned rich-text body DTO.
 * Validated at the ContentCatalog / Page Builder seam — no Payload types cross into ClubSite.
 */
export type CatalogBody = {
  root: {
    type: string
    children: unknown[]
    [key: string]: unknown
  }
}

/** Normalize Payload Lexical JSON into CatalogBody, or null if unusable. */
export function mapCatalogBody(raw: unknown): CatalogBody | null {
  if (!raw || typeof raw !== 'object') return null
  const root = (raw as { root?: unknown }).root
  if (!root || typeof root !== 'object') return null
  const children = (root as { children?: unknown }).children
  if (!Array.isArray(children)) return null
  return {
    root: {
      ...(root as Record<string, unknown>),
      type: String((root as { type?: unknown }).type || 'root'),
      children,
    },
  }
}

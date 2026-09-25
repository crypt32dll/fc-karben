/**
 * Normalize WordPress HTML before Lexical conversion:
 * - Tabby shortcodes → headings
 * - Drop Fussball.de widget scripts (outbound link lives on Team)
 * - Optionally keep img tags for later upload-node rewrite
 */

export function normalizeWpHtml(html: string): string {
  return (html || '')
    .replace(/\[tabby\s+title=["']([^"']+)["']\s*\]/gi, '<h3>$1</h3>')
    .replace(/\[tabbyending\]/gi, '')
    .replace(/\[\/?[^\]]+\]/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '')
    .replace(/<\/?figure[^>]*>/gi, '')
    .trim()
}

/**
 * When no media map is available, turn imgs into filename links so Lexical
 * does not invent upload nodes without IDs.
 */
export function imgsToLinks(html: string): string {
  return html.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (_m, _pre, src: string) => {
    const label = src.split('/').pop() || src
    return `<p><a href="${src}">${label}</a></p>`
  })
}

/**
 * Rewrite absolute/relative WP upload URLs to Payload media file URLs when known.
 * Leaves unknown imgs as links.
 */
export function rewriteImgSrcs(html: string, mediaUrlBySource: Map<string, string>): string {
  return html.replace(
    /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/gi,
    (_full, pre: string, src: string, post: string) => {
      const mapped = lookupMediaUrl(src, mediaUrlBySource)
      if (mapped) {
        return `<img${pre}src="${mapped}"${post}>`
      }
      const label = src.split('/').pop() || src
      return `<p><a href="${src}">${label}</a></p>`
    },
  )
}

function lookupMediaUrl(src: string, map: Map<string, string>): string | undefined {
  if (map.has(src)) return map.get(src)
  // try without query / size suffix (-1024x683)
  const bare = src.split('?')[0]
  if (map.has(bare)) return map.get(bare)
  const unscaled = bare.replace(/-\d+x\d+(?=\.\w+$)/, '')
  if (map.has(unscaled)) return map.get(unscaled)
  // match by filename
  const file = bare.split('/').pop()
  if (!file) return undefined
  for (const [key, value] of map) {
    if (key.endsWith(`/${file}`) || key.endsWith(`/${file.replace(/-\d+x\d+(?=\.\w+$)/, '')}`)) {
      return value
    }
  }
  return undefined
}

export function prepareHtmlForLexical(
  html: string,
  mediaUrlBySource?: Map<string, string>,
): string {
  const normalized = normalizeWpHtml(html)
  if (mediaUrlBySource && mediaUrlBySource.size > 0) {
    return rewriteImgSrcs(normalized, mediaUrlBySource) || '<p></p>'
  }
  return imgsToLinks(normalized) || '<p></p>'
}

/** Map WP page slug to ClubSite canonical slug/path. */
export function canonicalizePageSlug(slug: string): { slug: string; pathHint?: string } {
  if (slug === 'g-jugend') {
    return { slug: 'alte-herren', pathHint: '/alte-herren' }
  }
  return { slug }
}

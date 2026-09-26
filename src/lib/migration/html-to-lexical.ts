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
  return replaceImages(html, (src) => src)
}

/**
 * Rewrite WP images to plain links (mapped URL when known).
 * Never leave raw <img> tags — Lexical would create upload nodes without IDs.
 */
export function rewriteImgSrcs(html: string, mediaUrlBySource: Map<string, string>): string {
  return replaceImages(html, (src) => lookupMediaUrl(src, mediaUrlBySource) || src)
}

/** Linked images first, then bare imgs → always <p><a href>…</a></p>. */
function replaceImages(html: string, resolveSrc: (src: string) => string): string {
  const linked = html.replace(
    /<a\b[^>]*>\s*<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>\s*<\/a>/gi,
    (_m, src: string) => {
      const href = resolveSrc(src)
      const label = decodeURIComponent((href.split('/').pop() || href).split('?')[0])
      return `<p><a href="${href}">${label}</a></p>`
    },
  )
  return linked.replace(/<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi, (_m, src: string) => {
    const href = resolveSrc(src)
    const label = decodeURIComponent((href.split('/').pop() || href).split('?')[0])
    return `<p><a href="${href}">${label}</a></p>`
  })
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

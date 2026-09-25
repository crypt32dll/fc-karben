export type RedirectRule = {
  from: string
  to: string
  permanent?: boolean
}

export function normalizePath(path: string): string {
  if (!path) return '/'
  let p = path.trim()
  if (!p.startsWith('/')) p = `/${p}`
  try {
    if (p.startsWith('http')) {
      p = new URL(p).pathname
    }
  } catch {
    // keep as-is
  }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

/** Map a WordPress dated permalink to the new presse path */
export function wpDatedPostToPresse(pathname: string): string | null {
  const normalized = normalizePath(pathname)
  const match = normalized.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/?$/)
  if (!match) return null
  return `/presse/${match[4]}`
}

/** Reject open redirects — only relative paths or same-origin absolute URLs. */
export function isSafeRedirectTarget(
  to: string,
  siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://fc-karben.de',
): boolean {
  if (!to || to.startsWith('//')) return false
  if (to.startsWith('/')) return !to.startsWith('//')
  try {
    const target = new URL(to)
    const site = new URL(siteOrigin)
    return target.origin === site.origin
  } catch {
    return false
  }
}

export function resolveRedirect(
  pathname: string,
  rules: RedirectRule[],
): { to: string; permanent: boolean } | null {
  const from = normalizePath(pathname)
  const hit = rules.find((r) => normalizePath(r.from) === from)
  if (hit) {
    const to = normalizePath(hit.to)
    if (!isSafeRedirectTarget(to)) return null
    return { to, permanent: hit.permanent !== false }
  }

  // Alte Herren lived under /g-jugend in WordPress
  if (from === '/g-jugend') {
    return { to: '/alte-herren', permanent: true }
  }
  if (from.startsWith('/category/g-jugend')) {
    return { to: '/presse', permanent: true }
  }

  const presse = wpDatedPostToPresse(from)
  if (presse) return { to: presse, permanent: true }
  return null
}

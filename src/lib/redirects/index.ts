export type RedirectRule = {
  from: string
  to: string
  permanent?: boolean
}

export function normalizePath(path: string): string {
  if (!path) return '/'
  let p = path.trim()
  if (!p.startsWith('/')) p = `/${p}`
  // strip origin if accidentally included
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

export function resolveRedirect(
  pathname: string,
  rules: RedirectRule[],
): { to: string; permanent: boolean } | null {
  const from = normalizePath(pathname)
  const hit = rules.find((r) => normalizePath(r.from) === from)
  if (!hit) {
    // built-in G-Jugend retirement
    if (from === '/g-jugend' || from.startsWith('/category/g-jugend')) {
      return { to: '/presse', permanent: true }
    }
    const presse = wpDatedPostToPresse(from)
    if (presse) return { to: presse, permanent: true }
    return null
  }
  return { to: normalizePath(hit.to), permanent: hit.permanent !== false }
}

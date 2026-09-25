import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  isSafeRedirectTarget,
  type RedirectRule,
  resolveRedirect,
  wpDatedPostToPresse,
} from '@/lib/redirects'

/**
 * Edge redirects: built-in WP rules first, then cached CMS redirect map.
 * Matcher excludes /_next, /api, /admin, and files with extensions.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Fast built-in: dated WP permalinks (no network)
  const presse = wpDatedPostToPresse(pathname)
  if (presse) {
    const url = request.nextUrl.clone()
    url.pathname = presse
    return NextResponse.redirect(url, 308)
  }

  let rules: RedirectRule[] = []
  try {
    const origin = request.nextUrl.origin
    const res = await fetch(`${origin}/api/redirects`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(1500),
    })
    if (res.ok) {
      const data = (await res.json()) as { rules?: RedirectRule[] }
      rules = data.rules || []
    }
  } catch {
    // Fall through to built-ins only
  }

  const hit = resolveRedirect(pathname, rules)
  if (hit && isSafeRedirectTarget(hit.to, request.nextUrl.origin)) {
    const url = request.nextUrl.clone()
    url.pathname = hit.to
    return NextResponse.redirect(url, hit.permanent ? 308 : 307)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!admin|api|_next|favicon.ico|.*\\..*).*)'],
}

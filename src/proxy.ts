import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { isKnownClubSitePath } from '@/lib/club-paths'
import { isSafeRedirectTarget, type RedirectRule, resolveRedirect } from '@/lib/redirects'

/**
 * Edge redirects without calling /api/redirects on every pageview.
 *
 * 1. Known ClubSite paths → pass through (no network)
 * 2. Built-in WP→Club mappings → redirect (no network)
 * 3. Otherwise fetch CMS redirect rules (cached) for custom/legacy overrides
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isKnownClubSitePath(pathname)) {
    return NextResponse.next()
  }

  // Built-ins only (dated WP posts, g-jugend, …) — zero function invocations
  const builtin = resolveRedirect(pathname, [])
  if (builtin && isSafeRedirectTarget(builtin.to, request.nextUrl.origin)) {
    const url = request.nextUrl.clone()
    url.pathname = builtin.to
    return NextResponse.redirect(url, builtin.permanent ? 308 : 307)
  }

  let rules: RedirectRule[] = []
  try {
    const origin = request.nextUrl.origin
    const res = await fetch(`${origin}/api/redirects`, {
      next: { revalidate: 3600, tags: [CACHE_TAGS.redirects] },
      signal: AbortSignal.timeout(1500),
    })
    if (res.ok) {
      const data = (await res.json()) as { rules?: RedirectRule[] }
      rules = data.rules || []
    }
  } catch {
    // Fall through — no CMS rules available
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

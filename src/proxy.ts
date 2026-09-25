import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { isSafeRedirectTarget, type RedirectRule, resolveRedirect } from '@/lib/redirects'

/**
 * Edge redirects: CMS rule map first (can override dated WP URLs), then built-ins.
 * Matcher excludes /_next, /api, /admin, and files with extensions.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let rules: RedirectRule[] = []
  try {
    const origin = request.nextUrl.origin
    const res = await fetch(`${origin}/api/redirects`, {
      next: { tags: [CACHE_TAGS.redirects], revalidate: 60 },
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

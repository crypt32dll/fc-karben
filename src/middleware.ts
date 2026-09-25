import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { wpDatedPostToPresse } from '@/lib/redirects'

/**
 * Lightweight edge redirects for WP dated permalinks.
 * Full Redirect collection lookup happens in page loaders (Node runtime).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const presse = wpDatedPostToPresse(pathname)
  if (presse) {
    const url = request.nextUrl.clone()
    url.pathname = presse
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!admin|api|_next|favicon.ico|.*\\..*).*)'],
}

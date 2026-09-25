import { NextResponse } from 'next/server'

import { listRedirectRules } from '@/lib/content-catalog'

/**
 * CMS redirect rule map for the Edge proxy (legacy/unknown paths only).
 * Public cache so Proxy fetch hits don't always invoke a new function.
 * Invalidated via CACHE_TAGS.redirects on Payload redirect changes.
 */
export async function GET() {
  const rules = await listRedirectRules()
  return NextResponse.json(
    { rules },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}

import { NextResponse } from 'next/server'

import { listRedirectRules } from '@/lib/content-catalog'

/** Thin adapter — Data Cache via ContentCatalog tags; no independent CDN TTL. */
export async function GET() {
  const rules = await listRedirectRules()
  return NextResponse.json(
    { rules },
    {
      headers: {
        'Cache-Control': 'private, no-cache',
      },
    },
  )
}

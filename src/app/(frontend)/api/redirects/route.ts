import { NextResponse } from 'next/server'

import { listRedirectRules } from '@/lib/content-catalog'

/** Thin adapter: Edge-friendly Redirect rule map for proxy (tag-bustable via ContentCatalog). */
export async function GET() {
  const rules = await listRedirectRules()
  return NextResponse.json(
    { rules },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      },
    },
  )
}

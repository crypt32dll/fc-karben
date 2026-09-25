import { NextResponse } from 'next/server'

import { listRedirectRules } from '@/lib/content-catalog'

export const revalidate = 300

/** Edge-friendly redirect rule map for proxy. */
export async function GET() {
  const rules = await listRedirectRules()
  return NextResponse.json(
    { rules },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    },
  )
}

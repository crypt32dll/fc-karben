import { NextResponse } from 'next/server'

import { syncMatchFeed } from '@/lib/match-feed'

/**
 * Vercel Cron + manual trigger: sync 1. Mannschaft fixtures from fussball.de → Matches.
 * Auth: Authorization: Bearer $CRON_SECRET (Vercel sets this automatically for crons).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await syncMatchFeed()
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

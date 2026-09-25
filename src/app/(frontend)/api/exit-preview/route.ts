import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET fallback for bookmarks / hard navigation.
 * Prefer the banner form (Server Action) — Next `<Link>` can fail to clear the draft cookie.
 */
export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/'
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : '/'

  return NextResponse.redirect(new URL(safe, request.url), 303)
}

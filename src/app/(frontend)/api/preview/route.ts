import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { normalizePreviewPath } from '@/lib/preview/urls'

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { searchParams } = new URL(request.url)
  const path = normalizePreviewPath(searchParams.get('path'))
  const previewSecret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path) {
    return new Response('Invalid or missing path', { status: 400 })
  }

  let user = null
  try {
    ;({ user } = await payload.auth({
      req: request as unknown as PayloadRequest,
      headers: request.headers,
    }))
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for draft preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()

  if (!user) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  draft.enable()
  redirect(path)
}

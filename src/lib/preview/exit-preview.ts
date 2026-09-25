'use server'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** POST exit — preferred over GET+Link so the draft cookie is cleared reliably. */
export async function exitPreviewAction(formData: FormData) {
  const draft = await draftMode()
  draft.disable()

  const path = String(formData.get('path') || '/')
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : '/'
  redirect(safe)
}

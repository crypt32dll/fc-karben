'use client'

import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

type Props = {
  serverURL: string
}

/** Server-side Live Preview: refresh RSC tree after draft save / autosave / publish. */
export function RefreshRouteOnSave({ serverURL }: Props) {
  const router = useRouter()
  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={serverURL} />
}

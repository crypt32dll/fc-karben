import { draftMode } from 'next/headers'

import { DraftModeBanner } from '@/components/preview/DraftModeBanner'
import { RefreshRouteOnSave } from '@/components/preview/RefreshRouteOnSave'
import { getPublicSiteURL } from '@/lib/preview/urls'

/** Request-time only when the draft cookie is set; wrap in Suspense from the layout. */
export async function DraftModeGate() {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  return (
    <>
      <DraftModeBanner />
      <RefreshRouteOnSave serverURL={getPublicSiteURL()} />
    </>
  )
}

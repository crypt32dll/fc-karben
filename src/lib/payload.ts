import { getPayload, type Payload } from 'payload'

import config from '@payload-config'

let cached: Payload | null = null

/** Shared Payload instance for ClubSite / ContentCatalog (server-only). */
export async function getPayloadClient(): Promise<Payload> {
  if (cached) return cached
  cached = await getPayload({ config })
  return cached
}

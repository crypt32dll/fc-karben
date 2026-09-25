import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let cached: Payload | null = null

/** Shared Payload instance for ClubSite / ContentCatalog (server-only). */
export async function getPayloadClient(): Promise<Payload> {
  if (cached) return cached
  cached = await getPayload({ config })
  return cached
}

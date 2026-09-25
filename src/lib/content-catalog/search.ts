import { pathForDoc } from '../club-paths'
import { createLogger } from '../logger'
import { getPayloadClient } from '../payload'
import { type SearchHit, searchHitsSchema } from './schemas'

const log = createLogger('ContentCatalog')

export type { SearchHit }

/** Query the Payload search plugin collection (ContentCatalog seam). */
export async function findSearchHits(query: string, limit = 24): Promise<SearchHit[]> {
  const q = query.trim()
  if (!q) return []

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'search',
      where: {
        or: [{ title: { contains: q } }, { excerpt: { contains: q } }, { slug: { contains: q } }],
      },
      sort: '-priority',
      limit,
      depth: 0,
      overrideAccess: true,
    })

    const hits = result.docs.map((doc) => {
      const relationTo = doc.doc?.relationTo || 'pages'
      const path = pathForDoc({
        relationTo,
        slug: doc.slug,
        path: doc.path,
      })
      return {
        id: String(doc.id),
        title: doc.title || 'Ohne Titel',
        excerpt: doc.excerpt,
        path,
        relationTo,
      }
    })

    const parsed = searchHitsSchema.safeParse(hits)
    if (!parsed.success) {
      log.warn('search hits failed Zod', {
        issues: parsed.error.issues.map((i) => i.message),
      })
      return []
    }
    return parsed.data
  } catch (err) {
    log.warn('findSearchHits failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

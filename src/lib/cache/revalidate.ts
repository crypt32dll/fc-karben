import { revalidatePath, revalidateTag } from 'next/cache'

import { createLogger } from '../logger'
import type { CachePolicy, CacheTag } from './tags'

export { CACHE_TAGS, CATALOG_REVALIDATE, CATALOG_REVALIDATE_SECONDS, type CachePolicy, type CacheTag } from './tags'

const log = createLogger('Cache')

export function shouldSkipRevalidate(context: unknown): boolean {
  if (!context || typeof context !== 'object') return false
  return Boolean((context as { disableRevalidate?: boolean }).disableRevalidate)
}

export function revalidateCatalogTags(...tags: CacheTag[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, 'max')
      log.debug('revalidateTag', { tag })
    } catch (err) {
      log.warn('revalidateTag failed', {
        tag,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

export function revalidateCatalogPaths(...paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path)
      log.debug('revalidatePath', { path })
    } catch (err) {
      log.warn('revalidatePath failed', {
        path,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

function pathsForDoc(policy: CachePolicy, doc: unknown): string[] {
  const staticPaths = policy.paths ?? ['/']
  const dynamic = policy.pathsFromDoc?.(doc) ?? []
  return [...new Set([...staticPaths, ...dynamic])]
}

/** Shared Payload collection hook — skip during migration bulk import. */
export function createRevalidateHooks(policy: CachePolicy) {
  const run = ({ doc, context }: { doc?: unknown; context?: unknown }) => {
    if (shouldSkipRevalidate(context)) return
    revalidateCatalogTags(...policy.tags)
    revalidateCatalogPaths(...pathsForDoc(policy, doc))
  }
  return {
    afterChange: [run],
    afterDelete: [run],
  }
}

/** Globals have no afterDelete — afterChange only. */
export function createGlobalRevalidateHooks(policy: CachePolicy) {
  return {
    afterChange: [
      ({ doc, context }: { doc?: unknown; context?: unknown }) => {
        if (shouldSkipRevalidate(context)) return
        revalidateCatalogTags(...policy.tags)
        revalidateCatalogPaths(...pathsForDoc(policy, doc))
      },
    ],
  }
}

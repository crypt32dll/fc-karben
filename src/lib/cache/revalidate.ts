import { revalidatePath, revalidateTag } from 'next/cache'

import { createLogger } from '../logger'

const log = createLogger('Cache')

export const CACHE_TAGS = {
  posts: 'posts',
  pages: 'pages',
  teams: 'teams',
  sponsors: 'sponsors',
  socialTiles: 'social-tiles',
  redirects: 'redirects',
  homepage: 'homepage',
  siteSettings: 'site-settings',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/** Default ISR window for ClubSite catalog reads (seconds). */
export const CATALOG_REVALIDATE_SECONDS = 300

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

/** Shared Payload collection hook — skip during migration bulk import. */
export function createRevalidateHooks(tags: CacheTag[], paths: string[] = ['/']) {
  const run = ({ context }: { context?: unknown }) => {
    if (shouldSkipRevalidate(context)) return
    revalidateCatalogTags(...tags)
    revalidateCatalogPaths(...paths)
  }
  return {
    afterChange: [run],
    afterDelete: [run],
  }
}

/** Globals have no afterDelete — afterChange only. */
export function createGlobalRevalidateHooks(tags: CacheTag[], paths: string[] = ['/']) {
  return {
    afterChange: [
      ({ context }: { context?: unknown }) => {
        if (shouldSkipRevalidate(context)) return
        revalidateCatalogTags(...tags)
        revalidateCatalogPaths(...paths)
      },
    ],
  }
}

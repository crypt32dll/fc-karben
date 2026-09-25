import type { CollectionConfig, GlobalConfig } from 'payload'

import { createGlobalRevalidateHooks, createRevalidateHooks } from './revalidate'
import type { CachePolicy } from './tags'

/** ClubSite adapter: bind a declared cache policy onto a Payload collection. */
export function withCollectionCache(
  collection: CollectionConfig,
  policy: CachePolicy,
): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      ...createRevalidateHooks(policy),
    },
  }
}

/** ClubSite adapter: bind a declared cache policy onto a Payload global. */
export function withGlobalCache(global: GlobalConfig, policy: CachePolicy): GlobalConfig {
  return {
    ...global,
    hooks: {
      ...global.hooks,
      ...createGlobalRevalidateHooks(policy),
    },
  }
}

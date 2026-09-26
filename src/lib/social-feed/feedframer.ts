import { createLogger } from '../logger'

import type { FeedframerPost, FeedframerResponse, SocialTileDto } from './types'
import { SOCIAL_FEED_REVALIDATE_SECONDS } from './types'

const log = createLogger('SocialFeed:feedframer')

const API_BASE = 'https://feedframer.com/api/v1/me'

/** Free tier rejects `page[size]` above 6 (HTTP 422). Premium allows up to 100. */
const FREE_TIER_MAX_PAGE_SIZE = 6

export function mapFeedframerPostToTile(post: FeedframerPost, index: number): SocialTileDto | null {
  const imageUrl =
    post.mediaType === 'VIDEO' || post.mediaType === 'REELS'
      ? post.thumbnailUrl || post.mediaUrl
      : post.mediaUrl || post.thumbnailUrl
  if (!imageUrl) return null
  return {
    id: `ff-${post.id}`,
    caption: post.caption,
    url: post.permalink,
    imageUrl,
    sortOrder: index,
    source: 'feedframer',
  }
}

/**
 * Live Instagram tiles via Feedframer (https://feedframer.com/docs/examples/nextjs).
 * Returns [] when API key missing or request fails — caller falls back to CMS tiles.
 */
export async function fetchFeedframerTiles(limit = FREE_TIER_MAX_PAGE_SIZE): Promise<SocialTileDto[]> {
  const apiKey = process.env.FEEDFRAMER_API_KEY?.trim()
  if (!apiKey) return []

  const params = new URLSearchParams({
    api_key: apiKey,
    'page[size]': String(Math.min(Math.max(limit, 1), FREE_TIER_MAX_PAGE_SIZE)),
  })

  try {
    const res = await fetch(`${API_BASE}?${params}`, {
      next: { revalidate: SOCIAL_FEED_REVALIDATE_SECONDS },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      log.warn('Feedframer HTTP error', { status: res.status })
      return []
    }
    const data = (await res.json()) as FeedframerResponse
    const posts = Array.isArray(data.posts) ? data.posts : []
    return posts
      .map((post, i) => mapFeedframerPostToTile(post, i))
      .filter((t): t is SocialTileDto => Boolean(t))
  } catch (err) {
    log.warn('Feedframer fetch failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

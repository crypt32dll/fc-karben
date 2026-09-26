export type SocialTileDto = {
  id: string
  caption?: string | null
  url?: string | null
  imageUrl?: string | null
  sortOrder: number
  /** Origin for debugging / image policy */
  source?: 'cms' | 'feedframer'
}

export type FeedframerPost = {
  id: string
  caption: string | null
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS' | string
  mediaUrl: string
  thumbnailUrl: string | null
  permalink: string
  timestamp: string
  likeCount: number | null
  commentsCount: number | null
}

export type FeedframerResponse = {
  username: string
  posts: FeedframerPost[]
  pagination?: {
    nextCursor: string | null
    hasMore: boolean
    perPage: number
  }
}

/** Public club Instagram profile (footer / grid CTA). */
export const DEFAULT_INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/fckarben/'

export function instagramProfileUrl(): string {
  return process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || DEFAULT_INSTAGRAM_PROFILE_URL
}

/** Hourly refresh — Instagram posts change often; CMS tiles stay tag-cached. */
export const SOCIAL_FEED_REVALIDATE_SECONDS = 3600

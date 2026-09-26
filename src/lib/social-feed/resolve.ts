import { fetchFeedframerTiles } from './feedframer'
import type { SocialTileDto } from './types'

export function selectSocialTiles(tiles: SocialTileDto[], max = 6): SocialTileDto[] {
  return [...tiles]
    .filter((t) => Boolean(t.imageUrl || t.url))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, max)
}

/**
 * Prefer live Feedframer feed when `FEEDFRAMER_API_KEY` is set;
 * otherwise (or on API failure) use CMS Social Tiles.
 */
export async function resolveSocialTiles(input: {
  limit?: number
  cmsTiles: () => Promise<SocialTileDto[]>
}): Promise<SocialTileDto[]> {
  const limit = input.limit ?? 12
  const live = await fetchFeedframerTiles(limit)
  if (live.length) return live.slice(0, limit)
  return input.cmsTiles()
}

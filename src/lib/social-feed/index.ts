export type SocialTileDto = {
  id: string
  caption?: string | null
  url?: string | null
  imageUrl?: string | null
  sortOrder: number
}

export function selectSocialTiles(tiles: SocialTileDto[], max = 6): SocialTileDto[] {
  return [...tiles]
    .filter((t) => Boolean(t.imageUrl || t.url))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, max)
}

import type { CollectionConfig } from 'payload'

import { withCollectionCache } from '../lib/cache/register'
import { Categories } from './Categories'
import { Matches, matchesCache } from './Matches'
import { Media } from './Media'
import { Pages, pagesCache } from './Pages'
import { Posts, postsCache } from './Posts'
import { SocialTiles, socialTilesCache } from './SocialTiles'
import { Sponsors, sponsorsCache } from './Sponsors'
import { Teams, teamsCache } from './Teams'
import { Users } from './Users'

export const collections: CollectionConfig[] = [
  Users,
  Media,
  Categories,
  withCollectionCache(Posts, postsCache),
  withCollectionCache(Pages, pagesCache),
  withCollectionCache(Teams, teamsCache),
  withCollectionCache(Matches, matchesCache),
  withCollectionCache(Sponsors, sponsorsCache),
  withCollectionCache(SocialTiles, socialTilesCache),
]

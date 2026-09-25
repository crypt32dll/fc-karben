import type { CollectionConfig } from 'payload'

import { Categories } from './Categories'
import { Matches } from './Matches'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Redirects } from './Redirects'
import { SocialTiles } from './SocialTiles'
import { Sponsors } from './Sponsors'
import { Teams } from './Teams'
import { Users } from './Users'

export const collections: CollectionConfig[] = [
  Users,
  Media,
  Categories,
  Posts,
  Pages,
  Teams,
  Matches,
  Sponsors,
  Redirects,
  SocialTiles,
]

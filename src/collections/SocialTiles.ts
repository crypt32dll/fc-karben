import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { CACHE_TAGS, createRevalidateHooks } from '../lib/cache/revalidate'

export const SocialTiles: CollectionConfig = {
  slug: 'social-tiles',
  labels: {
    singular: 'Social Tile',
    plural: 'Social Tiles',
  },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'sortOrder', 'active'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: createRevalidateHooks([CACHE_TAGS.socialTiles], ['/']),
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'caption', type: 'text' },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Link to Instagram post or profile' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

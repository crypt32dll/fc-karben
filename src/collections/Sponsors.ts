import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { CACHE_TAGS, type CachePolicy } from '../lib/cache/tags'

export const sponsorsCache: CachePolicy = {
  tags: [CACHE_TAGS.sponsors],
  paths: ['/', '/sponsoren'],
}

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'sortOrder', 'active'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'hauptsponsoren',
      options: [
        { label: 'Hauptsponsoren', value: 'hauptsponsoren' },
        { label: 'Medienpartner', value: 'medienpartner' },
        { label: 'Ausrüster', value: 'ausruester' },
        { label: 'Kooperationspartner', value: 'kooperationspartner' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Website des Sponsors (öffnet in neuem Tab)' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

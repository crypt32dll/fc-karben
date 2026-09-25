import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { CACHE_TAGS, type CachePolicy } from '../lib/cache/tags'

export const matchesCache: CachePolicy = {
  tags: [CACHE_TAGS.matches],
  paths: ['/'],
}

export const Matches: CollectionConfig = {
  slug: 'matches',
  admin: {
    useAsTitle: 'externalId',
    defaultColumns: ['kickoff', 'homeName', 'awayName', 'competition', 'status'],
    description: 'Synced daily from fussball.de via MatchFeed cron — do not edit by hand.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
    {
      name: 'kickoff',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'homeName', type: 'text', required: true },
    { name: 'awayName', type: 'text', required: true },
    { name: 'competition', type: 'text' },
    { name: 'venue', type: 'text' },
    { name: 'homeScore', type: 'number' },
    { name: 'awayScore', type: 'number' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Live', value: 'live' },
        { label: 'Finished', value: 'finished' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'externalId',
      type: 'text',
      index: true,
      unique: true,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'fussballde',
      options: [{ label: 'Fussball.de', value: 'fussballde' }],
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
  ],
}

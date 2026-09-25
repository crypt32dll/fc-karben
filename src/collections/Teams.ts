import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { CACHE_TAGS, type CachePolicy } from '../lib/cache/tags'
import { previewURLForTeam } from '../lib/preview/urls'

export const teamsCache: CachePolicy = {
  tags: [CACHE_TAGS.teams],
  paths: ['/', '/sitemap.xml'],
  pathsFromDoc: (doc) => {
    const slug = (doc as { slug?: string }).slug
    return slug ? [`/${slug}`] : []
  },
}

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'league', 'active'],
    preview: (doc) => previewURLForTeam(doc as { slug?: string }),
    livePreview: {
      url: ({ data }) => previewURLForTeam(data as { slug?: string }),
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'shortLabel',
      type: 'text',
      admin: { description: 'e.g. 01 for grid display' },
    },
    { name: 'league', type: 'text' },
    { name: 'summary', type: 'textarea' },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contacts',
      type: 'array',
      fields: [
        { name: 'role', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    {
      name: 'trainingTimes',
      type: 'textarea',
    },
    {
      name: 'fussballDeId',
      type: 'text',
      admin: {
        description: 'Fussball.de team-id',
      },
    },
    {
      name: 'fussballDeUrl',
      type: 'text',
    },
    {
      name: 'syncMatches',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only 1. Mannschaft should sync MatchFeed',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}

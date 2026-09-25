import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { wpIdField } from '../fields/seo'
import { CACHE_TAGS, type CachePolicy } from '../lib/cache/tags'
import { previewURLForPost } from '../lib/preview/urls'

export const postsCache: CachePolicy = {
  tags: [CACHE_TAGS.posts],
  paths: ['/', '/presse', '/sitemap.xml'],
  pathsFromDoc: (doc) => {
    const slug = (doc as { slug?: string }).slug
    return slug ? [`/presse/${slug}`] : []
  },
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'updatedAt'],
    preview: (doc) => previewURLForPost(doc as { slug?: string }),
    livePreview: {
      url: ({ data }) => previewURLForPost(data as { slug?: string }),
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
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    wpIdField,
  ],
}

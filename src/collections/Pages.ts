import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { pageBlocks } from '../blocks'
import { wpIdField } from '../fields/seo'
import { CACHE_TAGS, type CachePolicy } from '../lib/cache/tags'

export const pagesCache: CachePolicy = {
  tags: [CACHE_TAGS.pages],
  paths: ['/'],
  pathsFromDoc: (doc) => {
    const d = doc as { path?: string; slug?: string }
    const out: string[] = []
    if (d.path?.startsWith('/')) out.push(d.path)
    if (d.slug) out.push(`/${d.slug}`)
    return out
  },
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  versions: {
    drafts: true,
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
      name: 'path',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Canonical path e.g. /verein/vorstand (optional)',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page Builder',
          description: 'Blöcke hinzufügen, sortieren und Seiten frei aufbauen',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              labels: {
                singular: 'Block',
                plural: 'Blöcke',
              },
              blocks: pageBlocks,
              admin: {
                initCollapsed: false,
              },
            },
          ],
        },
        {
          label: 'Klassischer Inhalt',
          description: 'Für migrierte WordPress-Seiten (HTML → Rich Text)',
          fields: [
            {
              name: 'content',
              type: 'richText',
              admin: {
                description: 'Fallback wenn kein Layout mit Blöcken gesetzt ist',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    wpIdField,
  ],
}

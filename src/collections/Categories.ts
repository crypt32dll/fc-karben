import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { wpIdField } from '../fields/seo'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'wpId'],
  },
  access: {
    read: anyone,
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
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
    },
    wpIdField,
  ],
}

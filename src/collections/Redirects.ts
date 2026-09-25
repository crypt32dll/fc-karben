import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '../access'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'permanent'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Legacy path, e.g. /2026/05/18/slug/' },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'Canonical path, e.g. /presse/slug' },
    },
    {
      name: 'permanent',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

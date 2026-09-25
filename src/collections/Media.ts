import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '../access'
import { wpIdField } from '../fields/seo'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    wpIdField,
    {
      name: 'wpSourceUrl',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Original WordPress attachment URL',
      },
    },
  ],
  upload: true,
}

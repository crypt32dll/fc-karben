import type { CollectionConfig } from 'payload'

import { authenticated, isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'name'],
  },
  auth: true,
  access: {
    create: isAdmin,
    read: authenticated,
    update: ({ req: { user }, id }) => {
      if ((user as { role?: string } | null)?.role === 'admin') return true
      return Boolean(user && id === user.id)
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin',
      },
      admin: {
        description: 'Admin = full access; Editor = content only (Media team)',
      },
    },
  ],
  versions: false,
}

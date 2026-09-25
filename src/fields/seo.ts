import type { Field } from 'payload'

/** Shared SEO group for posts and pages */
export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'noIndex', type: 'checkbox', defaultValue: false },
    { name: 'noFollow', type: 'checkbox', defaultValue: false },
    { name: 'canonicalOverride', type: 'text' },
  ],
}

/** WordPress migration key — readonly in admin */
export const wpIdField: Field = {
  name: 'wpId',
  type: 'number',
  index: true,
  unique: true,
  admin: {
    readOnly: true,
    position: 'sidebar',
    description: 'WordPress ID for idempotent migration',
  },
}

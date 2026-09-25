import type { Field } from 'payload'

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

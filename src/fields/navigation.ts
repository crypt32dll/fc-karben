/** Shared Payload field shapes for header/footer navigation arrays. */

const navChildFields = [
  { name: 'label', type: 'text' as const, required: true },
  {
    name: 'href',
    type: 'text' as const,
    required: true,
    admin: { description: 'Pfad oder URL, z. B. /1-mannschaft oder /verein/vorstand' },
  },
]

export const primaryNavField = {
  name: 'primaryNav',
  type: 'array' as const,
  labels: { singular: 'Nav-Punkt', plural: 'Hauptnavigation' },
  admin: {
    description:
      'Hauptnavigation (Header). Leer = Standard (Home, Mannschaften mit Deeplinks, Verein, …).',
  },
  fields: [
    ...navChildFields,
    {
      name: 'children',
      type: 'array' as const,
      labels: { singular: 'Unterpunkt', plural: 'Unterpunkte' },
      fields: navChildFields,
    },
  ],
}

export const footerNavField = {
  name: 'footerNav',
  type: 'array' as const,
  labels: { singular: 'Spalte', plural: 'Footer-Navigation' },
  admin: {
    description: 'Footer-Spalten. Leer = Standard (Verein, Mannschaften, Kontakt).',
  },
  fields: [
    { name: 'heading', type: 'text' as const, required: true },
    {
      name: 'items',
      type: 'array' as const,
      required: true,
      fields: navChildFields,
    },
  ],
}

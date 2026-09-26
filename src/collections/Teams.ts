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
  labels: {
    singular: 'Mannschaft',
    plural: 'Mannschaften',
  },
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
    { name: 'name', type: 'text', required: true, label: 'Name' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'shortLabel',
      type: 'text',
      label: 'Kurzlabel',
      admin: { position: 'sidebar', description: 'z. B. 01 für die Mannschafts-Grid' },
    },
    {
      name: 'league',
      type: 'text',
      label: 'Liga',
      admin: { position: 'sidebar' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Aktiv',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Reihenfolge',
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Über uns',
          description: 'Mannschaftstext und Teamfoto für den ersten Abschnitt',
          fields: [
            { name: 'summary', type: 'textarea', label: 'Kurztext' },
            {
              name: 'content',
              type: 'richText',
              label: 'Inhalt',
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Teamfoto',
            },
          ],
        },
        {
          label: 'Kontakt',
          description: 'Erscheint im Abschnitt „Kontakt“ auf der Mannschaftsseite',
          fields: [
            {
              name: 'contactContent',
              type: 'richText',
              label: 'Kontakttext',
              admin: {
                description:
                  'Freitext für den Kontakt-Bereich (Trainer, Ansprechpartner, Hinweise).',
              },
            },
            {
              name: 'trainingTimes',
              type: 'textarea',
              label: 'Trainingszeiten',
              admin: {
                description: 'Optional, wird oberhalb der Ansprechpartner angezeigt.',
              },
            },
            {
              name: 'contacts',
              type: 'array',
              label: 'Ansprechpartner',
              labels: {
                singular: 'Ansprechpartner',
                plural: 'Ansprechpartner',
              },
              admin: {
                description: 'Strukturierte Kontakte (optional, zusätzlich zum Kontakttext).',
              },
              fields: [
                { name: 'role', type: 'text', label: 'Rolle' },
                { name: 'name', type: 'text', label: 'Name' },
                { name: 'phone', type: 'text', label: 'Telefon' },
                { name: 'email', type: 'email', label: 'E-Mail' },
              ],
            },
          ],
        },
        {
          label: 'Fussball.de',
          description: 'Widget-IDs und Links für Spielplan, Tabelle und Spielberichte',
          fields: [
            {
              name: 'fussballDeId',
              type: 'text',
              label: 'Team-ID',
              admin: {
                description: 'Fussball.de team-id',
              },
            },
            {
              name: 'fussballDeUrl',
              type: 'text',
              label: 'Mannschafts-URL',
            },
            {
              name: 'widgetSpielplanId',
              type: 'text',
              label: 'Widget Spielplan',
              admin: {
                description: 'data-id für type team-matches',
              },
            },
            {
              name: 'widgetTabelleId',
              type: 'text',
              label: 'Widget Tabelle',
              admin: {
                description: 'data-id für type table',
              },
            },
            {
              name: 'widgetSpielberichteId',
              type: 'text',
              label: 'Widget Spielberichte',
              admin: {
                description: 'data-id für type news (Spielberichte)',
              },
            },
            {
              name: 'reportCategorySlug',
              type: 'text',
              label: 'Presse-Kategorie',
              admin: {
                description:
                  'Optional: Kategorie-Slug für zusätzliche CMS-Spielberichte (z. B. spielberichte-1-mannschaft)',
              },
            },
            {
              name: 'syncMatches',
              type: 'checkbox',
              defaultValue: false,
              label: 'MatchFeed synchronisieren',
              admin: {
                description: 'Nur für die 1. Mannschaft aktivieren',
              },
            },
          ],
        },
      ],
    },
  ],
}

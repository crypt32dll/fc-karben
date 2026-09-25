import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '../access'
import { pageBlocks } from '../blocks'
import { footerNavField, primaryNavField } from '../fields/navigation'
import { CACHE_TAGS, type CachePolicy } from '../lib/cache/tags'
import { clubAppRoutes, hrefForPage } from '../lib/club-paths'
import { previewURLForHomepage } from '../lib/preview/urls'

export const siteSettingsCache: CachePolicy = {
  tags: [CACHE_TAGS.siteSettings],
  paths: ['/'],
}

export const homepageCache: CachePolicy = {
  tags: [CACHE_TAGS.homepage],
  paths: ['/', '/sitemap.xml'],
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: 'clubName',
      type: 'text',
      defaultValue: 'FC Karben e.V.',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Fußball in Karben seit 2015',
    },
    {
      name: 'foundingYear',
      type: 'number',
      defaultValue: 2015,
    },
    {
      name: 'email',
      type: 'email',
      defaultValue: 'info@fc-karben.de',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
      defaultValue: 'Karl-Liebknecht-Str. 48, 61184 Karben',
    },
    {
      name: 'venue',
      type: 'text',
      defaultValue: 'Günter-Reutzel-Sportfeld',
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text', defaultValue: 'https://www.instagram.com/fckarben/' },
        { name: 'facebook', type: 'text', defaultValue: 'https://www.facebook.com/FCKarben' },
        { name: 'tiktok', type: 'text' },
      ],
    },
    primaryNavField,
    footerNavField,
    {
      name: 'gscVerification',
      type: 'text',
      admin: {
        description: 'Google Search Console HTML tag content value',
      },
    },
  ],
}

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    preview: () => previewURLForHomepage(),
    livePreview: {
      url: () => previewURLForHomepage(),
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero & Defaults',
          fields: [
            {
              name: 'heroEyebrow',
              type: 'text',
              defaultValue: 'Gruppenliga · Saison 2025/26',
            },
            {
              name: 'heroTitle',
              type: 'text',
              defaultValue: 'Mit Leidenschaft für Karben.',
            },
            {
              name: 'heroLead',
              type: 'textarea',
              defaultValue:
                'Der FC Karben e.V. ist die fußballerische Heimat der Stadt Karben — vom Bambini-Training bis zur ersten Mannschaft. Gegründet 2015, getragen von echter Vereinsliebe.',
            },
            {
              name: 'heroPrimaryCta',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Jetzt Mitglied werden' },
                { name: 'href', type: 'text', defaultValue: hrefForPage('mitgliedWerden') },
              ],
            },
            {
              name: 'heroSecondaryCta',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Mannschaften ansehen' },
                { name: 'href', type: 'text', defaultValue: clubAppRoutes.teamsSection },
              ],
            },
            {
              name: 'featuredPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
            },
            {
              name: 'vereinIntro',
              type: 'textarea',
              defaultValue:
                'Der FC Karben e.V. wurde im Mai 2015 gegründet und ist seitdem als fußballerische Heimat in der Stadt Karben gewachsen.',
            },
          ],
        },
        {
          label: 'Page Builder (optional)',
          description:
            'Wenn Blöcke gesetzt sind, ersetzen sie die Standard-Homepagesektionen. Leer = Demo-Layout.',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              labels: { singular: 'Block', plural: 'Blöcke' },
              blocks: pageBlocks,
            },
          ],
        },
      ],
    },
  ],
}

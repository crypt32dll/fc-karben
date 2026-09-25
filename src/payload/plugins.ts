import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Plugin } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { CACHE_TAGS, createRevalidateHooks } from '../lib/cache/revalidate'
import { pathForDoc } from '../lib/club-paths'
import { searchablePlainText } from '../lib/search/searchable-text'
import { generateSeoDescription, generateSeoTitle, getPublicSiteURL } from '../lib/seo/generate'

export async function buildPlugins(): Promise<Plugin[]> {
  const plugins: Plugin[] = []

  plugins.push(
    seoPlugin({
      collections: ['pages', 'posts', 'teams'],
      globals: ['homepage', 'site-settings'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => generateSeoTitle(doc as { title?: string; name?: string }),
      generateDescription: ({ doc }) =>
        generateSeoDescription(
          doc as {
            title?: string
            name?: string
            excerpt?: string
            summary?: string
            content?: unknown
          },
        ),
      generateURL: ({ doc, collectionSlug, globalSlug }) => {
        const siteUrl = getPublicSiteURL()
        if (globalSlug === 'homepage') return siteUrl
        if (globalSlug === 'site-settings') return siteUrl
        return `${siteUrl}${pathForDoc({
          ...(doc as { slug?: string; path?: string }),
          collectionSlug: collectionSlug as string | undefined,
        })}`
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Von Suchmaschinen ausschließen' },
        },
        {
          name: 'noFollow',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'canonicalOverride',
          type: 'text',
          admin: { description: 'Optionaler Canonical-Pfad oder absolute URL' },
        },
      ],
    }),
  )

  plugins.push(
    redirectsPlugin({
      collections: ['pages', 'posts'],
      redirectTypes: ['301', '302', '307', '308'],
      overrides: {
        admin: {
          useAsTitle: 'from',
          defaultColumns: ['from', 'to', 'type', 'updatedAt'],
        },
        access: {
          read: () => true,
          create: isAdminOrEditor,
          update: isAdminOrEditor,
          delete: isAdmin,
        },
        hooks: createRevalidateHooks({ tags: [CACHE_TAGS.redirects] }),
      },
    }),
  )

  plugins.push(
    searchPlugin({
      collections: ['posts', 'pages'],
      defaultPriorities: {
        posts: 10,
        pages: 20,
      },
      beforeSync: ({ searchDoc, originalDoc }) => {
        const doc = originalDoc as {
          title?: string
          excerpt?: string
          summary?: string
          slug?: string
          path?: string
          content?: unknown
          layout?: unknown
        }
        return {
          ...searchDoc,
          title: doc.title || searchDoc.title,
          excerpt: doc.excerpt || doc.summary || undefined,
          slug: doc.slug,
          path: doc.path,
          body: searchablePlainText(doc) || undefined,
        }
      },
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'excerpt', type: 'textarea' },
          { name: 'slug', type: 'text' },
          { name: 'path', type: 'text' },
          {
            name: 'body',
            type: 'textarea',
            admin: {
              readOnly: true,
              description: 'Indexierter Volltext (Lexical + Blöcke) für die Site-Suche',
            },
          },
        ],
      },
    }),
  )

  plugins.push(
    importExportPlugin({
      collections: [
        { slug: 'posts', export: { disableJobsQueue: true }, import: { disableJobsQueue: true } },
        { slug: 'pages', export: { disableJobsQueue: true }, import: { disableJobsQueue: true } },
        { slug: 'teams', export: { disableJobsQueue: true }, import: { disableJobsQueue: true } },
        {
          slug: 'sponsors',
          export: { disableJobsQueue: true },
          import: { disableJobsQueue: true },
        },
      ],
    }),
  )

  plugins.push(
    mcpPlugin({
      disabled: process.env.ENABLE_PAYLOAD_MCP !== 'true',
      collections: {
        posts: {
          description: 'Presse-Beiträge (Beiträge)',
          enabled: { find: true, create: false, update: true, delete: false },
        },
        pages: {
          description: 'Statische Seiten (Seiten)',
          enabled: { find: true, create: false, update: true, delete: false },
        },
        teams: {
          description: 'Mannschaften',
          enabled: { find: true, create: false, update: true, delete: false },
        },
      },
      globals: {
        homepage: {
          description: 'Homepage-Inhalt und Page Builder',
          enabled: { find: true, update: true },
        },
        'site-settings': {
          description: 'Vereins-Stammdaten und Default-SEO',
          enabled: { find: true, update: false },
        },
      },
    }),
  )

  // Always register so `generate:importmap` includes AdminErrorBoundary (needed on Vercel with SENTRY_DSN).
  {
    const Sentry = await import('@sentry/nextjs')
    plugins.push(
      sentryPlugin({
        enabled: Boolean(process.env.SENTRY_DSN),
        Sentry,
      }),
    )
  }

  return plugins
}

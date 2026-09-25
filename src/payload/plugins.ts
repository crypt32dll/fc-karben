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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fc-karben.de'

export async function buildPlugins(r2Configured: boolean): Promise<Plugin[]> {
  const plugins: Plugin[] = []

  plugins.push(
    seoPlugin({
      collections: ['pages', 'posts', 'teams'],
      globals: ['homepage', 'site-settings'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => {
        const title =
          (doc as { title?: string; name?: string }).title ||
          (doc as { name?: string }).name ||
          'FC Karben'
        return `${title} | FC Karben`
      },
      generateDescription: ({ doc }) => {
        const d = doc as {
          excerpt?: string
          summary?: string
          meta?: { description?: string }
        }
        return d.excerpt || d.summary || d.meta?.description || ''
      },
      generateURL: ({ doc, collectionSlug, globalSlug }) => {
        if (globalSlug === 'homepage') return siteUrl
        if (globalSlug === 'site-settings') return siteUrl
        return `${siteUrl.replace(/\/$/, '')}${pathForDoc({
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
      beforeSync: ({ searchDoc, originalDoc }) => ({
        ...searchDoc,
        title: (originalDoc as { title?: string }).title || searchDoc.title,
        excerpt:
          (originalDoc as { excerpt?: string; summary?: string }).excerpt ||
          (originalDoc as { summary?: string }).summary ||
          undefined,
        slug: (originalDoc as { slug?: string }).slug,
        path: (originalDoc as { path?: string }).path,
      }),
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'excerpt', type: 'textarea' },
          { name: 'slug', type: 'text' },
          { name: 'path', type: 'text' },
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

  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs')
    plugins.push(
      sentryPlugin({
        enabled: true,
        Sentry,
      }),
    )
  }

  // r2Configured is applied by caller via s3Storage — kept for API symmetry
  void r2Configured

  return plugins
}

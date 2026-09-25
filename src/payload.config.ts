import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { EXPERIMENTAL_TableFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { collections } from './collections'
import { Homepage, homepageCache, SiteSettings, siteSettingsCache } from './globals/SiteSettings'
import { withGlobalCache } from './lib/cache/register'
import { normalizePostgresUrl } from './lib/postgres-url'
import { buildPlugins } from './payload/plugins'
import { isSftpConfigured, sftpStorage } from './storage/sftp-storage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const rawConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!rawConnectionString) {
  throw new Error('Missing POSTGRES_URL (or DATABASE_URL) — set it in .env')
}
const connectionString = normalizePostgresUrl(rawConnectionString)

const resendConfigured = Boolean(process.env.RESEND_API_KEY)
const sftpConfigured = isSftpConfigured()

if (process.env.VERCEL && !sftpConfigured) {
  throw new Error(
    'Vercel deploy requires SFTP_HOST, SFTP_USER, and SFTP_PASSWORD (1&1 media webspace)',
  )
}

const plugins = await buildPlugins()

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— FC Karben CMS',
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections,
  globals: [
    withGlobalCache(SiteSettings, siteSettingsCache),
    withGlobalCache(Homepage, homepageCache),
  ],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  }),
  // Resend is preferred on Vercel (lightweight). Without RESEND_API_KEY, Payload logs to console.
  // https://payloadcms.com/docs/email/overview
  ...(resendConfigured
    ? {
        email: resendAdapter({
          defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@fc-karben.de',
          defaultFromName: process.env.EMAIL_FROM_NAME || 'FC Karben',
          apiKey: process.env.RESEND_API_KEY as string,
        }),
      }
    : {}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString,
    },
    // Set PAYLOAD_DATABASE_PUSH=false to skip interactive drizzle prompts (e.g. CI).
    // Default: push in non-production so local/dev schema stays in sync.
    push: process.env.PAYLOAD_DATABASE_PUSH
      ? process.env.PAYLOAD_DATABASE_PUSH !== 'false'
      : process.env.NODE_ENV !== 'production',
  }),
  plugins: [
    ...plugins,
    ...(sftpConfigured
      ? [
          sftpStorage({
            collections: {
              media: true,
            },
          }),
        ]
      : []),
  ],
})

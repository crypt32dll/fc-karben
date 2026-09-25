import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { collections } from './collections'
import { Homepage, homepageCache, SiteSettings, siteSettingsCache } from './globals/SiteSettings'
import { withGlobalCache } from './lib/cache/register'
import { normalizePostgresUrl } from './lib/postgres-url'
import { buildPlugins } from './payload/plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const rawConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!rawConnectionString) {
  throw new Error('Missing POSTGRES_URL (or DATABASE_URL) — set it in .env')
}
const connectionString = normalizePostgresUrl(rawConnectionString)

const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const resendConfigured = Boolean(process.env.RESEND_API_KEY)

if (process.env.VERCEL && !blobConfigured) {
  throw new Error(
    'Vercel deploy requires BLOB_READ_WRITE_TOKEN (create a Blob store in the Vercel project)',
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
  },
  collections,
  globals: [
    withGlobalCache(SiteSettings, siteSettingsCache),
    withGlobalCache(Homepage, homepageCache),
  ],
  editor: lexicalEditor(),
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
    ...(blobConfigured
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
              exports: true,
              imports: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN as string,
            // Bypass ~4.5MB Vercel function body limit for admin uploads
            clientUploads: true,
          }),
        ]
      : []),
  ],
})

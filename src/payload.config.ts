import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { collections } from './collections'
import { Homepage, homepageCache, SiteSettings, siteSettingsCache } from './globals/SiteSettings'
import { withGlobalCache } from './lib/cache/register'
import { buildPlugins } from './payload/plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Missing POSTGRES_URL (or DATABASE_URL) — set it in .env')
}

const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

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

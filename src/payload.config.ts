import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
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

const r2Configured = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT,
)

const plugins = await buildPlugins(r2Configured)

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
    ...(r2Configured
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.R2_BUCKET as string,
            config: {
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
              },
              region: process.env.R2_REGION || 'auto',
              endpoint: process.env.R2_ENDPOINT,
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
})

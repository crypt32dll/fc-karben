import { loadEnvFile } from 'node:process'

import { getPayload } from 'payload'

try {
  loadEnvFile('.env')
} catch {
  // optional
}

const { default: config } = await import('../src/payload.config.ts')
const payload = await getPayload({ config })

const posts = await payload.find({
  collection: 'posts',
  limit: 8,
  depth: 1,
  overrideAccess: true,
  sort: '-publishedAt',
})

const withFeat = await payload.find({
  collection: 'posts',
  limit: 0,
  overrideAccess: true,
  where: { featuredImage: { exists: true } },
})

const media = await payload.find({ collection: 'media', limit: 5, overrideAccess: true })

console.log(
  JSON.stringify(
    {
      postsTotal: posts.totalDocs,
      withFeaturedTotal: withFeat.totalDocs,
      mediaTotal: media.totalDocs,
      sample: posts.docs.map((d) => {
        const fi = d.featuredImage
        return {
          slug: d.slug,
          wpId: d.wpId,
          featuredImage:
            fi && typeof fi === 'object'
              ? { id: fi.id, url: fi.url, wpSourceUrl: fi.wpSourceUrl }
              : fi,
        }
      }),
      mediaSample: media.docs.map((m) => ({
        id: m.id,
        wpId: m.wpId,
        url: m.url,
        wpSourceUrl: m.wpSourceUrl,
      })),
    },
    null,
    2,
  ),
)

process.exit(0)

import { z } from 'zod'

export const catalogSeoSchema = z.object({
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  noIndex: z.boolean().nullable().optional(),
  noFollow: z.boolean().nullable().optional(),
  canonicalOverride: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
})

export type CatalogSeoParsed = z.infer<typeof catalogSeoSchema>

export const searchHitSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string().nullable().optional(),
  path: z.string(),
  relationTo: z.string(),
})

export type SearchHit = z.infer<typeof searchHitSchema>

export const searchHitsSchema = z.array(searchHitSchema)

/** Payload SEO plugin `meta` (or legacy `seo`) → CatalogSeo */
export const payloadMetaSchema = z
  .object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    image: z.unknown().optional().nullable(),
    ogImage: z.unknown().optional().nullable(),
    noIndex: z.boolean().optional().nullable(),
    noFollow: z.boolean().optional().nullable(),
    canonicalOverride: z.string().optional().nullable(),
  })
  .transform((meta): CatalogSeoParsed => {
    const og = meta.image ?? meta.ogImage
    let ogImageUrl: string | null = null
    if (og && typeof og === 'object') {
      const media = og as { url?: string | null; wpSourceUrl?: string | null }
      const raw =
        (typeof media.url === 'string' && media.url) ||
        (typeof media.wpSourceUrl === 'string' && media.wpSourceUrl) ||
        null
      ogImageUrl = raw && !/\.svg(?:$|\?)/i.test(raw) ? raw : null
    }
    return {
      metaTitle: meta.title || meta.metaTitle || null,
      metaDescription: meta.description || meta.metaDescription || null,
      noIndex: Boolean(meta.noIndex),
      noFollow: Boolean(meta.noFollow),
      canonicalOverride: meta.canonicalOverride || null,
      ogImageUrl,
    }
  })

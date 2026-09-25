import { z } from 'zod'

import { mapCatalogBody } from '../content-catalog/body'

const idField = z.preprocess((v) => {
  if (v == null || v === '') return undefined
  return String(v)
}, z.string().optional())

const optStr = z.preprocess((v) => {
  if (v == null) return undefined
  const s = String(v).trim()
  return s.length > 0 ? s : undefined
}, z.string().optional())

const reqStr = z.preprocess((v) => {
  if (v == null) return ''
  return String(v).trim()
}, z.string().min(1))

const ctaRaw = z
  .object({
    label: optStr,
    href: optStr,
  })
  .optional()
  .nullable()

function mediaFields(value: unknown): { url?: string; alt?: string } {
  if (!value || typeof value !== 'object') return {}
  const m = value as { url?: string | null; alt?: string | null }
  const url = m.url?.trim() || undefined
  const alt = m.alt?.trim() || undefined
  return { url, alt }
}

function relationId(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return String(value)
}

/** Raw Payload block → LayoutView via Zod transform (single adapter). */
export const payloadLayoutBlockSchema = z.discriminatedUnion('blockType', [
  z
    .object({
      blockType: z.literal('hero'),
      id: idField,
      eyebrow: optStr,
      title: reqStr,
      lead: optStr,
      primaryCta: ctaRaw,
      secondaryCta: ctaRaw,
    })
    .transform((b) => ({
      blockType: 'hero' as const,
      id: b.id,
      eyebrow: b.eyebrow,
      title: b.title,
      lead: b.lead,
      primaryCta: b.primaryCta ? { label: b.primaryCta.label, href: b.primaryCta.href } : undefined,
      secondaryCta: b.secondaryCta
        ? { label: b.secondaryCta.label, href: b.secondaryCta.href }
        : undefined,
    })),
  z
    .object({
      blockType: z.literal('richText'),
      id: idField,
      heading: optStr,
      body: z.unknown().optional(),
    })
    .transform((b) => ({
      blockType: 'richText' as const,
      id: b.id,
      heading: b.heading,
      body: mapCatalogBody(b.body),
    })),
  z
    .object({
      blockType: z.literal('cta'),
      id: idField,
      heading: reqStr,
      text: optStr,
      buttonLabel: reqStr,
      buttonHref: reqStr,
      variant: z.enum(['navy', 'pitch', 'outline']).optional().nullable(),
    })
    .transform((b) => ({
      blockType: 'cta' as const,
      id: b.id,
      heading: b.heading,
      text: b.text,
      buttonLabel: b.buttonLabel,
      buttonHref: b.buttonHref,
      variant: b.variant ?? 'navy',
    })),
  z
    .object({
      blockType: z.literal('image'),
      id: idField,
      image: z.unknown().optional(),
      caption: optStr,
    })
    .transform((b) => {
      const media = mediaFields(b.image)
      return {
        blockType: 'image' as const,
        id: b.id,
        imageUrl: media.url,
        imageAlt: media.alt,
        caption: b.caption,
      }
    }),
  z
    .object({
      blockType: z.literal('teamGrid'),
      id: idField,
      eyebrow: optStr,
      heading: optStr,
      teams: z.unknown().optional(),
    })
    .transform((b) => {
      const teamIds = Array.isArray(b.teams)
        ? b.teams.map(relationId).filter((x): x is string => Boolean(x))
        : undefined
      return {
        blockType: 'teamGrid' as const,
        id: b.id,
        eyebrow: b.eyebrow,
        heading: b.heading,
        ...(teamIds?.length ? { teamIds } : {}),
      }
    }),
  z
    .object({
      blockType: z.literal('postList'),
      id: idField,
      eyebrow: optStr,
      heading: optStr,
      limit: z.number().optional().nullable(),
      category: z.unknown().optional(),
    })
    .transform((b) => {
      const categoryId = relationId(b.category)
      return {
        blockType: 'postList' as const,
        id: b.id,
        eyebrow: b.eyebrow,
        heading: b.heading,
        ...(b.limit != null ? { limit: b.limit } : {}),
        ...(categoryId ? { categoryId } : {}),
      }
    }),
  z
    .object({
      blockType: z.literal('scoreboard'),
      id: idField,
      label: optStr,
      fallbackText: optStr,
    })
    .transform((b) => ({
      blockType: 'scoreboard' as const,
      id: b.id,
      label: b.label,
      fallbackText: b.fallbackText,
    })),
  z
    .object({
      blockType: z.literal('socialGrid'),
      id: idField,
      eyebrow: optStr,
      heading: optStr,
      maxTiles: z.number().optional().nullable(),
    })
    .transform((b) => ({
      blockType: 'socialGrid' as const,
      id: b.id,
      eyebrow: b.eyebrow,
      heading: b.heading,
      maxTiles: b.maxTiles ?? undefined,
    })),
  z
    .object({
      blockType: z.literal('sponsors'),
      id: idField,
      eyebrow: optStr,
    })
    .transform((b) => ({
      blockType: 'sponsors' as const,
      id: b.id,
      eyebrow: b.eyebrow,
    })),
  z
    .object({
      blockType: z.literal('downloads'),
      id: idField,
      heading: optStr,
      files: z.unknown().optional(),
    })
    .transform((b) => {
      const filesRaw = Array.isArray(b.files) ? b.files : []
      const files = filesRaw.flatMap((row) => {
        if (!row || typeof row !== 'object') return []
        const r = row as { label?: string; file?: unknown }
        const label = typeof r.label === 'string' ? r.label.trim() : ''
        if (!label) return []
        const file = mediaFields(r.file)
        return [{ label, url: file.url }]
      })
      return {
        blockType: 'downloads' as const,
        id: b.id,
        heading: b.heading,
        files: files.length ? files : undefined,
      }
    }),
  z
    .object({
      blockType: z.literal('board'),
      id: idField,
      heading: optStr,
      members: z.unknown().optional(),
    })
    .transform((b) => {
      const membersRaw = Array.isArray(b.members) ? b.members : []
      const members = membersRaw.flatMap((row) => {
        if (!row || typeof row !== 'object') return []
        const r = row as { role?: string; name?: string; detail?: string }
        const role = typeof r.role === 'string' ? r.role.trim() : ''
        const name = typeof r.name === 'string' ? r.name.trim() : ''
        if (!role || !name) return []
        const detail = typeof r.detail === 'string' ? r.detail.trim() : undefined
        return [{ role, name, detail: detail || undefined }]
      })
      return {
        blockType: 'board' as const,
        id: b.id,
        heading: b.heading,
        members: members.length ? members : undefined,
      }
    }),
  z
    .object({
      blockType: z.literal('spacer'),
      id: idField,
      size: z.enum(['sm', 'md', 'lg']).optional().nullable(),
    })
    .transform((b) => ({
      blockType: 'spacer' as const,
      id: b.id,
      size: b.size ?? 'md',
    })),
])

export type LayoutBlockView = z.output<typeof payloadLayoutBlockSchema>
export type PageLayoutView = LayoutBlockView[]

export type HeroBlockView = Extract<LayoutBlockView, { blockType: 'hero' }>
export type RichTextBlockView = Extract<LayoutBlockView, { blockType: 'richText' }>
export type CtaBlockView = Extract<LayoutBlockView, { blockType: 'cta' }>
export type ImageBlockView = Extract<LayoutBlockView, { blockType: 'image' }>
export type TeamGridBlockView = Extract<LayoutBlockView, { blockType: 'teamGrid' }>
export type PostListBlockView = Extract<LayoutBlockView, { blockType: 'postList' }>
export type ScoreboardBlockView = Extract<LayoutBlockView, { blockType: 'scoreboard' }>
export type SocialGridBlockView = Extract<LayoutBlockView, { blockType: 'socialGrid' }>
export type SponsorsBlockView = Extract<LayoutBlockView, { blockType: 'sponsors' }>
export type DownloadsBlockView = Extract<LayoutBlockView, { blockType: 'downloads' }>
export type BoardBlockView = Extract<LayoutBlockView, { blockType: 'board' }>
export type SpacerBlockView = Extract<LayoutBlockView, { blockType: 'spacer' }>

/** @deprecated use payloadLayoutBlockSchema — kept for tests that import layoutBlockViewSchema */
export const layoutBlockViewSchema = payloadLayoutBlockSchema
export const pageLayoutViewSchema = z.array(payloadLayoutBlockSchema)

import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'lead', type: 'textarea' },
    {
      name: 'primaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'richText', required: true },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to Action', plural: 'CTAs' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonHref', type: 'text', required: true },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'navy',
      options: [
        { label: 'Navy', value: 'navy' },
        { label: 'Pitch', value: 'pitch' },
        { label: 'Outline', value: 'outline' },
      ],
    },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Bild', plural: 'Bilder' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'caption', type: 'text' },
  ],
}

export const TeamGridBlock: Block = {
  slug: 'teamGrid',
  labels: { singular: 'Mannschaften-Grid', plural: 'Mannschaften-Grids' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Unsere Teams' },
    { name: 'heading', type: 'text', defaultValue: 'Mannschaften' },
    {
      name: 'teams',
      type: 'relationship',
      relationTo: 'teams',
      hasMany: true,
      admin: {
        description: 'Leer = alle aktiven Mannschaften',
      },
    },
  ],
}

export const PostListBlock: Block = {
  slug: 'postList',
  labels: { singular: 'Beitrags-Liste', plural: 'Beitrags-Listen' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Aktuelles' },
    { name: 'heading', type: 'text', defaultValue: 'Presse' },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 24,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { description: 'Optional filtern' },
    },
  ],
}

export const ScoreboardBlock: Block = {
  slug: 'scoreboard',
  labels: { singular: 'Nächstes Spiel', plural: 'Scoreboards' },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Nächstes Spiel',
    },
    {
      name: 'fallbackText',
      type: 'text',
      defaultValue: 'Spielplan folgt',
    },
  ],
}

export const SocialGridBlock: Block = {
  slug: 'socialGrid',
  labels: { singular: 'Social Grid', plural: 'Social Grids' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Live von Instagram' },
    { name: 'heading', type: 'text', defaultValue: 'Auf Social Media' },
    {
      name: 'maxTiles',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 12,
    },
  ],
}

export const SponsorsBlock: Block = {
  slug: 'sponsors',
  labels: { singular: 'Sponsoren', plural: 'Sponsoren' },
  fields: [{ name: 'eyebrow', type: 'text', defaultValue: 'Unsere Sponsoren' }],
}

export const DownloadsBlock: Block = {
  slug: 'downloads',
  labels: { singular: 'Downloads', plural: 'Downloads' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Formulare' },
    {
      name: 'files',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

export const BoardBlock: Block = {
  slug: 'board',
  labels: { singular: 'Vorstand / Personen', plural: 'Vorstand' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Vorstand' },
    {
      name: 'members',
      type: 'array',
      fields: [
        { name: 'role', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'detail', type: 'text' },
      ],
    },
  ],
}

export const SpacerBlock: Block = {
  slug: 'spacer',
  labels: { singular: 'Abstand', plural: 'Abstände' },
  fields: [
    {
      name: 'size',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'Klein', value: 'sm' },
        { label: 'Mittel', value: 'md' },
        { label: 'Groß', value: 'lg' },
      ],
    },
  ],
}

/** Blocks available to editors in the page builder */
export const pageBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  CtaBlock,
  ImageBlock,
  TeamGridBlock,
  PostListBlock,
  ScoreboardBlock,
  SocialGridBlock,
  SponsorsBlock,
  DownloadsBlock,
  BoardBlock,
  SpacerBlock,
]

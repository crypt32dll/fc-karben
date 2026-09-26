import Image from 'next/image'
import type { ReactNode } from 'react'

import { FeaturedMedia } from '@/components/cms/FeaturedMedia'
import { LexicalContent } from '@/components/cms/LexicalContent'
import { MotionPressable, Reveal } from '@/components/motion/Reveal'
import { clubAppRoutes, hrefForPage } from '@/lib/club-paths'
import type { CatalogSponsor, CatalogTeam } from '@/lib/content-catalog'
import type { MatchDto } from '@/lib/match-feed'
import type {
  BoardBlockView,
  CtaBlockView,
  DownloadsBlockView,
  HeroBlockView,
  ImageBlockView,
  LayoutBlockView,
  PostListBlockView,
  RichTextBlockView,
  ScoreboardBlockView,
  SocialGridBlockView,
  SpacerBlockView,
  SponsorsBlockView,
  TeamGridBlockView,
} from '@/lib/page-builder'
import { instagramProfileUrl, type SocialTileDto, selectSocialTiles } from '@/lib/social-feed'

export type RenderContext = {
  nextMatch?: MatchDto | null
  socialTiles?: SocialTileDto[]
  notices?: Array<{
    title: string
    publishedAt?: string | null
    path: string
    featuredImageUrl?: string | null
    featuredImageAlt?: string | null
  }>
  teams?: CatalogTeam[]
  sponsors?: CatalogSponsor[]
}

function Wrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`py-16 md:py-22 ${className}`}>
      <Reveal className="mx-auto max-w-[1120px] px-8">{children}</Reveal>
    </section>
  )
}

export function RenderBlocks({
  blocks,
  context = {},
}: {
  blocks: LayoutBlockView[] | null | undefined
  context?: RenderContext
}) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id || `${block.blockType}-${index}`
        switch (block.blockType) {
          case 'hero':
            return <HeroFromBlock key={key} block={block} />
          case 'richText':
            return <RichTextFromBlock key={key} block={block} />
          case 'cta':
            return <CtaFromBlock key={key} block={block} />
          case 'teamGrid':
            return <TeamGridFromBlock key={key} block={block} teams={context.teams || []} />
          case 'scoreboard':
            return <ScoreboardFromBlock key={key} block={block} match={context.nextMatch ?? null} />
          case 'socialGrid':
            return (
              <SocialGridFromBlock
                key={key}
                block={block}
                tiles={selectSocialTiles(context.socialTiles || [], block.maxTiles ?? 6)}
                notices={context.notices || []}
              />
            )
          case 'sponsors':
            return <SponsorsFromBlock key={key} block={block} sponsors={context.sponsors || []} />
          case 'board':
            return <BoardFromBlock key={key} block={block} />
          case 'downloads':
            return <DownloadsFromBlock key={key} block={block} />
          case 'spacer':
            return <SpacerFromBlock key={key} block={block} />
          case 'postList':
            return <PostListFromBlock key={key} block={block} notices={context.notices} />
          case 'image':
            return <ImageFromBlock key={key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}

function HeroFromBlock({ block }: { block: HeroBlockView }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <Reveal immediate className="relative z-10 mx-auto max-w-[1120px] px-8 pb-16 pt-24">
        {block.eyebrow ? (
          <p className="mb-4 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-[#b9bade]">
            {block.eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-[640px] text-[clamp(42px,7vw,76px)] text-white">{block.title}</h1>
        {block.lead ? (
          <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-[#cfd0e8]">
            {block.lead}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3.5">
          {block.primaryCta?.href && block.primaryCta.label ? (
            <MotionPressable>
              <a
                href={block.primaryCta.href}
                className="inline-flex min-h-11 items-center rounded-[2px] bg-white px-6 py-3.5 text-sm font-semibold text-navy transition-colors motion-reduce:transition-none hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-paper"
              >
                {block.primaryCta.label}
              </a>
            </MotionPressable>
          ) : null}
          {block.secondaryCta?.href && block.secondaryCta.label ? (
            <MotionPressable>
              <a
                href={block.secondaryCta.href}
                className="inline-flex min-h-11 items-center rounded-[2px] border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors motion-reduce:transition-none hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-white/15"
              >
                {block.secondaryCta.label}
              </a>
            </MotionPressable>
          ) : null}
        </div>
      </Reveal>
    </section>
  )
}

function RichTextFromBlock({ block }: { block: RichTextBlockView }) {
  return (
    <Wrap>
      {block.heading ? <h2 className="mb-6 text-[38px] text-navy">{block.heading}</h2> : null}
      <LexicalContent data={block.body} />
    </Wrap>
  )
}

function CtaFromBlock({ block }: { block: CtaBlockView }) {
  const bg =
    block.variant === 'pitch'
      ? 'bg-pitch text-white'
      : block.variant === 'outline'
        ? 'border border-line bg-white text-navy'
        : 'bg-navy text-white'
  return (
    <Wrap>
      <div className={`rounded-[2px] p-10 ${bg}`}>
        <h2 className="text-3xl">{block.heading}</h2>
        {block.text ? <p className="mt-3 max-w-xl opacity-90">{block.text}</p> : null}
        <a
          href={block.buttonHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-[2px] bg-white px-5 py-3 text-sm font-semibold text-navy transition-colors motion-reduce:transition-none hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-paper"
        >
          {block.buttonLabel}
        </a>
      </div>
    </Wrap>
  )
}

function TeamGridFromBlock({ block, teams }: { block: TeamGridBlockView; teams: CatalogTeam[] }) {
  const filtered = block.teamIds?.length
    ? teams.filter((t) => block.teamIds?.includes(t.id))
    : teams
  if (!filtered.length) return null
  return (
    <Wrap>
      <div id="mannschaften" className="scroll-mt-[var(--header-height)]">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-4">
          <div>
            {block.eyebrow ? (
              <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
                {block.eyebrow}
              </p>
            ) : null}
            <h2 className="text-[38px] text-navy">{block.heading || 'Mannschaften'}</h2>
          </div>
          <a
            href={clubAppRoutes.teamsSection}
            className="inline-flex min-h-11 items-center border-b border-navy pb-0.5 text-sm font-semibold text-navy transition-opacity motion-reduce:transition-none hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-70"
          >
            Alle Mannschaften →
          </a>
        </div>
        <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {filtered.slice(0, 4).map((team) => (
            <MotionPressable key={team.id}>
              <a
                href={team.path}
                className="club-interactive block bg-white p-7 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:-outline-offset-2 focus-visible:outline-navy active:bg-paper"
              >
                <div className="mb-3.5 font-accent text-[13px] text-pitch">{team.shortLabel}</div>
                <h3 className="mb-1.5 text-2xl text-navy">{team.name}</h3>
                <p className="text-[13px] text-ink-soft">{team.league}</p>
              </a>
            </MotionPressable>
          ))}
        </div>
      </div>
    </Wrap>
  )
}

function ScoreboardFromBlock({
  block,
  match,
}: {
  block: ScoreboardBlockView
  match: MatchDto | null
}) {
  return (
    <div className="border-t border-white/12 bg-navy-deep text-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#8f90c0]">
          {block.label || 'Nächstes Spiel'}
        </span>
        {match ? (
          <div className="flex flex-wrap items-center gap-5 font-semibold">
            <span>{match.homeName}</span>
            <span className="font-display text-xl text-[#8f90c0]">VS</span>
            <span>{match.awayName}</span>
            <span className="text-[13px] font-normal text-[#b9bade]">
              {match.kickoff.toLocaleString('de-DE', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {match.venue ? ` · ${match.venue}` : ''}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-[#b9bade]">
            {block.fallbackText || 'Spielplan folgt'}
          </span>
        )}
      </div>
    </div>
  )
}

function SocialGridFromBlock({
  block,
  tiles,
  notices,
}: {
  block: SocialGridBlockView
  tiles: SocialTileDto[]
  notices: Array<{ title: string; publishedAt?: string | null; path: string }>
}) {
  return (
    <Wrap className="bg-paper">
      <div className="mb-11 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
            {block.eyebrow || 'Live von Instagram'}
          </p>
          <h2 className="text-[38px] text-navy">{block.heading || 'Auf Social Media'}</h2>
        </div>
        <a
          href={instagramProfileUrl()}
          className="inline-flex min-h-11 items-center border-b border-navy pb-0.5 text-sm font-semibold text-navy transition-opacity motion-reduce:transition-none hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-70"
          rel="noopener noreferrer"
          target="_blank"
        >
          Mehr auf Instagram →
        </a>
      </div>
      <div className="mb-10 grid grid-cols-3 gap-0.5 md:grid-cols-6">
        {(tiles.length
          ? tiles
          : Array.from(
              { length: block.maxTiles ?? 6 },
              (_, i): SocialTileDto => ({
                id: `ph-${i}`,
                imageUrl: null,
                url: null,
                caption: null,
                sortOrder: i,
              }),
            )
        ).map((tile) =>
          tile.imageUrl ? (
            <a
              key={tile.id}
              href={tile.url || instagramProfileUrl()}
              className="relative aspect-square overflow-hidden bg-navy transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-80"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                src={tile.imageUrl}
                alt={tile.caption || ''}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized={tile.source === 'feedframer'}
              />
            </a>
          ) : (
            <div
              key={tile.id}
              className="aspect-square bg-navy odd:bg-navy-mid even:bg-navy-deep"
            />
          ),
        )}
      </div>
      {notices.length ? (
        <div>
          <p className="mb-4 text-sm font-semibold text-ink-soft">Offizielle Mitteilungen</p>
          <ul className="divide-y divide-line border border-line bg-white">
            {notices.slice(0, 3).map((n) => (
              <li key={n.path}>
                <a
                  href={n.path}
                  className="club-interactive flex min-h-11 gap-4 px-4 py-3 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:-outline-offset-2 focus-visible:outline-navy active:bg-paper"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-pitch">
                    {n.publishedAt
                      ? new Date(n.publishedAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : '—'}
                  </span>
                  <span className="font-semibold text-ink">{n.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Wrap>
  )
}

function SponsorsFromBlock({
  block,
  sponsors,
}: {
  block: SponsorsBlockView
  sponsors: CatalogSponsor[]
}) {
  return (
    <Wrap className="border-y border-line">
      <p className="mb-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
        {block.eyebrow || 'Unsere Sponsoren'}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {sponsors.length ? (
          sponsors.slice(0, 12).map((s) => {
            const href = s.url || hrefForPage('sponsoren')
            const external = Boolean(s.url)
            return (
              <a
                key={s.id}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="club-interactive flex h-20 items-center justify-center border border-line bg-white px-3 py-2 hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
                aria-label={s.name}
              >
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt=""
                    className="max-h-12 max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-center text-xs font-semibold text-ink-soft">{s.name}</span>
                )}
              </a>
            )
          })
        ) : (
          <a
            href={hrefForPage('sponsoren')}
            className="club-interactive col-span-full flex h-16 items-center justify-center border border-line bg-paper text-sm font-semibold text-navy hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-white"
          >
            Alle Sponsoren →
          </a>
        )}
      </div>
      {sponsors.length > 0 ? (
        <p className="mt-5">
          <a
            href={hrefForPage('sponsoren')}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Alle Sponsoren →
          </a>
        </p>
      ) : null}
    </Wrap>
  )
}

function BoardFromBlock({ block }: { block: BoardBlockView }) {
  return (
    <Wrap>
      <h2 className="mb-8 text-[38px] text-navy">{block.heading || 'Vorstand'}</h2>
      <div className="divide-y divide-line border border-line">
        {(block.members || []).map((m) => (
          <div
            key={`${m.role}-${m.name}`}
            className="flex flex-wrap justify-between gap-2 px-4 py-3"
          >
            <span className="text-sm text-ink-soft">{m.role}</span>
            <span className="font-semibold text-ink">{m.name}</span>
          </div>
        ))}
      </div>
    </Wrap>
  )
}

function DownloadsFromBlock({ block }: { block: DownloadsBlockView }) {
  return (
    <Wrap>
      <h2 className="mb-6 text-[38px] text-navy">{block.heading || 'Formulare'}</h2>
      <ul className="space-y-2">
        {(block.files || []).map((f) => (
          <li key={f.label}>
            {f.url ? (
              <a
                href={f.url}
                className="club-interactive block min-h-11 border border-line px-4 py-3 font-semibold text-navy hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
                download
              >
                {f.label}
              </a>
            ) : (
              <span className="block border border-line px-4 py-3 font-semibold text-ink-soft">
                {f.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Wrap>
  )
}

function SpacerFromBlock({ block }: { block: SpacerBlockView }) {
  const h = block.size === 'sm' ? 'h-8' : block.size === 'lg' ? 'h-24' : 'h-16'
  return <div className={h} aria-hidden />
}

function PostListFromBlock({
  block,
  notices,
}: {
  block: PostListBlockView
  notices?: Array<{
    title: string
    publishedAt?: string | null
    path: string
    featuredImageUrl?: string | null
    featuredImageAlt?: string | null
  }>
}) {
  const limit = block.limit ?? 6
  return (
    <Wrap>
      <div className="mb-8">
        {block.eyebrow ? (
          <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
            {block.eyebrow}
          </p>
        ) : null}
        <h2 className="text-[38px] text-navy">{block.heading || 'Presse'}</h2>
      </div>
      <div className="grid gap-7 md:grid-cols-3">
        {(notices || []).slice(0, limit).map((n) => (
          <a
            key={n.path}
            href={n.path}
            className="club-interactive group border border-line hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
          >
            <FeaturedMedia
              src={n.featuredImageUrl}
              alt={n.featuredImageAlt || n.title}
              aspectClassName="h-[170px] aspect-auto"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="p-5">
              <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-pitch">
                {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('de-DE') : ''}
              </span>
              <h3 className="font-body text-[16.5px] font-semibold normal-case tracking-normal text-ink">
                {n.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </Wrap>
  )
}

function ImageFromBlock({ block }: { block: ImageBlockView }) {
  return (
    <Wrap>
      {block.imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-mid">
          <Image
            src={block.imageUrl}
            alt={block.imageAlt || block.caption || ''}
            fill
            className="object-cover"
            sizes="(max-width: 1120px) 100vw, 1120px"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-navy-mid" />
      )}
      {block.caption ? <p className="mt-2 text-sm text-ink-soft">{block.caption}</p> : null}
    </Wrap>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { DEFAULT_TEAMS } from '@/lib/content-catalog'

type Props = { params: Promise<{ slug: string }> }

const STATIC_PAGES: Record<string, { title: string; body: string }> = {
  impressum: {
    title: 'Impressum',
    body: 'FC Karben e.V., c/o Jürgen Stoppany, Karl-Liebknecht-Str. 48, 61184 Karben. Kontakt: info@fc-karben.de',
  },
  datenschutz: {
    title: 'Datenschutz',
    body: 'Datenschutzerklärung wird aus WordPress migriert und juristisch nachgeprüft (Hosting Vercel, Medien Cloudflare R2, kein Tracking in Phase 1).',
  },
  anfahrt: {
    title: 'Anfahrt',
    body: 'Günter-Reutzelsportfeld / Günter-Reutzel-Weg, 61184 Karben.',
  },
  sponsoren: {
    title: 'Sponsoren',
    body: 'Unsere Partner und Sponsoren — Pflege über die Sponsors-Collection im CMS.',
  },
  formulare: {
    title: 'Formulare',
    body: 'Mitgliedsanträge und HFV-Formulare als PDF/DOC-Download (Media-Collection).',
  },
  presse: {
    title: 'Presse',
    body: 'Beiträge und Spielberichte — nach Migration aus WordPress hier gelistet.',
  },
  verein: {
    title: 'Verein',
    body: 'Vorstand, Satzung, Mitgliedschaft und Platzbelegung.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const team = DEFAULT_TEAMS.find((t) => t.slug === slug)
  if (team) return { title: team.name }
  const page = STATIC_PAGES[slug]
  if (page) return { title: page.title }
  return { title: slug }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const team = DEFAULT_TEAMS.find((t) => t.slug === slug)
  if (team) {
    return (
      <article className="mx-auto max-w-[1120px] px-8 py-16">
        <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
          Mannschaft
        </p>
        <h1 className="text-5xl text-navy">{team.name}</h1>
        {team.league ? <p className="mt-3 text-ink-soft">{team.league}</p> : null}
        {team.summary ? <p className="mt-6 max-w-2xl text-lg text-ink">{team.summary}</p> : null}
        {team.fussballDeUrl ? (
          <a
            href={team.fussballDeUrl}
            className="mt-8 inline-flex rounded-[2px] bg-navy px-5 py-3 text-sm font-semibold text-white"
            rel="noopener noreferrer"
            target="_blank"
          >
            Spielplan auf Fussball.de
          </a>
        ) : null}
        <p className="mt-10 text-sm text-ink-soft">
          Inhalte (Kader, Trainer, Trainingszeiten) pflegt die Redaktion im CMS — optional mit Page
          Builder auf der zugehörigen Seite.
        </p>
      </article>
    )
  }

  const page = STATIC_PAGES[slug]
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="text-5xl text-navy">{page.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">{page.body}</p>
      {/* Page Builder output mounts here when CMS layout blocks exist */}
      <div className="mt-12">
        <RenderBlocks blocks={[]} />
      </div>
    </article>
  )
}

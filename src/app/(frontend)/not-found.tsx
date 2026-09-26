import { ArrowRight, Search } from 'lucide-react'
import type { Metadata } from 'next'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { ClubLink } from '@/components/ui/ClubLink'
import { clubAppRoutes, clubTeams, hrefForPage, hrefForTeam } from '@/lib/club-paths'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  description:
    'Diese Seite existiert nicht. Zurück zur FC-Karben-Startseite, Suche oder Mannschaften.',
  robots: { index: false, follow: true },
}

const DESTINATIONS = [
  { href: clubAppRoutes.teamsSection, label: 'Mannschaften' },
  { href: hrefForTeam('first'), label: clubTeams.first.label },
  { href: hrefForPage('presse'), label: 'Presse' },
  { href: hrefForPage('mitgliedWerden'), label: 'Mitglied werden' },
  { href: hrefForPage('anfahrt'), label: 'Anfahrt' },
] as const

/**
 * ClubSite 404 — recovery-first empty state inside the frontend layout
 * (header / footer). Triggered by notFound() and unmatched ClubSite routes.
 */
export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(43,43,92,0.12),transparent_55%),radial-gradient(ellipse_at_90%_10%,rgba(63,125,63,0.1),transparent_45%),linear-gradient(180deg,#f4f4f8_0%,#ffffff_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy via-pitch to-navy"
      />

      <section className="relative mx-auto flex min-h-[min(70vh,40rem)] max-w-[1120px] flex-col justify-center px-8 py-16 sm:py-20">
        <Reveal immediate className="relative max-w-2xl">
          <p
            className="pointer-events-none absolute -left-2 -top-10 select-none font-display text-[clamp(5rem,22vw,8.5rem)] font-bold leading-none tracking-tight text-navy/[0.08] sm:-top-14"
            aria-hidden
          >
            404
          </p>
          <p className="relative font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
            404
          </p>
          <h1 className="relative mt-3 text-4xl text-navy sm:text-5xl">Seite nicht gefunden</h1>
          <p className="relative mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            Diese Adresse gibt es bei uns nicht — vielleicht ein alter Link oder ein Tippfehler.
          </p>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ClubLink
              href={clubAppRoutes.home}
              prefetch
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] bg-navy px-6 text-sm font-semibold text-white transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-80"
            >
              Zur Startseite
              <ArrowRight className="size-4" aria-hidden />
            </ClubLink>
            <ClubLink
              href={clubAppRoutes.search}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] border border-line bg-white px-5 text-sm font-semibold text-navy transition-colors motion-reduce:transition-none hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
            >
              <Search className="size-4" aria-hidden />
              Suche
            </ClubLink>
          </div>
        </Reveal>

        <div className="mt-14 border-t border-line pt-8">
          <p className="mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
            Weiter im Verein
          </p>
          <Stagger
            as="ul"
            className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-1 sm:gap-y-2"
          >
            {DESTINATIONS.map((dest) => (
              <StaggerItem key={dest.href} as="li">
                <ClubLink
                  href={dest.href}
                  className="club-interactive inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-soft underline-offset-2 transition-colors motion-reduce:transition-none hover:text-navy hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:px-3"
                >
                  {dest.label}
                </ClubLink>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  )
}

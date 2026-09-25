import Link from 'next/link'

import {
  clubAppRoutes,
  clubTeams,
  hrefForPage,
  hrefForTeam,
  type ClubPageKey,
  type ClubTeamKey,
} from '@/lib/club-paths'

const footerLinkClass =
  'block min-h-11 py-2.5 text-ink-soft transition-colors motion-reduce:transition-none hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy'

const VEREIN_LINKS: Array<{ key: ClubPageKey; label: string }> = [
  { key: 'vorstand', label: 'Vorstand' },
  { key: 'vereinssatzung', label: 'Vereinssatzung' },
  { key: 'mitgliedWerden', label: 'Mitglied werden' },
  { key: 'beitragsstruktur', label: 'Beitragsstruktur' },
]

const TEAM_LINKS: ClubTeamKey[] = ['first', 'second', 'third', 'eJugend', 'alteHerren']

const KONTAKT_LINKS: Array<{ key: ClubPageKey | 'search'; label: string }> = [
  { key: 'anfahrt', label: 'Anfahrt' },
  { key: 'formulare', label: 'Formulare' },
  { key: 'search', label: 'Suche' },
]

export function SiteFooter() {
  return (
    <footer id="anfahrt" className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1120px] px-8 py-14">
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <div className="font-display text-2xl font-bold uppercase text-navy">
              FC Karben e.V.
            </div>
            <p className="mt-2 max-w-s text-sm leading-relaxed text-ink-soft">
              Günter-Reutzel-Sportfeld · Karl-Liebknecht-Str. 48 · 61184 Karben
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            <div className="text-sm">
              <h4 className="mb-1 font-semibold text-navy">Verein</h4>
              <nav className="flex flex-col" aria-label="Footer Verein">
                {VEREIN_LINKS.map((item) => (
                  <Link key={item.key} href={hrefForPage(item.key)} className={footerLinkClass}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="text-sm">
              <h4 className="mb-1 font-semibold text-navy">Mannschaften</h4>
              <nav className="flex flex-col" aria-label="Footer Mannschaften">
                {TEAM_LINKS.map((key) => (
                  <Link key={key} href={hrefForTeam(key)} className={footerLinkClass}>
                    {clubTeams[key].label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="text-sm">
              <h4 className="mb-1 font-semibold text-navy">Kontakt</h4>
              <nav className="flex flex-col" aria-label="Footer Kontakt">
                <a href="mailto:info@fc-karben.de" className={footerLinkClass}>
                  info@fc-karben.de
                </a>
                {KONTAKT_LINKS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.key === 'search' ? clubAppRoutes.search : hrefForPage(item.key)}
                    className={footerLinkClass}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-soft">
          <span>© {new Date().getFullYear()} FC Karben e.V.</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              href={hrefForPage('impressum')}
              className="inline-flex min-h-11 items-center transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy"
            >
              Impressum
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href={hrefForPage('datenschutz')}
              className="inline-flex min-h-11 items-center transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy"
            >
              Datenschutz
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}

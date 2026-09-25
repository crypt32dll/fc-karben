import { ArrowRight, FileText, Newspaper, Search } from 'lucide-react'
import Link from 'next/link'

import { searchContent } from '@/lib/content-catalog'

const SUGGESTIONS = [
  { href: '/presse', label: 'Presse', hint: 'Spielberichte & News' },
  { href: '/verein', label: 'Verein', hint: 'Vorstand, Satzung, Infos' },
  { href: '/#mannschaften', label: 'Mannschaften', hint: 'Teams & Spielbetrieb' },
] as const

function typeLabel(relationTo: string): string {
  if (relationTo === 'posts') return 'Presse'
  if (relationTo === 'pages') return 'Seite'
  return relationTo
}

function TypeIcon({ relationTo }: { relationTo: string }) {
  if (relationTo === 'posts') {
    return <Newspaper className="size-4 shrink-0 text-pitch" aria-hidden="true" />
  }
  return <FileText className="size-4 shrink-0 text-pitch" aria-hidden="true" />
}

export async function SiteSearch({ initialQuery }: { initialQuery: string }) {
  const q = initialQuery.trim()
  const results = q ? await searchContent(q) : []
  const hasQuery = q.length > 0

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[800px] px-8 py-14 sm:py-16">
          <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-[#b9bade]">
            ClubSite
          </p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-wide">Suche</h1>
          <p className="mt-3 max-w-xl text-[#c8c9e0]">
            Presse, Seiten und Inhalte auf fc-karben.de durchsuchen.
          </p>

          <form method="get" action="/suche" className="mt-10" role="search">
            <label htmlFor="site-search-q" className="mb-2 block text-sm font-medium text-[#b9bade]">
              Suchbegriff
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-navy/45"
                  aria-hidden="true"
                />
                <input
                  id="site-search-q"
                  type="search"
                  name="q"
                  defaultValue={initialQuery}
                  placeholder="z. B. Mitgliedschaft, Spielbericht…"
                  autoFocus
                  autoComplete="off"
                  className="w-full rounded-[2px] border-2 border-transparent bg-white py-3.5 pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-pitch"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-[2px] bg-pitch px-6 text-sm font-semibold text-white transition-colors hover:bg-[#356935] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Suchen
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="bg-paper" aria-live="polite">
        <div className="mx-auto max-w-[800px] px-8 py-12 sm:py-14">
          {!hasQuery ? (
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
                Wonach suchst du?
              </h2>
              <p className="mt-2 text-ink-soft">
                Gib einen Begriff ein oder starte mit einem dieser Bereiche.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {SUGGESTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex min-h-11 flex-col border border-line bg-white px-4 py-4 transition-colors hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                    >
                      <span className="font-semibold text-navy group-hover:underline">
                        {item.label}
                      </span>
                      <span className="mt-1 text-sm text-ink-soft">{item.hint}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasQuery ? (
            <p className="text-sm text-ink-soft">
              {results.length === 1
                ? `1 Treffer für „${q}“`
                : `${results.length} Treffer für „${q}“`}
            </p>
          ) : null}

          {hasQuery && results.length > 0 ? (
            <ul className="mt-6 divide-y divide-line border-t border-line">
              {results.map((hit) => (
                <li key={`${hit.relationTo}-${hit.id}`}>
                  <Link
                    href={hit.path}
                    className="group flex gap-4 py-5 transition-colors hover:bg-white/70 sm:px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                  >
                    <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-pitch-light">
                      <TypeIcon relationTo={hit.relationTo} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-pitch">
                        {typeLabel(hit.relationTo)}
                      </span>
                      <span className="block text-lg font-semibold text-navy group-hover:underline">
                        {hit.title}
                      </span>
                      {hit.excerpt ? (
                        <span className="mt-1 block text-sm text-ink-soft line-clamp-2">
                          {hit.excerpt}
                        </span>
                      ) : null}
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft transition-colors group-hover:text-navy group-focus-visible:text-navy">
                        Öffnen
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {hasQuery && results.length === 0 ? (
            <div className="mt-8 border border-line bg-white px-6 py-8">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
                Keine Treffer
              </h2>
              <p className="mt-2 text-ink-soft">
                Für „{q}“ wurde nichts gefunden. Versuche einen anderen Begriff oder schau in diesen
                Bereichen nach:
              </p>
              <ul className="mt-6 flex flex-wrap gap-3">
                {SUGGESTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-11 items-center rounded-[2px] border border-line bg-paper px-4 text-sm font-semibold text-navy transition-colors hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

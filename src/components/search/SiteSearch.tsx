import { ArrowRight, FileText, Newspaper, Search, X } from 'lucide-react'
import { MotionPressable, Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { ClubLink } from '@/components/ui/ClubLink'
import { clubAppRoutes, hrefForPage, hrefForSearch } from '@/lib/club-paths'
import { type SearchHit, searchContent } from '@/lib/content-catalog'

const AREA_SUGGESTIONS = [
  { href: hrefForPage('presse'), label: 'Presse', hint: 'Spielberichte & News' },
  { href: hrefForPage('verein'), label: 'Verein', hint: 'Vorstand, Satzung, Infos' },
  { href: clubAppRoutes.teamsSection, label: 'Mannschaften', hint: 'Teams & Spielbetrieb' },
] as const

const QUERY_EXAMPLES = ['Mitgliedschaft', 'Vorstand', 'Spielbericht', 'Sponsoren'] as const

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

function QueryExampleChips({ label }: { label: string }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-ink-soft">{label}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {QUERY_EXAMPLES.map((term) => (
          <li key={term}>
            <ClubLink
              href={hrefForSearch(term)}
              className="inline-flex min-h-11 items-center rounded-[2px] border border-line bg-white px-3 text-sm font-semibold text-navy transition-colors motion-reduce:transition-none hover:border-navy hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
            >
              {term}
            </ClubLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResultRow({ hit }: { hit: SearchHit }) {
  return (
    <ClubLink
      href={hit.path}
      className="group flex gap-4 py-5 transition-colors motion-reduce:transition-none hover:bg-white/70 sm:px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-white"
    >
      <span
        className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-pitch-light"
        aria-hidden="true"
      >
        <TypeIcon relationTo={hit.relationTo} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pitch">
          {typeLabel(hit.relationTo)}
        </span>
        <span className="block text-lg font-semibold text-navy group-hover:underline">
          {hit.title}
        </span>
        {hit.excerpt ? (
          <span className="mt-1 block text-sm text-ink-soft line-clamp-2">{hit.excerpt}</span>
        ) : null}
        <span
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft transition-colors motion-reduce:transition-none group-hover:text-navy group-focus-visible:text-navy"
          aria-hidden="true"
        >
          Öffnen
          <ArrowRight className="size-3.5" />
        </span>
      </span>
    </ClubLink>
  )
}

/** Static search chrome (form) — no catalog I/O. */
export function SearchHero({ initialQuery }: { initialQuery: string }) {
  const hasQuery = initialQuery.trim().length > 0

  return (
    <>
      {hasQuery ? (
        <a
          href="#search-results"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 focus:z-[60] focus:rounded-[2px] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-navy"
        >
          Zu den Suchergebnissen
        </a>
      ) : null}

      <section className="bg-navy text-white" aria-labelledby="search-heading">
        <Reveal immediate className="mx-auto max-w-[800px] px-8 py-14 sm:py-16">
          <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-paper/70">
            ClubSite
          </p>
          <h1
            id="search-heading"
            className="font-display text-5xl font-bold uppercase tracking-wide text-balance"
          >
            Suche
          </h1>
          <p className="mt-3 max-w-xl text-paper/80">
            Presse, Seiten und Inhalte auf fc-karben.de durchsuchen.
          </p>

          <form method="get" action={clubAppRoutes.search} className="mt-10" role="search">
            <label htmlFor="site-search-q" className="mb-2 block text-sm font-medium text-paper/70">
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
                  autoFocus={!hasQuery}
                  autoComplete="off"
                  enterKeyHint="search"
                  aria-controls="search-results"
                  className="w-full min-h-11 rounded-[2px] border-2 border-transparent bg-white py-3.5 pl-12 pr-4 text-base text-ink transition-colors motion-reduce:transition-none placeholder:text-ink-soft/70 focus-visible:border-pitch focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-[2px] bg-pitch px-6 text-sm font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-pitch/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-pitch/80"
              >
                Suchen
              </button>
            </div>
          </form>
        </Reveal>
      </section>
    </>
  )
}

/** Async results panel — suspends while querying the search index. */
export async function SearchResults({ query }: { query: string }) {
  const q = query.trim()
  const hasQuery = q.length > 0
  const results = hasQuery ? await searchContent(q) : []
  const resultSummary = hasQuery
    ? results.length === 1
      ? `1 Treffer für „${q}“`
      : `${results.length} Treffer für „${q}“`
    : null

  return (
    <section
      id="search-results"
      className="scroll-mt-24 bg-paper"
      aria-labelledby={hasQuery ? 'search-results-heading' : 'search-start-heading'}
    >
      <div className="mx-auto max-w-[800px] px-8 py-12 sm:py-14">
        {!hasQuery ? (
          <Reveal>
            <h2
              id="search-start-heading"
              className="font-display text-2xl font-bold uppercase tracking-wide text-navy"
            >
              Wonach suchst du?
            </h2>
            <p className="mt-2 text-ink-soft">
              Gib einen Begriff ein oder starte mit einem dieser Bereiche.
            </p>
            <Stagger className="mt-8 grid gap-3 sm:grid-cols-3" as="ul">
              {AREA_SUGGESTIONS.map((item) => (
                <StaggerItem key={item.href} as="li">
                  <MotionPressable>
                    <ClubLink
                      href={item.href}
                      className="group flex min-h-11 flex-col border border-line bg-white px-4 py-4 transition-colors motion-reduce:transition-none hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
                    >
                      <span className="font-semibold text-navy group-hover:underline">
                        {item.label}
                      </span>
                      <span className="mt-1 text-sm text-ink-soft">{item.hint}</span>
                    </ClubLink>
                  </MotionPressable>
                </StaggerItem>
              ))}
            </Stagger>
            <QueryExampleChips label="Oder versuche z. B.:" />
          </Reveal>
        ) : null}

        {hasQuery ? (
          <Reveal className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="search-results-heading"
                className="font-display text-2xl font-bold uppercase tracking-wide text-navy"
              >
                Ergebnisse
              </h2>
              <p role="status" aria-atomic="true" className="mt-1 text-sm text-ink-soft">
                {resultSummary}
              </p>
            </div>
            <ClubLink
              href={clubAppRoutes.search}
              className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-line bg-white px-3 text-sm font-semibold text-navy transition-colors motion-reduce:transition-none hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
            >
              <X className="size-4" aria-hidden="true" />
              Suche zurücksetzen
            </ClubLink>
          </Reveal>
        ) : null}

        {hasQuery && results.length > 0 ? (
          <Stagger className="mt-6 divide-y divide-line border-t border-line" as="ul">
            {results.map((hit) => (
              <StaggerItem key={`${hit.relationTo}-${hit.id}`} as="li">
                <ResultRow hit={hit} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}

        {hasQuery && results.length === 0 ? (
          <Reveal className="mt-8 border border-line bg-white px-6 py-8">
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
              Keine Treffer
            </h3>
            <p className="mt-2 text-ink-soft">
              Für „{q}“ wurde nichts gefunden. Kürze den Begriff, prüfe die Schreibweise oder
              versuche einen dieser Vorschläge:
            </p>
            <QueryExampleChips label="Stattdessen suchen nach:" />
            <ul className="mt-6 flex flex-wrap gap-3">
              {AREA_SUGGESTIONS.map((item) => (
                <li key={item.href}>
                  <ClubLink
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-[2px] border border-line bg-paper px-4 text-sm font-semibold text-navy transition-colors motion-reduce:transition-none hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-white"
                  >
                    {item.label}
                  </ClubLink>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}

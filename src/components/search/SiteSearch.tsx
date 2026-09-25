import Link from 'next/link'

import { searchContent } from '@/lib/content-catalog'

export async function SiteSearch({ initialQuery }: { initialQuery: string }) {
  const results = initialQuery.trim() ? await searchContent(initialQuery.trim()) : []

  return (
    <div>
      <form method="get" action="/suche" className="flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Suchbegriff…"
          className="min-w-[220px] flex-1 border border-line bg-white px-4 py-3 text-ink outline-none focus:border-navy"
          aria-label="Suchbegriff"
        />
        <button
          type="submit"
          className="rounded-[2px] bg-navy px-5 py-3 text-sm font-semibold text-white"
        >
          Suchen
        </button>
      </form>

      {initialQuery.trim() ? (
        <p className="mt-6 text-sm text-ink-soft">
          {results.length} Treffer für „{initialQuery.trim()}“
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-line border border-line bg-white">
        {results.map((hit) => (
          <li key={`${hit.relationTo}-${hit.id}`}>
            <Link href={hit.path} className="block px-5 py-4 hover:bg-paper">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pitch">
                {hit.relationTo === 'posts' ? 'Presse' : 'Seite'}
              </span>
              <span className="font-semibold text-navy">{hit.title}</span>
              {hit.excerpt ? (
                <span className="mt-1 block text-sm text-ink-soft line-clamp-2">{hit.excerpt}</span>
              ) : null}
            </Link>
          </li>
        ))}
        {initialQuery.trim() && results.length === 0 ? (
          <li className="px-5 py-6 text-sm text-ink-soft">Keine Treffer.</li>
        ) : null}
      </ul>
    </div>
  )
}

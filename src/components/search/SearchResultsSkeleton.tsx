/** Static placeholder while search results stream (Suspense). */
export function SearchResultsSkeleton({ query }: { query?: string }) {
  const q = query?.trim()

  return (
    <div className="scroll-mt-24 bg-paper" aria-busy="true">
      <div className="mx-auto max-w-[800px] px-8 py-12 sm:py-14" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded-[2px] bg-line" />
            <div className="h-4 w-56 animate-pulse rounded-[2px] bg-line/70" />
          </div>
          <div className="h-11 w-44 animate-pulse rounded-[2px] bg-line" />
        </div>
        <p className="sr-only">
          {q ? `Suche nach „${q}“ läuft…` : 'Suchergebnisse werden geladen…'}
        </p>
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex gap-4 py-5 sm:px-2">
              <div className="mt-1 size-9 shrink-0 animate-pulse rounded-[2px] bg-line" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-[2px] bg-line" />
                <div className="h-5 w-[75%] max-w-md animate-pulse rounded-[2px] bg-line" />
                <div className="h-4 w-full max-w-lg animate-pulse rounded-[2px] bg-line/70" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

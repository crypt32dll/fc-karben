import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SearchResultsSkeleton } from '@/components/search/SearchResultsSkeleton'
import { SearchHero, SearchResults } from '@/components/search/SiteSearch'
import { catalogSeoToMetadata } from '@/lib/content-catalog'
import { clubAppRoutes } from '@/lib/club-paths'

export const metadata: Metadata = catalogSeoToMetadata({
  title: 'Suche',
  path: clubAppRoutes.search,
  excerpt: 'Beiträge und Seiten auf fc-karben.de durchsuchen.',
})

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SuchePage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q || ''

  return (
    <>
      <SearchHero initialQuery={query} />
      <Suspense fallback={<SearchResultsSkeleton query={query} />}>
        <SearchResults query={query} />
      </Suspense>
    </>
  )
}

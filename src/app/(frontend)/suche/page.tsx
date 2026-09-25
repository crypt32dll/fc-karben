import type { Metadata } from 'next'

import { SiteSearch } from '@/components/search/SiteSearch'
import { catalogSeoToMetadata } from '@/lib/content-catalog'

export const metadata: Metadata = catalogSeoToMetadata({
  title: 'Suche',
  path: '/suche',
  excerpt: 'Beiträge und Seiten auf fc-karben.de durchsuchen.',
})

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SuchePage({ searchParams }: Props) {
  const { q } = await searchParams
  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
        ClubSite
      </p>
      <h1 className="text-5xl text-navy">Suche</h1>
      <p className="mt-3 text-ink-soft">Presse und Seiten durchsuchen.</p>
      <div className="mt-10">
        <SiteSearch initialQuery={q || ''} />
      </div>
    </div>
  )
}

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
  return <SiteSearch initialQuery={q || ''} />
}

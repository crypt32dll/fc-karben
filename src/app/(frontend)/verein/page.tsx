import type { Metadata } from 'next'
import Link from 'next/link'

import { CmsPageBody } from '@/components/cms/CmsPageBody'
import { catalogSeoToMetadata, getSeiteBySlug } from '@/lib/content-catalog'
import { clubPages, hrefForPage, type ClubPageKey } from '@/lib/club-paths'

export const revalidate = false

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSeiteBySlug(clubPages.verein.slug)
  if (!page) return { title: 'Verein' }
  return catalogSeoToMetadata({
    title: page.title,
    path: hrefForPage('verein'),
    seo: page.seo,
    updatedAt: page.updatedAt,
  })
}

const FALLBACK_LINKS: Array<{ key: ClubPageKey; label: string }> = [
  { key: 'vorstand', label: 'Vorstand' },
  { key: 'vereinssatzung', label: 'Vereinssatzung' },
  { key: 'mitgliedWerden', label: 'Mitglied werden' },
  { key: 'beitragsstruktur', label: 'Beitragsstruktur' },
  { key: 'platzbelegung', label: 'Platzbelegung' },
  { key: 'gremien', label: 'Gremien' },
]

const linkClass =
  'club-interactive block min-h-11 px-4 py-3 font-semibold text-navy hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:-outline-offset-2 focus-visible:outline-navy active:bg-paper'

export default async function VereinIndexPage() {
  const page = await getSeiteBySlug(clubPages.verein.slug)

  if (page?.content || (Array.isArray(page?.layout) && page.layout.length > 0)) {
    return (
      <>
        <CmsPageBody page={page} />
        <nav className="mx-auto max-w-[800px] px-8 pb-16">
          <ul className="divide-y divide-line border border-line">
            {FALLBACK_LINKS.map((l) => (
              <li key={l.key}>
                <Link href={hrefForPage(l.key)} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </>
    )
  }

  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="text-5xl text-navy">Verein</h1>
      <ul className="mt-8 divide-y divide-line border border-line">
        {FALLBACK_LINKS.map((l) => (
          <li key={l.key}>
            <Link href={hrefForPage(l.key)} className={linkClass}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

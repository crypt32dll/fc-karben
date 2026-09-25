import type { Metadata } from 'next'
import Link from 'next/link'

import { CmsPageBody } from '@/components/cms/CmsPageBody'
import { catalogSeoToMetadata, getSeiteBySlug } from '@/lib/content-catalog'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSeiteBySlug('verein')
  if (!page) return { title: 'Verein' }
  return catalogSeoToMetadata({
    title: page.title,
    path: '/verein',
    seo: page.seo,
    updatedAt: page.updatedAt,
  })
}

const FALLBACK_LINKS = [
  { href: '/verein/vorstand', label: 'Vorstand' },
  { href: '/verein/vereinssatzung', label: 'Vereinssatzung' },
  { href: '/verein/mitglied-werden', label: 'Mitglied werden' },
  { href: '/verein/beitragsstruktur', label: 'Beitragsstruktur' },
  { href: '/verein/platzbelegung', label: 'Platzbelegung' },
  { href: '/verein/gremien', label: 'Gremien' },
]

export default async function VereinIndexPage() {
  const page = await getSeiteBySlug('verein')

  if (page?.content || (Array.isArray(page?.layout) && page.layout.length > 0)) {
    return (
      <>
        <CmsPageBody page={page} />
        <nav className="mx-auto max-w-[800px] px-8 pb-16">
          <ul className="divide-y divide-line border border-line">
            {FALLBACK_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block px-4 py-3 font-semibold text-navy hover:bg-paper"
                >
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
          <li key={l.href}>
            <Link href={l.href} className="block px-4 py-3 font-semibold text-navy hover:bg-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Verein' }

export default function VereinIndexPage() {
  const links = [
    { href: '/verein/vorstand', label: 'Vorstand' },
    { href: '/verein/vereinssatzung', label: 'Vereinssatzung' },
    { href: '/verein/mitglied-werden', label: 'Mitglied werden' },
    { href: '/verein/beitragsstruktur', label: 'Beitragsstruktur' },
    { href: '/verein/platzbelegung', label: 'Platzbelegung' },
  ]
  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="text-5xl text-navy">Verein</h1>
      <ul className="mt-8 divide-y divide-line border border-line">
        {links.map((l) => (
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

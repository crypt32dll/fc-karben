import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import logo from '../../../public/logo.png'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/#mannschaften', label: 'Mannschaften' },
  { href: '/verein', label: 'Verein' },
  { href: '/presse', label: 'Presse' },
  { href: '/sponsoren', label: 'Sponsoren' },
  { href: '/anfahrt', label: 'Anfahrt' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-8 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src={logo}
            alt="FC Karben"
            width={44}
            height={55}
            className="h-11 w-auto"
            priority
          />
          <div className="min-w-0">
            <div className="font-display text-[19px] font-bold uppercase tracking-wide text-navy">
              FC Karben
            </div>
            <div className="text-[11px] font-medium tracking-wider text-ink-soft">
              Fußball seit 2015
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-ink transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/suche"
            aria-label="Suche"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[2px] text-navy transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/verein/mitglied-werden"
            className="rounded-[2px] bg-navy px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:px-5"
          >
            Mitglied werden
          </Link>
        </div>
      </div>
    </header>
  )
}

import Image from 'next/image'
import Link from 'next/link'

import logo from '../../../public/logo.png'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/#mannschaften', label: 'Mannschaften' },
  { href: '/verein', label: 'Verein' },
  { href: '/presse', label: 'Presse' },
  { href: '/suche', label: 'Suche' },
  { href: '/sponsoren', label: 'Sponsoren' },
  { href: '/anfahrt', label: 'Anfahrt' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-8 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="FC Karben"
            width={44}
            height={55}
            className="h-11 w-auto"
            priority
          />
          <div>
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
              className="text-sm font-semibold text-ink hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/verein/mitglied-werden"
          className="rounded-[2px] bg-navy px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-deep"
        >
          Mitglied werden
        </Link>
      </div>
    </header>
  )
}

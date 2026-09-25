'use client'

import { usePathname } from 'next/navigation'

import { ClubLink } from '@/components/ui/ClubLink'
import { clubAppRoutes, hrefForPage, isTeamPath } from '@/lib/club-paths'

const nav = [
  {
    href: clubAppRoutes.home,
    label: 'Home',
    match: (path: string) => path === clubAppRoutes.home,
    prefetch: true,
  },
  {
    href: clubAppRoutes.teamsSection,
    label: 'Mannschaften',
    match: (path: string) => isTeamPath(path),
  },
  {
    href: hrefForPage('verein'),
    label: 'Verein',
    match: (path: string) => path.startsWith(hrefForPage('verein')),
  },
  {
    href: hrefForPage('presse'),
    label: 'Presse',
    match: (path: string) => path.startsWith(hrefForPage('presse')),
  },
  {
    href: hrefForPage('sponsoren'),
    label: 'Sponsoren',
    match: (path: string) => path.startsWith(hrefForPage('sponsoren')),
  },
  {
    href: hrefForPage('anfahrt'),
    label: 'Anfahrt',
    match: (path: string) => path === hrefForPage('anfahrt'),
  },
] as const

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
      {nav.map((item) => {
        const active = item.match(pathname)
        const prefetch = 'prefetch' in item ? item.prefetch : false
        return (
          <ClubLink
            key={item.href}
            href={item.href}
            prefetch={prefetch}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center px-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy ${
              active ? 'text-navy' : 'text-ink hover:text-navy'
            }`}
          >
            {item.label}
          </ClubLink>
        )
      })}
    </nav>
  )
}

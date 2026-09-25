'use client'

import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { ClubLink } from '@/components/ui/ClubLink'
import { clubAppRoutes } from '@/lib/club-paths'

export function HeaderSearchLink() {
  const pathname = usePathname()
  const active = pathname === clubAppRoutes.search

  return (
    <ClubLink
      href={clubAppRoutes.search}
      aria-label="Suche"
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-[2px] transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper ${
        active ? 'bg-paper text-navy' : 'text-navy hover:bg-paper'
      }`}
    >
      <Search className="size-5" aria-hidden="true" />
    </ClubLink>
  )
}

import Image from 'next/image'

import { clubAppRoutes, hrefForPage } from '@/lib/club-paths'

import logo from '../../../public/logo.png'

import { ClubLink } from '@/components/ui/ClubLink'

import { HeaderSearchLink } from './HeaderSearchLink'
import { SiteNav } from './SiteNav'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-8 py-3.5">
        <ClubLink
          href={clubAppRoutes.home}
          prefetch
          className="flex min-w-0 items-center gap-3 rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
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
        </ClubLink>
        <SiteNav />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderSearchLink />
          <ClubLink
            href={hrefForPage('mitgliedWerden')}
            prefetch
            className="inline-flex min-h-11 items-center rounded-[2px] bg-navy px-4 text-[13px] font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-navy-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-navy-deep sm:px-5"
          >
            Mitglied werden
          </ClubLink>
        </div>
      </div>
    </header>
  )
}

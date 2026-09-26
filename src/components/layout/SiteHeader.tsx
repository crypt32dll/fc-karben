import Image from 'next/image'

import { ClubLink } from '@/components/ui/ClubLink'
import { clubAppRoutes, hrefForPage } from '@/lib/club-paths'
import { defaultPrimaryNav, type NavItem } from '@/lib/navigation/defaults'
import logo from '../../../public/logo.png'

import { HeaderHeightSync } from './HeaderHeightSync'
import { HeaderSearchLink } from './HeaderSearchLink'
import { MobileNav } from './MobileNav'
import { SiteNav } from './SiteNav'

const SITE_HEADER_ID = 'site-header'

type Props = {
  nav?: NavItem[] | null
}

export function SiteHeader({ nav }: Props) {
  const items = nav?.length ? nav : defaultPrimaryNav()

  return (
    <header
      id={SITE_HEADER_ID}
      className="sticky top-0 z-50 border-b border-line bg-white"
    >
      <HeaderHeightSync headerId={SITE_HEADER_ID} />
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-8 sm:py-3.5">
        <ClubLink
          href={clubAppRoutes.home}
          prefetch
          className="flex min-w-0 items-center gap-2 rounded-[2px] sm:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <Image
            src={logo}
            alt="FC Karben"
            width={44}
            height={55}
            className="h-9 w-auto sm:h-11"
            priority
          />
          <div className="min-w-0">
            <div className="font-display text-[17px] font-bold uppercase tracking-wide text-navy sm:text-[19px]">
              FC Karben
            </div>
            <div className="hidden text-[11px] font-medium tracking-wider text-ink-soft sm:block">
              Fußball seit 2015
            </div>
          </div>
        </ClubLink>

        <SiteNav items={items} />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <HeaderSearchLink />
          <ClubLink
            href={hrefForPage('mitgliedWerden')}
            prefetch
            className="hidden min-h-11 items-center rounded-[2px] bg-navy px-3 text-[13px] font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-navy-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-navy-deep sm:inline-flex sm:px-5"
          >
            <span className="md:hidden">Mitglied</span>
            <span className="hidden md:inline">Mitglied werden</span>
          </ClubLink>
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  )
}

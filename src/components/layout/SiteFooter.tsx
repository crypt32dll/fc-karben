import { CookieSettingsButton } from '@/components/consent/CookieBanner'
import { ClubLink } from '@/components/ui/ClubLink'
import { hrefForPage } from '@/lib/club-paths'
import { defaultFooterNav, type NavChild } from '@/lib/navigation/defaults'

const footerLinkClass =
  'block min-h-11 py-2.5 text-ink-soft transition-colors motion-reduce:transition-none hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy'

type FooterCol = { heading: string; items: NavChild[] }

type Props = {
  columns?: FooterCol[] | null
  email?: string | null
  addressLine?: string | null
}

export function SiteFooter({ columns, email, addressLine }: Props) {
  const cols = columns?.length ? columns : defaultFooterNav()
  const mail = email || 'info@fc-karben.de'

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1120px] px-8 py-14">
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <div className="font-display text-2xl font-bold uppercase text-navy">
              FC Karben e.V.
            </div>
            <p className="mt-2 max-w-s text-sm leading-relaxed text-ink-soft">
              {addressLine || 'Günter-Reutzel-Sportfeld · Karl-Liebknecht-Str. 48 · 61184 Karben'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            {cols.map((col) => {
              const headingId = `footer-col-${col.heading.toLowerCase().replace(/\s+/g, '-')}`
              return (
                <div key={col.heading} className="text-sm">
                  <p id={headingId} className="mb-1 font-semibold text-navy">
                    {col.heading}
                  </p>
                  <nav className="flex flex-col" aria-labelledby={headingId}>
                    {col.heading === 'Kontakt' ? (
                      <a href={`mailto:${mail}`} className={footerLinkClass}>
                        {mail}
                      </a>
                    ) : null}
                    {col.items.map((item) => (
                      <ClubLink
                        key={item.href + item.label}
                        href={item.href}
                        className={footerLinkClass}
                      >
                        {item.label}
                      </ClubLink>
                    ))}
                  </nav>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-soft">
          <span>© {new Date().getFullYear()} FC Karben e.V.</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <ClubLink
              href={hrefForPage('impressum')}
              className="inline-flex min-h-11 items-center transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy"
            >
              Impressum
            </ClubLink>
            <span aria-hidden="true">·</span>
            <ClubLink
              href={hrefForPage('datenschutz')}
              className="inline-flex min-h-11 items-center transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy"
            >
              Datenschutz
            </ClubLink>
            <span aria-hidden="true">·</span>
            <CookieSettingsButton className="inline-flex min-h-11 items-center transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy" />
          </span>
        </div>
      </div>
    </footer>
  )
}

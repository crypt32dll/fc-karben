'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { ClubLink } from '@/components/ui/ClubLink'
import { hrefForPage } from '@/lib/club-paths'
import { type NavItem, navItemIsActive } from '@/lib/navigation/defaults'

type Props = {
  items: NavItem[]
}

export function MobileNav({ items }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      openRef.current?.focus()
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={openRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[2px] text-navy transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        aria-label="Menü öffnen"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-white" id={panelId} role="dialog" aria-modal="true" aria-label="Hauptnavigation">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display text-lg font-bold uppercase text-navy">Menü</span>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[2px] text-navy hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              aria-label="Menü schließen"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav className="overflow-y-auto px-4 py-4" aria-label="Mobile Hauptnavigation">
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li key={item.href + item.label}>
                  <ClubLink
                    href={item.href}
                    aria-current={navItemIsActive(item, pathname) ? 'page' : undefined}
                    className={`flex min-h-11 items-center px-2 text-base font-semibold ${
                      navItemIsActive(item, pathname) ? 'text-navy' : 'text-ink'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </ClubLink>
                  {item.children?.length ? (
                    <ul className="mb-2 ml-3 border-l border-line pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <ClubLink
                            href={child.href}
                            className={`flex min-h-11 items-center text-sm font-semibold ${
                              pathname === child.href ? 'text-navy' : 'text-ink-soft'
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </ClubLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
            <ClubLink
              href={hrefForPage('mitgliedWerden')}
              prefetch
              className="mt-6 flex min-h-11 items-center justify-center rounded-[2px] bg-navy px-4 text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Mitglied werden
            </ClubLink>
          </nav>
        </div>
      ) : null}
    </div>
  )
}

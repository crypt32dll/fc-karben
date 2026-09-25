'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { ClubLink } from '@/components/ui/ClubLink'
import { type NavItem, navItemIsActive } from '@/lib/navigation/defaults'

type Props = {
  items: NavItem[]
}

export function SiteNav({ items }: Props) {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hauptnavigation">
      {items.map((item) =>
        item.children?.length ? (
          <NavDropdown key={item.href + item.label} item={item} pathname={pathname} />
        ) : (
          <ClubLink
            key={item.href + item.label}
            href={item.href}
            prefetch={item.href === '/'}
            aria-current={navItemIsActive(item, pathname) ? 'page' : undefined}
            className={topLinkClass(navItemIsActive(item, pathname))}
          >
            {item.label}
          </ClubLink>
        ),
      )}
    </nav>
  )
}

function topLinkClass(active: boolean) {
  return `inline-flex min-h-11 items-center px-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:text-navy ${
    active ? 'text-navy' : 'text-ink hover:text-navy'
  }`
}

function NavDropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const active = navItemIsActive(item, pathname)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  useEffect(() => () => clearClose(), [])

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        clearClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={topLinkClass(active)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => {
          clearClose()
          setOpen(true)
        }}
      >
        {item.label}
        <span className="ml-1 text-[10px] opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      <div
        id={menuId}
        role="menu"
        hidden={!open}
        className="absolute left-0 top-full z-50 min-w-[12rem] border border-line bg-white py-1 shadow-sm"
      >
        {item.children?.map((child) => (
          <ClubLink
            key={child.href}
            href={child.href}
            role="menuitem"
            aria-current={pathname === child.href ? 'page' : undefined}
            className={`block min-h-11 px-3 py-2.5 text-sm font-semibold hover:bg-paper hover:text-navy focus-visible:bg-paper focus-visible:outline-none ${
              pathname === child.href ? 'bg-paper text-navy' : 'text-ink'
            }`}
            onClick={() => setOpen(false)}
          >
            {child.label}
          </ClubLink>
        ))}
      </div>
    </div>
  )
}

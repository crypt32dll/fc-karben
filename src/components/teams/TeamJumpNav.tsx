'use client'

import { useEffect, useState } from 'react'

export type TeamSectionId = 'ueber-uns' | 'spielplan' | 'tabelle' | 'berichte' | 'kontakt'

const SECTIONS: Array<{ id: TeamSectionId; label: string }> = [
  { id: 'ueber-uns', label: 'Über uns' },
  { id: 'spielplan', label: 'Spielplan' },
  { id: 'tabelle', label: 'Tabelle' },
  { id: 'berichte', label: 'Berichte' },
  { id: 'kontakt', label: 'Kontakt' },
]

/**
 * Sticky horizontal jump chips for Mannschaft scroll layout.
 * Real hash links for shareability; IntersectionObserver highlights the active section.
 */
export function TeamJumpNav({ teamName }: { teamName: string }) {
  const [active, setActive] = useState<TeamSectionId>('ueber-uns')

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target.id as TeamSectionId | undefined
        if (top && SECTIONS.some((s) => s.id === top)) setActive(top)
      },
      {
        rootMargin: '-40% 0px -45% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label={`${teamName} Bereiche`}
      className="sticky top-[var(--header-height)] z-20 -mx-8 mb-10 border-y border-line bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1120px] gap-2 overflow-x-auto px-8 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => {
          const isActive = active === s.id
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={isActive ? 'true' : undefined}
              className={`inline-flex shrink-0 items-center min-h-11 rounded-[2px] px-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                isActive
                  ? 'bg-navy text-white'
                  : 'bg-paper text-ink-soft hover:bg-line hover:text-navy'
              }`}
            >
              {s.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

export const TEAM_SECTION_IDS = SECTIONS.map((s) => s.id)

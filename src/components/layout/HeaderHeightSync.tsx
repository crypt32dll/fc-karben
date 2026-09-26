'use client'

import { useLayoutEffect } from 'react'

/**
 * Keeps `--header-height` in sync with the real sticky SiteHeader box
 * (padding, border, logo/CTA min-heights differ by breakpoint).
 */
export function HeaderHeightSync({ headerId }: { headerId: string }) {
  useLayoutEffect(() => {
    const header = document.getElementById(headerId)
    if (!header) return

    const sync = () => {
      const height = header.getBoundingClientRect().height
      document.documentElement.style.setProperty('--header-height', `${height}px`)
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(header)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--header-height')
    }
  }, [headerId])

  return null
}

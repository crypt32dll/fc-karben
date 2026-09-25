'use client'

import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://www.fussball.de/widgets.js'
let scriptPromise: Promise<void> | null = null

function loadWidgetsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Fussball.de widgets.js failed to load'))
    document.body.appendChild(script)
  })
  return scriptPromise
}

type Props = {
  dataId: string
  /** Fussball.de widget type, e.g. team-matches | table */
  type?: string
  className?: string
}

/** Embeds an official fussball.de widget (Spielplan / Tabelle). */
export function FussballDeWidget({ dataId, type = 'team-matches', className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host || !dataId) return

    host.innerHTML = ''
    const el = document.createElement('div')
    el.className = 'fussballde_widget'
    el.setAttribute('data-id', dataId)
    el.setAttribute('data-type', type)
    host.appendChild(el)

    loadWidgetsScript()
      .then(() => {
        if (cancelled) return
        // widgets.js scans the DOM on load; re-trigger if API exists
        const w = window as unknown as { fussballde?: { widgets?: { init?: () => void } } }
        w.fussballde?.widgets?.init?.()
      })
      .catch(() => {
        if (!cancelled && host) {
          host.innerHTML =
            '<p class="text-sm text-ink-soft">Spielplan-Widget konnte nicht geladen werden.</p>'
        }
      })

    return () => {
      cancelled = true
      if (host) host.innerHTML = ''
    }
  }, [dataId, type])

  if (!dataId) return null

  return <div ref={hostRef} className={className ?? 'min-h-[12rem] w-full overflow-x-auto'} />
}

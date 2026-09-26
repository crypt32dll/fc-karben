'use client'

import { useEffect, useId, useRef } from 'react'

type Props = {
  dataId: string
  /** Fussball.de widget type, e.g. team-matches | table */
  type?: string
  className?: string
}

/**
 * Official fussball.de embed (see widgets.js):
 * iframe → https://next.fussball.de/widget/{type}/{id}
 *
 * We mount the iframe ourselves because widgets.js only scans once on
 * script load — that breaks React Strict Mode and tab remounts.
 */
export function FussballDeWidget({ dataId, type = 'team-matches', className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reactId = useId().replace(/:/g, '')

  useEffect(() => {
    const host = hostRef.current
    if (!host || !dataId) return

    host.replaceChildren()

    const iframeName = `${reactId}_fussballde_widget-${dataId}`
    const iframe = document.createElement('iframe')
    iframe.src = `https://next.fussball.de/widget/${type}/${dataId}`
    iframe.name = iframeName
    iframe.title = 'Fussball.de Widget'
    iframe.style.width = '100%'
    iframe.style.border = 'none'
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('scrolling', 'no')
    host.appendChild(iframe)

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; iframeName?: string; height?: number }
      if (data?.type === 'fussballde_widget:resize' && data.iframeName === iframeName) {
        iframe.style.height = `${data.height}px`
      }
    }
    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
      host.replaceChildren()
    }
  }, [dataId, type, reactId])

  if (!dataId) return null

  return (
    <div
      ref={hostRef}
      className={className ?? 'fussballde_widget min-h-[12rem] w-full overflow-x-auto'}
      data-id={dataId}
      data-type={type}
      style={{ width: '100%' }}
    />
  )
}

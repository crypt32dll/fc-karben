'use client'

import { useState } from 'react'

import { hrefForPage } from '@/lib/club-paths'
import { platzbelegungCalendarEmbedUrl } from '@/lib/platzbelegung-calendar'

type Props = {
  title?: string
}

/**
 * Google Calendar for Platzbelegung.
 * The grid itself is an iframe (Google UI). We only style the surrounding club chrome
 * and pass bgcolor/color query params — full visual theming is not possible.
 */
export function GoogleCalendarEmbed({ title = 'Wochenplan' }: Props) {
  const [active, setActive] = useState(false)
  const height = 720
  const src = platzbelegungCalendarEmbedUrl({ height })

  return (
    <section className="mt-10" aria-label="Platzbelegung Kalender">
      <div className="overflow-hidden border border-line bg-paper">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line bg-navy px-5 py-4 text-white">
          <div>
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8f90c0]">
              Günter-Reutzel-Sportfeld
            </p>
            <h2 className="mt-1 text-2xl text-white normal-case tracking-normal">{title}</h2>
          </div>
          {!active ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-[2px] bg-white px-4 text-sm font-semibold text-navy transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:opacity-80"
              onClick={() => setActive(true)}
            >
              Kalender laden
            </button>
          ) : null}
        </div>

        {!active ? (
          <div className="flex min-h-[22rem] flex-col items-start justify-center gap-4 px-6 py-10 sm:px-8">
            <p className="max-w-xl text-[15px] leading-relaxed text-ink">
              Der Belegungsplan wird von Google Calendar geladen. Beim Öffnen werden
              Verbindungsdaten an Google übertragen. Details stehen in der{' '}
              <a
                href={hrefForPage('datenschutz')}
                className="font-semibold text-navy underline underline-offset-2 decoration-navy/35 hover:decoration-navy"
              >
                Datenschutzerklärung
              </a>
              .
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-[2px] bg-navy px-5 text-sm font-semibold text-white transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-80"
              onClick={() => setActive(true)}
            >
              Kalender anzeigen
            </button>
          </div>
        ) : (
          <div className="bg-paper">
            <iframe
              title="Platzbelegung — Google Kalender"
              src={src}
              className="block w-full border-0"
              style={{ height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </section>
  )
}

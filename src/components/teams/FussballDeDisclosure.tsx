'use client'

import { useState } from 'react'

import { hrefForPage } from '@/lib/club-paths'

import { FussballDeWidget } from './FussballDeWidget'

type Props = {
  /** Section heading shown in the navy chrome */
  title: string
  /** id for the visible h2 (section aria-labelledby) */
  headingId: string
  /** Button / empty-state label, e.g. Spielplan */
  label: string
  dataId?: string | null
  type: 'team-matches' | 'table'
  fussballDeUrl?: string | null
}

/**
 * Progressive disclosure for fussball.de iframes — mount only after explicit click
 * (privacy + viewport). Club chrome matches Platzbelegung calendar pattern.
 */
export function FussballDeDisclosure({
  title,
  headingId,
  label,
  dataId,
  type,
  fussballDeUrl,
}: Props) {
  const [active, setActive] = useState(false)
  const hasWidget = Boolean(dataId)

  return (
    <div className="overflow-hidden border border-line bg-paper">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line bg-navy px-5 py-4 text-white">
        <div>
          <p className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8f90c0]">
            fussball.de
          </p>
          <h2 id={headingId} className="mt-1 text-2xl text-white normal-case tracking-normal">
            {title}
          </h2>
        </div>
        {hasWidget && !active ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-[2px] bg-white px-4 text-sm font-semibold text-navy transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:opacity-80"
            onClick={() => setActive(true)}
          >
            {label} laden
          </button>
        ) : null}
      </div>

      {!hasWidget ? (
        <div className="flex min-h-[12rem] flex-col items-start justify-center gap-4 px-6 py-10 sm:px-8">
          <p className="max-w-xl text-[15px] leading-relaxed text-ink-soft">
            {label}-Widget noch nicht konfiguriert. Im CMS unter Mannschaften die Fussball.de
            Widget-ID eintragen.
          </p>
          {fussballDeUrl ? (
            <a
              href={fussballDeUrl}
              className="inline-flex min-h-11 items-center rounded-[2px] bg-navy px-4 text-sm font-semibold text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              Auf Fussball.de öffnen
            </a>
          ) : null}
        </div>
      ) : !active ? (
        <div className="flex min-h-[14rem] flex-col items-start justify-center gap-4 px-6 py-10 sm:px-8">
          <p className="max-w-xl text-[15px] leading-relaxed text-ink">
            {label} wird von fussball.de geladen. Beim Öffnen werden Verbindungsdaten an den DFB
            übertragen. Details stehen in der{' '}
            <a
              href={hrefForPage('datenschutz')}
              className="font-semibold text-navy underline underline-offset-2 decoration-navy/35 hover:decoration-navy"
            >
              Datenschutzerklärung
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-[2px] bg-navy px-5 text-sm font-semibold text-white transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-80"
              onClick={() => setActive(true)}
            >
              {label} anzeigen
            </button>
            {fussballDeUrl ? (
              <a
                href={fussballDeUrl}
                className="inline-flex min-h-11 items-center border border-line bg-white px-4 text-sm font-semibold text-navy"
                rel="noopener noreferrer"
                target="_blank"
              >
                Auf Fussball.de öffnen
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white p-2 sm:p-3">
          <FussballDeWidget dataId={dataId!} type={type} />
          {fussballDeUrl ? (
            <p className="mt-3 px-1 pb-2">
              <a
                href={fussballDeUrl}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-2"
                rel="noopener noreferrer"
                target="_blank"
              >
                Auf Fussball.de öffnen →
              </a>
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

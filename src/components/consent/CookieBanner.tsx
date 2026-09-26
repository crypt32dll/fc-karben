'use client'

import { useEffect, useId, useState } from 'react'

import { ClubLink } from '@/components/ui/ClubLink'
import { hrefForPage } from '@/lib/club-paths'
import {
  acceptAllExternal,
  acceptEssentialOnly,
  reopenConsentBanner,
  saveConsentChoices,
} from '@/lib/consent/storage'
import { useConsent } from '@/lib/consent/use-consent'

/**
 * Site-wide consent banner (TDDDG / DSGVO).
 * Essential browsing needs no marketing cookies; optional = third-party embeds.
 */
export function CookieBanner() {
  const { consent, decided } = useConsent()
  const [mounted, setMounted] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [fussballDe, setFussballDe] = useState(false)
  const [googleCalendar, setGoogleCalendar] = useState(false)
  const titleId = useId()
  const panelId = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration flash for returning visitors with stored consent
  if (!mounted || decided) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-white p-4 shadow-[0_-8px_32px_rgba(34,34,58,0.12)] sm:p-5"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4">
        <div className="max-w-3xl">
          <p
            id={titleId}
            className="font-display text-lg font-bold uppercase tracking-[0.02em] text-navy"
          >
            Cookies &amp; externe Inhalte
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Für den Betrieb der Seite sind keine Tracking-Cookies nötig. Spielplan, Tabelle und der
            Platzbelegungs-Kalender laden Inhalte von fussball.de bzw. Google — erst nach Ihrer
            Erlaubnis. Details in der{' '}
            <ClubLink
              href={hrefForPage('datenschutz')}
              className="font-semibold text-navy underline underline-offset-2"
            >
              Datenschutzerklärung
            </ClubLink>
            .
          </p>
        </div>

        {customize ? (
          <fieldset
            id={panelId}
            className="grid gap-3 rounded-[2px] border border-line bg-paper p-4 sm:max-w-xl"
          >
            <legend className="px-1 text-sm font-semibold text-navy">Auswahl speichern</legend>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-navy"
                checked={fussballDe}
                onChange={(e) => setFussballDe(e.target.checked)}
              />
              <span>
                <span className="font-semibold text-navy">fussball.de / DFB</span>
                <span className="mt-0.5 block text-ink-soft">
                  Spielplan, Tabelle und Spielberichte auf den Mannschaftsseiten
                </span>
              </span>
            </label>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-navy"
                checked={googleCalendar}
                onChange={(e) => setGoogleCalendar(e.target.checked)}
              />
              <span>
                <span className="font-semibold text-navy">Google Kalender</span>
                <span className="mt-0.5 block text-ink-soft">Platzbelegung am Sportfeld</span>
              </span>
            </label>
            <button
              type="button"
              className="mt-1 inline-flex min-h-11 w-fit items-center rounded-[2px] bg-navy px-5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-80"
              onClick={() => saveConsentChoices({ fussballDe, googleCalendar })}
            >
              Auswahl speichern
            </button>
          </fieldset>
        ) : null}

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-[2px] bg-navy px-5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-80"
            onClick={() => acceptAllExternal()}
          >
            Alle erlauben
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper"
            onClick={() => acceptEssentialOnly()}
          >
            Nur notwendige
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-navy underline underline-offset-2 hover:decoration-navy/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            aria-expanded={customize}
            aria-controls={panelId}
            onClick={() => {
              setFussballDe(consent.fussballDe)
              setGoogleCalendar(consent.googleCalendar)
              setCustomize((v) => !v)
            }}
          >
            {customize ? 'Auswahl ausblenden' : 'Auswahl anpassen'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Footer control to change saved preferences. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => reopenConsentBanner()}>
      Cookie-Einstellungen
    </button>
  )
}

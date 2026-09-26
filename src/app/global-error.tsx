'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="de">
      <body className="font-body antialiased">
        <main className="mx-auto flex min-h-[50vh] max-w-[40rem] flex-col justify-center px-8 py-16">
          <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
            Fehler
          </p>
          <h1 className="text-3xl text-navy">Etwas ist schiefgelaufen</h1>
          <p className="mt-3 text-ink-soft">
            Bitte laden Sie die Seite neu. Wenn das Problem bleibt, melden Sie sich unter{' '}
            <a className="font-semibold text-navy underline underline-offset-2" href="mailto:info@fc-karben.de">
              info@fc-karben.de
            </a>
            .
          </p>
          {error.digest ? (
            <p className="mt-6 text-xs text-ink-soft">Referenz: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  )
}

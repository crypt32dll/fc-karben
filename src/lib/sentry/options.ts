import * as Sentry from '@sentry/nextjs'

/** Shared Sentry options — server, edge, and browser. */
export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined
}

export function sentryInitOptions(): Parameters<typeof Sentry.init>[0] {
  const dsn = getSentryDsn()
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    // Error monitoring + structured Logs (Session Replay is client-only in instrumentation-client)
    sendDefaultPii: false,
    // Capture console.warn/error as Sentry Logs (info/debug stay local)
    integrations: (defaults) => [
      ...defaults,
      Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
    ],
    beforeSendLog(log) {
      if (
        process.env.NODE_ENV === 'production' &&
        (log.level === 'debug' || log.level === 'trace')
      ) {
        return null
      }
      return log
    },
  } as Parameters<typeof Sentry.init>[0]
}

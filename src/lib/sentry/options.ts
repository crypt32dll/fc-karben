/** Shared Sentry options — server, edge, and browser. */
export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined
}

export function sentryInitOptions() {
  const dsn = getSentryDsn()
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    // Error monitoring only — no session replay / marketing tracking
    sendDefaultPii: false,
  }
}

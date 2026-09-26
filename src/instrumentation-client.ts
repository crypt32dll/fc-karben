import * as Sentry from '@sentry/nextjs'

import { sentryInitOptions } from './lib/sentry/options'

// Browser errors — only when NEXT_PUBLIC_SENTRY_DSN (or SENTRY_DSN inlined at build) is set.
Sentry.init({
  ...sentryInitOptions(),
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

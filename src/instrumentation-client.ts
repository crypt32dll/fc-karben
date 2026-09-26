import * as Sentry from '@sentry/nextjs'

import { sentryInitOptions } from './lib/sentry/options'

const shared = sentryInitOptions()
const isProd = process.env.NODE_ENV === 'production'

// Browser errors + Session Replay + Profiling — client only (Browser APIs).
Sentry.init({
  ...shared,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  integrations: (defaults) => {
    const base =
      typeof shared.integrations === 'function'
        ? shared.integrations(defaults)
        : [...defaults, ...(Array.isArray(shared.integrations) ? shared.integrations : [])]

    return [
      ...base,
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserProfilingIntegration(),
    ]
  },
  // 10% of sessions in production; all sessions locally for easier verification
  replaysSessionSampleRate: isProd ? 0.1 : 1,
  // Always record when an error occurs
  replaysOnErrorSampleRate: 1,
  // Browser profiling (Chromium + Document-Policy: js-profiling)
  profileSessionSampleRate: isProd ? 0.1 : 1,
  profileLifecycle: 'trace',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

import * as Sentry from '@sentry/nextjs'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

import { attachSentryLogTransport } from './lib/logger'
import { sentryInitOptions } from './lib/sentry/options'

const shared = sentryInitOptions()
const isProd = process.env.NODE_ENV === 'production'

Sentry.init({
  ...shared,
  integrations: (defaults) => {
    const base =
      typeof shared.integrations === 'function'
        ? shared.integrations(defaults)
        : [...defaults, ...(Array.isArray(shared.integrations) ? shared.integrations : [])]

    return [...base, nodeProfilingIntegration()]
  },
  // Profile alongside sampled traces (relative session sample)
  profileSessionSampleRate: isProd ? 0.1 : 1,
  profileLifecycle: 'trace',
})

attachSentryLogTransport()

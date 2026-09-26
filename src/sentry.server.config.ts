import * as Sentry from '@sentry/nextjs'

import { attachSentryLogTransport } from './lib/logger'
import { sentryInitOptions } from './lib/sentry/options'

Sentry.init(sentryInitOptions())
attachSentryLogTransport()

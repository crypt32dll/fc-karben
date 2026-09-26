import * as Sentry from '@sentry/nextjs'
import { Logger } from 'tslog'

export const logger = new Logger({
  name: 'fc-karben',
  minLevel: process.env.LOG_LEVEL === 'debug' ? 0 : 3,
})

type TslogRecord = Record<string, unknown> & {
  _logMeta?: {
    logLevelName?: string
    name?: string
  }
}

type SentryLogLevel = 'warn' | 'error' | 'fatal'

function toSentryLevel(name: string | undefined): SentryLogLevel | null {
  if (!name) return null
  const upper = name.toUpperCase()
  if (upper === 'WARN' || upper === 'ERROR' || upper === 'FATAL') {
    return upper.toLowerCase() as SentryLogLevel
  }
  return null
}

function argsFromRecord(record: TslogRecord): unknown[] {
  return Object.keys(record)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => record[key])
}

function messageFromArgs(args: unknown[]): string {
  const parts = args.map((arg) => {
    if (typeof arg === 'string') return arg
    if (arg && typeof arg === 'object' && 'message' in arg && typeof arg.message === 'string') {
      return arg.message
    }
    try {
      return JSON.stringify(arg)
    } catch {
      return String(arg)
    }
  })
  return parts.join(' ') || '(empty log)'
}

function attributesFromArgs(args: unknown[]): Record<string, string | number | boolean> {
  const attributes: Record<string, string | number | boolean> = {}
  for (const [index, arg] of args.entries()) {
    if (arg && typeof arg === 'object' && !Array.isArray(arg) && !(arg instanceof Error)) {
      for (const [key, value] of Object.entries(arg as Record<string, unknown>)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          attributes[key] = value
        }
      }
      continue
    }
    if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
      attributes[`arg_${index}`] = arg
    }
  }
  return attributes
}

let sentryTransportAttached = false

/** Forward warn/error/fatal tslog records to Sentry Logs. Call after Sentry.init(). */
export function attachSentryLogTransport() {
  if (sentryTransportAttached) return
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return

  sentryTransportAttached = true
  logger.attachTransport((record) => {
    const logRecord = record as TslogRecord
    const level = toSentryLevel(logRecord._logMeta?.logLevelName)
    if (!level) return

    const args = argsFromRecord(logRecord)
    Sentry.logger[level](messageFromArgs(args), {
      logger: logRecord._logMeta?.name ?? 'fc-karben',
      source: 'tslog',
      ...attributesFromArgs(args),
    })
  })
}

export function createLogger(name: string) {
  return logger.getSubLogger({ name })
}

import { Logger } from 'tslog'

export const logger = new Logger({
  name: 'fc-karben',
  minLevel: process.env.LOG_LEVEL === 'debug' ? 0 : 3,
})

export function createLogger(name: string) {
  return logger.getSubLogger({ name })
}

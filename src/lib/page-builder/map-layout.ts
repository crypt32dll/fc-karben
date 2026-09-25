import { createLogger } from '../logger'
import { type LayoutBlockView, type PageLayoutView, payloadLayoutBlockSchema } from './schemas'

const log = createLogger('PageBuilder')

/** Payload layout blocks → validated ClubSite LayoutView DTOs. Invalid blocks are dropped. */
export function mapPageLayout(raw: unknown): PageLayoutView {
  if (!Array.isArray(raw) || raw.length === 0) return []
  const out: LayoutBlockView[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const parsed = payloadLayoutBlockSchema.safeParse(item)
    if (!parsed.success) {
      log.warn('Invalid page builder block dropped', {
        blockType: (item as { blockType?: string }).blockType,
        issues: parsed.error.issues.map((i) => i.message),
      })
      continue
    }
    out.push(parsed.data)
  }
  return out
}

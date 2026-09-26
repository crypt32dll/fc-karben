import { createLogger } from '../logger'

const log = createLogger('MediaLoader')

const DEFAULT_ALLOWED_HOSTS = new Set(['fc-karben.de', 'www.fc-karben.de', 'media.fc-karben.de'])

export function isAllowedMediaHost(
  url: string,
  allowedHosts: Set<string> = DEFAULT_ALLOWED_HOSTS,
): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return allowedHosts.has(host)
  } catch {
    return false
  }
}

export function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.doc')) return 'application/msword'
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return 'application/octet-stream'
}

export type DownloadedFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

/** Filename for Payload upload docs from a public URL. */
export function filenameFromUrl(url: string): string {
  try {
    const base = decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
    return base || `file-${Date.now()}`
  } catch {
    return `file-${Date.now()}`
  }
}

/**
 * Tiny valid PNG so Payload's image-size check passes.
 * SFTP adapter skips remote write when `wpSourceUrl` is set (external register).
 */
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

/**
 * Stub file for registering an existing public URL without re-uploading bytes.
 */
export function externalMediaStub(url: string): DownloadedFile {
  const name = filenameFromUrl(url)
  // Keep original extension in the filename for admin display; bytes are always PNG stub.
  return {
    data: PNG_1X1,
    mimetype: 'image/png',
    name: name.replace(/\.[^.]+$/, '') + '.png',
    size: PNG_1X1.length,
  }
}

export async function downloadFile(
  url: string,
  options?: { timeoutMs?: number; allowedHosts?: Set<string> },
): Promise<DownloadedFile | null> {
  if (!isAllowedMediaHost(url, options?.allowedHosts)) {
    log.warn('Media host not allowlisted', { url })
    return null
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'fc-karben-migrator/1.0' },
      signal: AbortSignal.timeout(options?.timeoutMs ?? 60_000),
    })
    if (!res.ok) {
      log.warn('Media download failed', { url, status: res.status })
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const name = decodeURIComponent(url.split('/').pop() || `file-${Date.now()}`)
    return {
      data: buf,
      mimetype: res.headers.get('content-type') || mimeFromUrl(url),
      name,
      size: buf.length,
    }
  } catch (err) {
    log.warn('Media download error', {
      url,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

/** Run async work over items with a fixed concurrency limit. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0

  async function run() {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index], index)
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run())
  await Promise.all(runners)
  return results
}

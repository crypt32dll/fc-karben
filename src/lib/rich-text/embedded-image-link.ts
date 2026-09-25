import { isAllowedMediaHost } from '../migration/media-loader'

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i
const SIZE_SUFFIX = /-(\d+)x(\d+)(?=\.(png|jpe?g|gif|webp|avif)$)/i
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type EmbeddedImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

/**
 * WordPress image tags were stored as filename links
 * (`<a href="…/foto.png">foto.png</a>`). Those should render as images.
 * Download links keep their own label and stay anchors.
 */
export function embeddedImageFromLink(
  href: string | null | undefined,
  label: string,
): EmbeddedImage | null {
  const src = href?.trim()
  if (!src) return null

  let pathname: string
  try {
    if (src.startsWith('/') && !src.startsWith('//')) {
      pathname = decodeURIComponent(new URL(src, 'https://fc-karben.de').pathname)
      if (!pathname.startsWith('/wp-content/uploads/') && !pathname.startsWith('/api/media/')) {
        return null
      }
    } else {
      const url = new URL(src)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
      if (!isAllowedMediaHost(src)) return null
      pathname = decodeURIComponent(url.pathname)
    }
  } catch {
    return null
  }

  const filename = pathname.split('/').pop() || ''
  if (!IMAGE_EXT.test(filename)) return null

  let text = label.trim()
  try {
    text = decodeURIComponent(text)
  } catch {
    // keep the raw label
  }
  if (text.toLowerCase() !== filename.toLowerCase()) return null

  const dims = filename.match(SIZE_SUFFIX)
  return {
    src,
    alt: altFromFilename(filename),
    width: dims ? Number(dims[1]) : undefined,
    height: dims ? Number(dims[2]) : undefined,
  }
}

export function embeddedImageFromLexicalLink(node: unknown): EmbeddedImage | null {
  if (!node || typeof node !== 'object') return null
  const fields = (node as { fields?: { url?: unknown; linkType?: unknown } }).fields
  if (fields?.linkType === 'internal') return null
  const url = typeof fields?.url === 'string' ? fields.url : ''
  return embeddedImageFromLink(url, textOf(node))
}

function textOf(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const current = node as { text?: unknown; children?: unknown }
  if (typeof current.text === 'string') return current.text
  if (!Array.isArray(current.children)) return ''
  return current.children.map((child) => textOf(child)).join('')
}

function altFromFilename(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, '').replace(/-scaled$/i, '').replace(/-\d+x\d+$/i, '')
  if (!stem || UUID.test(stem)) return 'Foto'
  return stem.replace(/[-_]+/g, ' ').trim() || 'Foto'
}

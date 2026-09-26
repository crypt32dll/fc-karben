import path from 'node:path'

import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type {
  Adapter,
  CollectionOptions,
  GeneratedAdapter,
} from '@payloadcms/plugin-cloud-storage/types'
import type { Config, Plugin, UploadCollectionSlug } from 'payload'
import SftpClient from 'ssh2-sftp-client'

export type SftpStorageOptions = {
  /**
   * Collections that use SFTP. Pass `true` or `{ prefix?: string }`.
   * Includes plugin collections (e.g. import-export `exports` / `imports`).
   */
  collections: Partial<
    Record<UploadCollectionSlug | (string & {}), Omit<CollectionOptions, 'adapter'> | true>
  >
  /**
   * @default true when SFTP_* env is set
   */
  enabled?: boolean
}

type SftpEnv = {
  host: string
  port: number
  username: string
  password: string
  /** Absolute remote directory that maps to MEDIA_PUBLIC_BASE_URL */
  basePath: string
  publicBaseUrl: string
}

export const isSftpConfigured = (): boolean =>
  Boolean(process.env.SFTP_HOST && process.env.SFTP_USER && process.env.SFTP_PASSWORD)

const readEnv = (): SftpEnv => {
  const host = process.env.SFTP_HOST
  const username = process.env.SFTP_USER
  const password = process.env.SFTP_PASSWORD
  if (!host || !username || !password) {
    throw new Error('SFTP_HOST, SFTP_USER, and SFTP_PASSWORD are required')
  }
  return {
    host,
    port: Number(process.env.SFTP_PORT || '22'),
    username,
    password,
    basePath: (process.env.SFTP_BASE_PATH || '/wp-content/uploads').replace(/\/$/, '') || '/',
    publicBaseUrl: (
      process.env.MEDIA_PUBLIC_BASE_URL || 'https://fc-karben.de/wp-content/uploads'
    ).replace(/\/$/, ''),
  }
}

const withSftp = async <T>(fn: (client: SftpClient) => Promise<T>): Promise<T> => {
  const env = readEnv()
  const client = new SftpClient()
  try {
    await client.connect({
      host: env.host,
      port: env.port,
      username: env.username,
      password: env.password,
      readyTimeout: 25_000,
    })
    return await fn(client)
  } finally {
    await client.end().catch(() => undefined)
  }
}

const datePrefix = (): string => {
  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${yyyy}/${mm}`
}

const joinUrl = (base: string, ...parts: string[]): string => {
  const rel = path.posix.join(...parts.filter(Boolean).map((p) => p.replace(/^\/+/, '')))
  return `${base}/${rel}`
}

const createAdapter =
  (collectionPrefix = ''): Adapter =>
  (): GeneratedAdapter => {
    const env = readEnv()

    return {
      name: 'sftp',
      generateURL: ({ data, filename, prefix }) => {
        if (typeof data?.wpSourceUrl === 'string' && data.wpSourceUrl.length > 0) {
          return data.wpSourceUrl
        }
        return joinUrl(env.publicBaseUrl, prefix || collectionPrefix, filename)
      },
      handleUpload: async ({ data, file }) => {
        // Migration / external register: keep existing public URL, no remote write
        if (typeof data.wpSourceUrl === 'string' && data.wpSourceUrl.length > 0) {
          return data
        }

        const prefixToUse =
          (typeof data.prefix === 'string' && data.prefix) || collectionPrefix || datePrefix()
        data.prefix = prefixToUse

        const remoteDir = path.posix.join(env.basePath, prefixToUse)
        const remotePath = path.posix.join(remoteDir, file.filename)

        await withSftp(async (client) => {
          await client.mkdir(remoteDir, true)
          await client.put(file.buffer, remotePath)
        })

        return data
      },
      handleDelete: async ({ doc, filename }) => {
        const external = doc as { wpSourceUrl?: string | null }
        if (typeof external.wpSourceUrl === 'string' && external.wpSourceUrl.length > 0) {
          return
        }
        const prefixToUse = (typeof doc.prefix === 'string' && doc.prefix) || collectionPrefix || ''
        const remotePath = path.posix.join(env.basePath, prefixToUse, filename)
        await withSftp(async (client) => {
          try {
            await client.delete(remotePath)
          } catch {
            // best effort — file may already be gone
          }
        })
      },
      staticHandler: (_req, { params: { filename, prefix } }) => {
        const url = joinUrl(env.publicBaseUrl, prefix || collectionPrefix, filename)
        return Response.redirect(url, 302)
      },
    }
  }

/**
 * Payload plugin: store `media` (and optional collections) on 1&1 via SFTP.
 * Public URLs use MEDIA_PUBLIC_BASE_URL (HTTPS), not the SFTP protocol.
 */
export const sftpStorage =
  (options: SftpStorageOptions): Plugin =>
  (incomingConfig: Config): Config => {
    const enabled = options.enabled !== false && isSftpConfigured()
    if (!enabled) {
      return incomingConfig
    }

    const adapter = createAdapter()

    const collectionsWithAdapter = Object.entries(options.collections).reduce<
      Record<string, CollectionOptions>
    >((acc, [slug, collOptions]) => {
      acc[slug] = {
        ...(collOptions === true ? {} : collOptions),
        adapter,
        disablePayloadAccessControl: true,
      }
      return acc
    }, {})

    const config: Config = {
      ...incomingConfig,
      collections: (incomingConfig.collections || []).map((collection) => {
        if (!collectionsWithAdapter[collection.slug]) return collection
        return {
          ...collection,
          upload: {
            ...(typeof collection.upload === 'object' ? collection.upload : {}),
            disableLocalStorage: true,
          },
        }
      }),
    }

    return cloudStoragePlugin({
      collections: collectionsWithAdapter,
    })(config)
  }

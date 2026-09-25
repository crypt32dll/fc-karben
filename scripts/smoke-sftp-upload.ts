/**
 * Smoke-test: upload a tiny PNG via the SFTP adapter helpers.
 * Usage: pnpm exec tsx scripts/smoke-sftp-upload.ts
 */
import { loadEnvFile } from 'node:process'
import path from 'node:path'

import SftpClient from 'ssh2-sftp-client'

try {
  loadEnvFile('.env')
} catch {
  // optional
}

const host = process.env.SFTP_HOST
const port = Number(process.env.SFTP_PORT || '22')
const username = process.env.SFTP_USER
const password = process.env.SFTP_PASSWORD
const basePath = (process.env.SFTP_BASE_PATH || '/wp-content/uploads').replace(/\/$/, '')
const publicBase = (
  process.env.MEDIA_PUBLIC_BASE_URL || 'https://fc-karben.de/wp-content/uploads'
).replace(/\/$/, '')

if (!host || !username || !password) {
  console.error('Missing SFTP credentials')
  process.exit(1)
}

// 1x1 PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

const now = new Date()
const prefix = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
const filename = `payload-smoke-${Date.now()}.png`
const remoteDir = path.posix.join(basePath, prefix)
const remotePath = path.posix.join(remoteDir, filename)
const publicUrl = `${publicBase}/${prefix}/${filename}`

const sftp = new SftpClient()
try {
  await sftp.connect({ host, port, username, password, readyTimeout: 25_000 })
  await sftp.mkdir(remoteDir, true)
  await sftp.put(png, remotePath)
  const exists = await sftp.exists(remotePath)
  console.log('uploaded', remotePath, 'exists=', exists)
  console.log('public URL (needs domain → this webspace):', publicUrl)
  await sftp.delete(remotePath)
  console.log('cleaned up OK')
} finally {
  await sftp.end()
}

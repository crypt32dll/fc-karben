/**
 * Probe write + known IONOS path guesses.
 */
import { loadEnvFile } from 'node:process'

import SftpClient from 'ssh2-sftp-client'

try {
  loadEnvFile('.env')
} catch {
  // optional
}

const sftp = new SftpClient()
const host = process.env.SFTP_HOST!
const port = Number(process.env.SFTP_PORT || '22')
const username = process.env.SFTP_USER!
const password = process.env.SFTP_PASSWORD!

try {
  await sftp.connect({ host, port, username, password, readyTimeout: 20000 })
  console.log('cwd', await sftp.cwd())

  const guesses = [
    '/',
    '/htdocs',
    '/httpdocs',
    '/web',
    `/${username}`,
    `/homepages/0/${username}/htdocs`,
    `/homepages/1/${username}/htdocs`,
    `/homepages/10/${username}/htdocs`,
    `/homepages/25/${username}/htdocs`,
    `/homepages/35/${username}/htdocs`,
    `/homepages/40/${username}/htdocs`,
    '/580574594',
    '/home580574594',
  ]

  for (const g of guesses) {
    const ex = await sftp.exists(g)
    console.log('exists', g, '→', ex)
  }

  const testPath = '/__payload_sftp_probe.txt'
  try {
    await sftp.put(Buffer.from('probe-ok\n'), testPath)
    console.log('WRITE OK', testPath)
    const data = await sftp.get(testPath)
    console.log('READ OK', Buffer.isBuffer(data) ? data.toString() : data)
    await sftp.delete(testPath)
    console.log('DELETE OK')
  } catch (err) {
    console.log('WRITE/READ FAIL', err instanceof Error ? err.message : err)
  }
} finally {
  await sftp.end()
}

/** Side-effect: load repo-root `.env` before Payload config is imported. */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')
if (existsSync(envPath)) {
  loadEnvFile(envPath)
}

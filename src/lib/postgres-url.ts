/**
 * pg / pg-connection-string currently treat sslmode=require as verify-full and warn.
 * Prefer the explicit mode so logs stay quiet and behavior stays strict.
 */
export function normalizePostgresUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const mode = parsed.searchParams.get('sslmode')
    if (mode === 'require' || mode === 'prefer' || mode === 'verify-ca') {
      parsed.searchParams.set('sslmode', 'verify-full')
    } else if (!mode) {
      parsed.searchParams.set('sslmode', 'verify-full')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Club media on 1&1 webspace (legacy WP + Payload SFTP uploads)
      { protocol: 'https', hostname: 'fc-karben.de', pathname: '/wp-content/**' },
      { protocol: 'https', hostname: 'www.fc-karben.de', pathname: '/wp-content/**' },
      { protocol: 'https', hostname: 'media.fc-karben.de', pathname: '/**' },
      // Instagram / Feedframer social tiles (Feedframer tiles also use unoptimized)
      { protocol: 'https', hostname: '*.cdninstagram.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdninstagram.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.fbcdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'feedframer.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.feedframer.com', pathname: '/**' },
    ],
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/logo.png' },
      { pathname: '/favicon.ico' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Native .node addons must stay external (Turbopack/webpack cannot embed them).
  serverExternalPackages: ['ssh2', 'ssh2-sftp-client', '@sentry/profiling-node'],
  // Required for Browser Profiling (JS Self-Profiling API)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Document-Policy', value: 'js-profiling' }],
      },
    ]
  },
}

const withPayloadConfig = withPayload(nextConfig, { devBundleServerPackages: false })

export default withSentryConfig(withPayloadConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // EU region (DSN host is ingest.de.sentry.io)
  sentryUrl: process.env.SENTRY_URL || 'https://de.sentry.io',
  // Show upload progress on Vercel so hangs are visible in logs
  silent: false,
  // false = much faster builds; app source maps still upload
  widenClientFileUpload: false,
  // Avoid ad-blockers blocking the Sentry ingest host
  tunnelRoute: '/monitoring',
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
  sourcemaps: {
    // Skip upload when no auth token (local / preview without secrets)
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Don't fail/hang the Vercel build if Sentry is unreachable
  errorHandler: (err) => {
    console.warn('[sentry] build plugin error (continuing):', err.message)
  },
})

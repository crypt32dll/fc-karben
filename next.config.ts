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
      { protocol: 'https', hostname: 'media.fc-karben.de', pathname: '/wp-content/**' },
      // Instagram CDN only when CMS tiles use next/image without unoptimized.
      // Feedframer tiles set unoptimized and do not need Image Optimization.
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
        pathname: '/v/**',
      },
      {
        protocol: 'https',
        hostname: 'cdninstagram.com',
        pathname: '/v/**',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
        pathname: '/v/**',
      },
    ],
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/logo.png' },
      { pathname: '/favicon.ico' },
    ],
  },
  webpack: (webpackConfig, { dev }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    // Emit .map files for Sentry upload without public sourceMappingURL
    // (Sentry webpack plugin is disabled — see withSentryConfig below)
    if (!dev) {
      webpackConfig.devtool = 'hidden-source-map'
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

// Runtime Sentry (instrumentation*.ts) stays fully active.
// withSentryConfig's webpack instrumentation hangs this project's build on
// "Creating an optimized production build" — keep tunnel + optional sourcemaps,
// but disable the webpack rewrite/instrumentation plugins that cause the hang.
export default withSentryConfig(withPayloadConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sentryUrl: process.env.SENTRY_URL || 'https://de.sentry.io',
  silent: false,
  widenClientFileUpload: false,
  tunnelRoute: '/monitoring',
  // Skip build-time module rewriting (this is what hung Vercel for 40+ min)
  buildTimeInstrumentation: false,
  webpack: {
    disableSentryConfig: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
  useRunAfterProductionCompileHook: true,
  errorHandler: (err) => {
    console.warn('[sentry] build plugin error (continuing):', err.message)
  },
})

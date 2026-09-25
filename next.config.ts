import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

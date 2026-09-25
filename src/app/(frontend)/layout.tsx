import type { Metadata } from 'next'
import { Archivo_Black, Barlow_Condensed, Inter } from 'next/font/google'
import { draftMode } from 'next/headers'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { DraftModeBanner } from '@/components/preview/DraftModeBanner'
import { RefreshRouteOnSave } from '@/components/preview/RefreshRouteOnSave'
import { getSiteSettings } from '@/lib/content-catalog'
import { getPublicSiteURL } from '@/lib/preview/urls'
import { toNextMetadata } from '@/lib/seo'
import { allowSearchIndexing } from '@/lib/seo/generate'

import './globals.css'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-accent',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const siteUrl = getPublicSiteURL()

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const defaults = toNextMetadata(
    {
      title: settings?.defaultSeo?.metaTitle || settings?.clubName || 'FC Karben e.V.',
      description:
        settings?.defaultSeo?.metaDescription ||
        settings?.tagline ||
        'FC Karben e.V. — Fußball in Karben seit 2015. Mannschaften, News und Verein am Günter-Reutzel-Sportfeld.',
      path: '/',
      noIndex: !allowSearchIndexing(),
      ogImageUrl: settings?.defaultSeo?.ogImageUrl,
    },
    { metadataBase: siteUrl },
  )

  return {
    ...defaults,
    metadataBase: new URL(siteUrl),
    title: {
      default: settings?.defaultSeo?.metaTitle || 'FC Karben e.V. | Fußball in Karben seit 2015',
      template: '%s | FC Karben',
    },
    verification: settings?.gscVerification ? { google: settings.gscVerification } : undefined,
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraftPreview } = await draftMode()

  return (
    <html lang="de">
      <body
        className={`${barlow.variable} ${archivo.variable} ${inter.variable} font-body antialiased`}
      >
        {isDraftPreview ? (
          <>
            <DraftModeBanner />
            <RefreshRouteOnSave serverURL={getPublicSiteURL()} />
          </>
        ) : null}
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

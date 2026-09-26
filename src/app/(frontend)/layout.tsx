import type { Metadata } from 'next'
import { Archivo_Black, Barlow_Condensed, Inter } from 'next/font/google'
import { Suspense } from 'react'

import { CookieBanner } from '@/components/consent/CookieBanner'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { DraftModeGate } from '@/components/preview/DraftModeGate'
import { JsonLd } from '@/components/seo/JsonLd'
import { getSiteSettings } from '@/lib/content-catalog'
import { defaultFooterNav, defaultPrimaryNav } from '@/lib/navigation/defaults'
import { getPublicSiteURL } from '@/lib/preview/urls'
import {
  absoluteUrl,
  buildOrganizationJsonLd,
  DEFAULT_OG_IMAGE_PATH,
  toNextMetadata,
} from '@/lib/seo'
import { allowSearchIndexing } from '@/lib/seo/generate'

import './globals.css'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
  // LCP is the hero h1 (font-display) — keep this preload only.
  preload: true,
})

const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-accent',
  display: 'swap',
  // Rare accent use (team chips) — don't compete with LCP CSS/font.
  preload: false,
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
  preload: false,
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
      ogImageUrl: settings?.defaultSeo?.ogImageUrl || DEFAULT_OG_IMAGE_PATH,
    },
    { metadataBase: siteUrl },
  )

  return {
    ...defaults,
    metadataBase: new URL(siteUrl),
    title: {
      default: 'FC Karben e.V. | Fußball in Karben seit 2015',
      template: '%s | FC Karben',
    },
    verification: settings?.gscVerification ? { google: settings.gscVerification } : undefined,
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const nav = settings?.primaryNav?.length ? settings.primaryNav : defaultPrimaryNav()
  const footerNav = settings?.footerNav?.length ? settings.footerNav : defaultFooterNav()
  const addressLine = [settings?.venue, settings?.address].filter(Boolean).join(' · ')
  const orgJsonLd = buildOrganizationJsonLd({
    name: settings?.clubName || 'FC Karben e.V.',
    url: siteUrl,
    logoUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH, { metadataBase: siteUrl }),
    sameAs: [
      settings?.social?.instagram,
      settings?.social?.facebook,
      settings?.social?.tiktok,
    ].filter((u): u is string => Boolean(u)),
    address: settings?.address,
    foundingDate: settings?.foundingYear,
  })

  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body
        className={`${barlow.variable} ${archivo.variable} ${inter.variable} font-body antialiased`}
      >
        <JsonLd data={orgJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[2px] focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-pitch"
        >
          Zum Inhalt springen
        </a>
        <Suspense fallback={null}>
          <DraftModeGate />
        </Suspense>
        <SiteHeader nav={nav} />
        <main id="main-content">{children}</main>
        <SiteFooter columns={footerNav} email={settings?.email} addressLine={addressLine || null} />
        <CookieBanner />
      </body>
    </html>
  )
}

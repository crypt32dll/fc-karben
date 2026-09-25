import type { Metadata } from 'next'
import { Archivo_Black, Barlow_Condensed, Inter } from 'next/font/google'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fc-karben.de'),
  title: {
    default: 'FC Karben e.V. | Fußball in Karben seit 2015',
    template: '%s | FC Karben',
  },
  description:
    'FC Karben e.V. — Fußball in Karben seit 2015. Mannschaften, News und Verein am Günter-Reutzel-Sportfeld.',
  robots: {
    index: process.env.VERCEL_ENV === 'production',
    follow: process.env.VERCEL_ENV === 'production',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body
        className={`${barlow.variable} ${archivo.variable} ${inter.variable} font-body antialiased`}
      >
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

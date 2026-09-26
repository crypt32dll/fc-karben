import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { JsonLd } from '@/components/seo/JsonLd'
import { getHomepage, getRenderContextData, getSiteSettings } from '@/lib/content-catalog'
import { clubAppRoutes } from '@/lib/club-paths'
import { defaultHomepageLayout } from '@/lib/page-builder/default-homepage-layout'
import { absoluteUrl, buildWebSiteJsonLd } from '@/lib/seo'
import { getPublicSiteURL } from '@/lib/seo/generate'

/** Hourly ISR so Instagram / next-match stay fresh without full Cache Components / PPR.
 * Must be a numeric literal — Next requires `revalidate` to be statically analyzable. */
export const revalidate = 3600

export default async function HomePage() {
  const [homepage, context, settings] = await Promise.all([
    getHomepage(),
    getRenderContextData(),
    getSiteSettings(),
  ])

  const blocks =
    Array.isArray(homepage?.layout) && homepage.layout.length > 0
      ? homepage.layout
      : defaultHomepageLayout(homepage)

  const siteUrl = getPublicSiteURL()
  const webSiteJsonLd = buildWebSiteJsonLd({
    name: settings?.clubName || 'FC Karben e.V.',
    url: siteUrl,
    searchUrlTemplate: `${absoluteUrl(clubAppRoutes.search, { metadataBase: siteUrl })}?q={search_term_string}`,
  })

  return (
    <>
      <JsonLd data={webSiteJsonLd} />
      <RenderBlocks blocks={blocks} context={context} />
    </>
  )
}

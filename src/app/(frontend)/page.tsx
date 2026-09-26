import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { getHomepage, getRenderContextData } from '@/lib/content-catalog'
import { defaultHomepageLayout } from '@/lib/page-builder/default-homepage-layout'

/** Hourly ISR so Instagram / next-match stay fresh without full Cache Components / PPR.
 * Must be a numeric literal — Next requires `revalidate` to be statically analyzable. */
export const revalidate = 3600

export default async function HomePage() {
  const [homepage, context] = await Promise.all([getHomepage(), getRenderContextData()])

  const blocks =
    Array.isArray(homepage?.layout) && homepage.layout.length > 0
      ? homepage.layout
      : defaultHomepageLayout(homepage)

  return <RenderBlocks blocks={blocks} context={context} />
}

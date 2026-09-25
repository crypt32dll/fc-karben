import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { getHomepage, getRenderContextData } from '@/lib/content-catalog'
import { defaultHomepageLayout } from '@/lib/page-builder/default-homepage-layout'

export const revalidate = false

export default async function HomePage() {
  const [homepage, context] = await Promise.all([getHomepage(), getRenderContextData()])

  const blocks =
    Array.isArray(homepage?.layout) && homepage.layout.length > 0
      ? homepage.layout
      : defaultHomepageLayout(homepage)

  return <RenderBlocks blocks={blocks} context={context} />
}

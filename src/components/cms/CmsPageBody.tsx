import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { LexicalContent } from '@/components/cms/LexicalContent'
import { type CatalogPage, getRenderContextData } from '@/lib/content-catalog'

export async function CmsPageBody({ page }: { page: CatalogPage }) {
  const hasBlocks = Array.isArray(page.layout) && page.layout.length > 0
  const context = hasBlocks ? await getRenderContextData() : null

  return (
    <article className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="text-5xl text-navy">{page.title}</h1>
      {hasBlocks && context ? (
        <div className="mt-10 -mx-8 max-w-none md:mx-0">
          <RenderBlocks blocks={page.layout} context={context} />
        </div>
      ) : (
        <div className="mt-8">
          <LexicalContent data={page.content} />
        </div>
      )}
    </article>
  )
}

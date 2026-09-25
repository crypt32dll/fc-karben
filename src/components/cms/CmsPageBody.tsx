import { LexicalContent } from '@/components/cms/LexicalContent'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { CatalogPage } from '@/lib/content-catalog'

export function CmsPageBody({ page }: { page: CatalogPage }) {
  const hasBlocks = Array.isArray(page.layout) && page.layout.length > 0

  return (
    <article className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="text-5xl text-navy">{page.title}</h1>
      {hasBlocks ? (
        <div className="mt-10">
          <RenderBlocks blocks={page.layout as never} />
        </div>
      ) : (
        <div className="mt-8">
          <LexicalContent data={page.content} />
        </div>
      )}
    </article>
  )
}

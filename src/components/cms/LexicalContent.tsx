import { RichText } from '@payloadcms/richtext-lexical/react'

import type { CatalogBody } from '@/lib/content-catalog'

type Props = {
  data: CatalogBody | null | undefined
  className?: string
}

/** ClubSite body renderer — accepts CatalogBody only (Payload Lexical stays behind the catalog seam). */
export function LexicalContent({ data, className }: Props) {
  if (!data?.root) return null

  return (
    <RichText
      // RichText expects Payload's SerializedEditorState; CatalogBody is the validated subset.
      data={data as never}
      className={
        className ||
        'prose prose-neutral max-w-none text-ink leading-relaxed prose-headings:font-display prose-headings:text-navy prose-a:font-semibold prose-a:text-navy prose-a:underline prose-a:underline-offset-2 prose-a:decoration-navy/35 prose-a:transition-colors prose-a:hover:decoration-navy prose-table:w-full prose-th:bg-paper prose-th:text-navy'
      }
    />
  )
}

import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'

import type { CatalogBody } from '@/lib/content-catalog'
import {
  type EmbeddedImage,
  embeddedImageFromLexicalLink,
} from '@/lib/rich-text/embedded-image-link'

type Props = {
  data: CatalogBody | null | undefined
  className?: string
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  autolink: (args) => renderLinkOrImage(args, defaultConverters.autolink),
  link: (args) => renderLinkOrImage(args, defaultConverters.link),
})

const renderLinkOrImage = (
  args: { node: unknown },
  fallback: ((args: never) => unknown) | unknown,
) => {
  const image = embeddedImageFromLexicalLink(args.node)
  if (image) return <ContentImage image={image} />
  return typeof fallback === 'function' ? fallback(args as never) : fallback
}

function ContentImage({ image }: { image: EmbeddedImage }) {
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      className="my-6 block h-auto w-full"
    />
  )
}

/** ClubSite body renderer — accepts CatalogBody only (Payload Lexical stays behind the catalog seam). */
export function LexicalContent({ data, className }: Props) {
  if (!data?.root) return null

  return (
    <RichText
      // RichText expects Payload's SerializedEditorState; CatalogBody is the validated subset.
      data={data as never}
      converters={converters}
      className={
        className ||
        'prose prose-neutral max-w-none text-ink leading-relaxed prose-headings:font-display prose-headings:text-navy prose-a:font-semibold prose-a:text-navy prose-a:underline prose-a:underline-offset-2 prose-a:decoration-navy/35 prose-a:transition-colors prose-a:hover:decoration-navy prose-img:my-6 prose-img:w-full prose-hr:my-9 prose-hr:border-0 prose-hr:h-px prose-hr:bg-line prose-table:w-full prose-th:bg-paper prose-th:text-navy'
      }
    />
  )
}

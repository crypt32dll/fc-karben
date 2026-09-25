import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type Props = {
  data: unknown
  className?: string
}

export function LexicalContent({ data, className }: Props) {
  if (!data || typeof data !== 'object') return null
  const state = data as SerializedEditorState
  if (!state.root) return null

  return (
    <RichText
      data={state}
      className={
        className ||
        'prose prose-neutral max-w-none text-ink prose-headings:font-display prose-headings:text-navy prose-a:text-navy'
      }
    />
  )
}

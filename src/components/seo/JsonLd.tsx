/** Renders a JSON-LD script for Google / schema.org (Server Component safe). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is trusted structured data we generate ourselves.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

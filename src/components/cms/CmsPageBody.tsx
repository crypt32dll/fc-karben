import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { GoogleCalendarEmbed } from '@/components/cms/GoogleCalendarEmbed'
import { LexicalContent } from '@/components/cms/LexicalContent'
import { SponsorLogoSections } from '@/components/cms/SponsorLogoSections'
import { type CatalogPage, getRenderContextData, listSponsoren } from '@/lib/content-catalog'

export async function CmsPageBody({ page }: { page: CatalogPage }) {
  const hasBlocks = Array.isArray(page.layout) && page.layout.length > 0
  const context = hasBlocks ? await getRenderContextData() : null
  const isSponsoren = page.slug === 'sponsoren' || page.path === '/sponsoren'
  const isPlatzbelegung = page.slug === 'platzbelegung' || page.path === '/verein/platzbelegung'
  const sponsors = isSponsoren ? await listSponsoren() : []
  const useLogoGrid = isSponsoren && sponsors.length > 0
  const wide = useLogoGrid || isPlatzbelegung

  return (
    <article className={`mx-auto px-8 py-16 ${wide ? 'max-w-[1120px]' : 'max-w-[800px]'}`}>
      <h1 className="text-5xl text-navy">{page.title}</h1>
      {hasBlocks && context ? (
        <div className="mt-10 -mx-8 max-w-none md:mx-0">
          <RenderBlocks blocks={page.layout} context={context} />
        </div>
      ) : useLogoGrid ? (
        <SponsorLogoSections sponsors={sponsors} />
      ) : (
        <div className="mt-8">
          <LexicalContent data={page.content} />
          {isPlatzbelegung ? <GoogleCalendarEmbed /> : null}
        </div>
      )}
    </article>
  )
}

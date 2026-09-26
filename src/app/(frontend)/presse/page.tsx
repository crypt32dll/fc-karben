import type { Metadata } from 'next'

import { FeaturedMedia } from '@/components/cms/FeaturedMedia'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { JsonLd } from '@/components/seo/JsonLd'
import { ClubLink } from '@/components/ui/ClubLink'
import { clubPages, hrefForPage } from '@/lib/club-paths'
import { catalogSeoToMetadata, getSeiteBySlug, listBeitrage } from '@/lib/content-catalog'
import { absoluteUrl, buildCollectionPageJsonLd } from '@/lib/seo'
import { getPublicSiteURL } from '@/lib/seo/generate'

export const revalidate = false

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSeiteBySlug(clubPages.presse.slug)
  if (page) {
    return catalogSeoToMetadata({
      title: page.title,
      path: hrefForPage('presse'),
      seo: page.seo,
    })
  }
  return { title: 'Presse' }
}

export default async function PressePage() {
  const { posts, totalDocs } = await listBeitrage({ limit: 100 })
  const siteUrl = getPublicSiteURL()
  const absOpts = { metadataBase: siteUrl }
  const presseUrl = absoluteUrl(hrefForPage('presse'), absOpts)

  return (
    <div className="mx-auto max-w-[1120px] px-8 py-16">
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: 'Presse',
          url: presseUrl,
          description: `${totalDocs} Beiträge aus dem Vereinsarchiv.`,
          items: posts.slice(0, 20).map((post) => ({
            name: post.title,
            url: absoluteUrl(post.path, absOpts),
          })),
        })}
      />
      <Reveal immediate>
        <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
          News &amp; Spielberichte
        </p>
        <h1 className="text-5xl text-navy">Presse</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">{totalDocs} Beiträge aus dem Vereinsarchiv.</p>
      </Reveal>

      <Stagger className="mt-12 divide-y divide-line border-t border-line" as="ul">
        {posts.map((post) => (
          <StaggerItem key={post.id} as="li">
            <ClubLink
              href={post.path}
              className="club-interactive group flex gap-4 py-5 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:bg-paper sm:gap-6 sm:px-2"
            >
              <FeaturedMedia
                src={post.featuredImageUrl}
                alt=""
                className="w-[7.5rem] shrink-0 sm:w-36"
                aspectClassName="aspect-[4/3]"
                sizes="144px"
              />
              <span className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <span className="text-lg font-semibold text-navy group-hover:underline">
                    {post.title}
                  </span>
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt} className="shrink-0 text-sm text-ink-soft">
                      {new Date(post.publishedAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  ) : null}
                </span>
                {post.excerpt ? (
                  <span className="line-clamp-2 text-sm text-ink-soft">{post.excerpt}</span>
                ) : null}
              </span>
            </ClubLink>
          </StaggerItem>
        ))}
      </Stagger>

      {posts.length === 0 ? (
        <p className="mt-8 text-ink-soft">Noch keine veröffentlichten Beiträge.</p>
      ) : null}
    </div>
  )
}

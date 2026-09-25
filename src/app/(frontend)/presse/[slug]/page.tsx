import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FeaturedMedia } from '@/components/cms/FeaturedMedia'
import { LexicalContent } from '@/components/cms/LexicalContent'
import { Reveal } from '@/components/motion/Reveal'
import { ClubLink } from '@/components/ui/ClubLink'
import { hrefForPage } from '@/lib/club-paths'
import { catalogSeoToMetadata, getBeitragBySlug } from '@/lib/content-catalog'

export const revalidate = false

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBeitragBySlug(slug)
  if (!post) return { title: 'Beitrag' }
  return catalogSeoToMetadata({
    title: post.title,
    path: post.path,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    seo: post.seo,
    type: 'article',
  })
}

export default async function PresseArtikelPage({ params }: Props) {
  const { slug } = await params
  const post = await getBeitragBySlug(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-[800px] px-8 py-16">
      <Reveal immediate>
        <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
          <ClubLink
            href={hrefForPage('presse')}
            className="inline-flex min-h-11 items-center underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Presse
          </ClubLink>
          {post.categories?.[0] ? ` · ${post.categories[0].title}` : null}
        </p>
        <h1 className="text-5xl text-navy">{post.title}</h1>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt} className="mt-4 block text-sm text-ink-soft">
            {new Date(post.publishedAt).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        ) : null}
      </Reveal>
      <FeaturedMedia
        src={post.featuredImageUrl}
        alt={post.featuredImageAlt || post.title}
        priority
        className="mt-8"
      />
      <div className="mt-10">
        <LexicalContent data={post.content} />
      </div>
      <p className="mt-12 border-t border-line pt-6 text-sm">
        <ClubLink
          href={hrefForPage('presse')}
          className="inline-flex min-h-11 items-center font-semibold text-navy underline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          ← Alle Beiträge
        </ClubLink>
      </p>
    </article>
  )
}

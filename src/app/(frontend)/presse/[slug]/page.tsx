import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FeaturedMedia } from '@/components/cms/FeaturedMedia'
import { LexicalContent } from '@/components/cms/LexicalContent'
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
      <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
        <Link href="/presse" className="hover:underline">
          Presse
        </Link>
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
        <Link href="/presse" className="font-semibold text-navy">
          ← Alle Beiträge
        </Link>
      </p>
    </article>
  )
}

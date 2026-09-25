import type { Metadata } from 'next'
import Link from 'next/link'

import { catalogSeoToMetadata, getSeiteBySlug, listBeitrage } from '@/lib/content-catalog'

export const revalidate = false

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSeiteBySlug('presse')
  if (page) {
    return catalogSeoToMetadata({
      title: page.title,
      path: '/presse',
      seo: page.seo,
    })
  }
  return { title: 'Presse' }
}

export default async function PressePage() {
  const { posts, totalDocs } = await listBeitrage({ limit: 50 })

  return (
    <div className="mx-auto max-w-[1120px] px-8 py-16">
      <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
        News &amp; Spielberichte
      </p>
      <h1 className="text-5xl text-navy">Presse</h1>
      <p className="mt-4 max-w-2xl text-ink-soft">{totalDocs} Beiträge aus dem Vereinsarchiv.</p>

      <ul className="mt-12 divide-y divide-line border-t border-line">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={post.path}
              className="group flex flex-col gap-1 py-5 transition-colors hover:bg-paper sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-2"
            >
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
            </Link>
            {post.excerpt ? (
              <p className="pb-5 text-sm text-ink-soft sm:px-2">{post.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {posts.length === 0 ? (
        <p className="mt-8 text-ink-soft">Noch keine veröffentlichten Beiträge.</p>
      ) : null}
    </div>
  )
}

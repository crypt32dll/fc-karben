import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { CmsPageBody } from '@/components/cms/CmsPageBody'
import { TeamTabs } from '@/components/teams/TeamTabs'
import { catalogSeoToMetadata, listBeitrage, resolveRootSlug } from '@/lib/content-catalog'

export const revalidate = false

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hit = await resolveRootSlug(slug)

  if (hit.kind === 'seite') {
    return catalogSeoToMetadata({
      title: hit.page.title,
      path: hit.page.path,
      seo: hit.page.seo,
      updatedAt: hit.page.updatedAt,
    })
  }

  if (hit.kind === 'mannschaft') {
    return catalogSeoToMetadata({
      title: hit.team.name,
      path: hit.team.path,
      excerpt: hit.team.summary,
      seo: hit.team.seo,
      featuredImageUrl: hit.team.photoUrl,
    })
  }

  return { title: slug }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const hit = await resolveRootSlug(slug)

  if (hit.kind === 'redirect') {
    if (hit.permanent) permanentRedirect(hit.to)
    redirect(hit.to)
  }

  if (hit.kind === 'mannschaft') {
    const { team } = hit
    const reports = team.reportCategorySlug
      ? (await listBeitrage({ limit: 12, categorySlug: team.reportCategorySlug })).posts
      : []

    return (
      <article className="mx-auto max-w-[800px] px-8 py-16">
        <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
          Mannschaft
        </p>
        <h1 className="text-5xl text-navy">{team.name}</h1>
        {team.league ? <p className="mt-3 text-ink-soft">{team.league}</p> : null}
        <TeamTabs team={team} reports={reports} />
      </article>
    )
  }

  if (hit.kind === 'seite') {
    const { page, team } = hit
    return (
      <>
        {team ? (
          <div className="mx-auto max-w-[800px] px-8 pt-12">
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
              Mannschaft
            </p>
            {team.league ? <p className="mt-1 text-sm text-ink-soft">{team.league}</p> : null}
          </div>
        ) : null}
        <CmsPageBody page={page} />
      </>
    )
  }

  notFound()
}

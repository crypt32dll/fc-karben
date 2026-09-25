import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { CmsPageBody } from '@/components/cms/CmsPageBody'
import { LexicalContent } from '@/components/cms/LexicalContent'
import {
  catalogSeoToMetadata,
  getMannschaftBySlug,
  getSeiteBySlug,
  resolveRedirect,
} from '@/lib/content-catalog'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getSeiteBySlug(slug)
  if (page) {
    return catalogSeoToMetadata({
      title: page.title,
      path: page.path,
      seo: page.seo,
      updatedAt: page.updatedAt,
    })
  }

  const team = await getMannschaftBySlug(slug)
  if (team) return { title: team.name }

  return { title: slug }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params

  // Prefer migrated Seite (incl. SEO/body) when present — covers team pages too
  const page = await getSeiteBySlug(slug)
  const team = await getMannschaftBySlug(slug)

  if (team && !page?.content && !(Array.isArray(page?.layout) && page.layout.length)) {
    return (
      <article className="mx-auto max-w-[800px] px-8 py-16">
        <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
          Mannschaft
        </p>
        <h1 className="text-5xl text-navy">{team.name}</h1>
        {team.league ? <p className="mt-3 text-ink-soft">{team.league}</p> : null}
        {team.summary ? <p className="mt-6 max-w-2xl text-lg text-ink">{team.summary}</p> : null}
        {team.content ? (
          <div className="mt-8">
            <LexicalContent data={team.content} />
          </div>
        ) : null}
        {team.fussballDeUrl ? (
          <a
            href={team.fussballDeUrl}
            className="mt-8 inline-flex rounded-[2px] bg-navy px-5 py-3 text-sm font-semibold text-white"
            rel="noopener noreferrer"
            target="_blank"
          >
            Spielplan auf Fussball.de
          </a>
        ) : null}
      </article>
    )
  }

  if (page) {
    if (page.path && page.path !== `/${slug}` && page.path.startsWith('/verein/')) {
      permanentRedirect(page.path)
    }
    return (
      <>
        {team ? (
          <div className="mx-auto max-w-[800px] px-8 pt-12">
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
              Mannschaft
            </p>
            {team.league ? <p className="mt-1 text-sm text-ink-soft">{team.league}</p> : null}
            {team.fussballDeUrl ? (
              <a
                href={team.fussballDeUrl}
                className="mt-4 inline-flex rounded-[2px] bg-navy px-4 py-2 text-sm font-semibold text-white"
                rel="noopener noreferrer"
                target="_blank"
              >
                Spielplan auf Fussball.de
              </a>
            ) : null}
          </div>
        ) : null}
        <CmsPageBody page={page} />
      </>
    )
  }

  const redir = await resolveRedirect(`/${slug}`)
  if (redir) {
    if (redir.permanent) permanentRedirect(redir.to)
    redirect(redir.to)
  }

  notFound()
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CmsPageBody } from '@/components/cms/CmsPageBody'
import { catalogSeoToMetadata, getSeiteByPath, getSeiteBySlug } from '@/lib/content-catalog'

export const revalidate = 300

type Props = { params: Promise<{ segment: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment } = await params
  const page = (await getSeiteByPath(`/verein/${segment}`)) || (await getSeiteBySlug(segment))
  if (!page) return { title: 'Verein' }
  return catalogSeoToMetadata({
    title: page.title,
    path: page.path || `/verein/${segment}`,
    seo: page.seo,
    updatedAt: page.updatedAt,
  })
}

export default async function VereinSubpage({ params }: Props) {
  const { segment } = await params
  const page = (await getSeiteByPath(`/verein/${segment}`)) || (await getSeiteBySlug(segment))
  if (!page) notFound()
  return (
    <>
      <div className="mx-auto max-w-[800px] px-8 pt-16">
        <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
          Verein
        </p>
      </div>
      <CmsPageBody page={page} />
    </>
  )
}

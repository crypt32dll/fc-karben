import Image from 'next/image'

import type { CatalogSponsor } from '@/lib/content-catalog'

type Props = {
  sponsors: CatalogSponsor[]
}

const GROUP_ORDER = [
  'hauptsponsoren',
  'medienpartner',
  'ausruester',
  'kooperationspartner',
] as const

/**
 * Uniform logo tiles from CMS sponsors: equal cells, object-contain, external links.
 */
export function SponsorLogoSections({ sponsors }: Props) {
  const sections = groupSponsors(sponsors)
  if (sections.length === 0) return null

  return (
    <div className="mt-10 space-y-12">
      {sections.map((section) => (
        <section key={section.key}>
          {section.heading ? (
            <h2 className="mb-5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
              {section.heading}
            </h2>
          ) : null}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {section.items.map((sponsor) => (
              <li key={sponsor.id}>
                <LogoTile sponsor={sponsor} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function groupSponsors(sponsors: CatalogSponsor[]) {
  const byGroup = new Map<string, CatalogSponsor[]>()
  for (const s of sponsors) {
    const key = s.group || 'hauptsponsoren'
    const list = byGroup.get(key) || []
    list.push(s)
    byGroup.set(key, list)
  }

  const orderedKeys = [
    ...GROUP_ORDER.filter((k) => byGroup.has(k)),
    ...[...byGroup.keys()].filter((k) => !(GROUP_ORDER as readonly string[]).includes(k)),
  ]

  return orderedKeys.map((key) => {
    const items = byGroup.get(key) || []
    return {
      key,
      heading: items[0]?.groupLabel || key,
      items,
    }
  })
}

function LogoTile({ sponsor }: { sponsor: CatalogSponsor }) {
  const inner = (
    <span className="relative block h-12 w-full sm:h-14">
      {sponsor.logoUrl ? (
        <Image
          src={sponsor.logoUrl}
          alt={sponsor.name}
          fill
          className="object-contain object-center"
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 160px"
          loading="lazy"
        />
      ) : (
        <span className="flex h-full items-center justify-center text-center text-xs font-semibold text-ink-soft">
          {sponsor.name}
        </span>
      )}
    </span>
  )

  const frameClass =
    'flex h-[5.5rem] items-center justify-center border border-line bg-white px-3 py-3 transition-colors motion-reduce:transition-none sm:h-24 sm:px-4'

  if (sponsor.url) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`club-interactive ${frameClass} hover:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy`}
        aria-label={`${sponsor.name} — Website öffnen`}
      >
        {inner}
      </a>
    )
  }

  return <div className={frameClass}>{inner}</div>
}

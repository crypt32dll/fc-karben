import Link from 'next/link'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import {
  getHomepage,
  getRenderContextData,
  listBeitrage,
  listMannschaften,
} from '@/lib/content-catalog'

export const revalidate = 300

export default async function HomePage() {
  const [homepage, context, teams, { posts }] = await Promise.all([
    getHomepage(),
    getRenderContextData(),
    listMannschaften(),
    listBeitrage({ limit: 4 }),
  ])

  if (Array.isArray(homepage?.layout) && homepage.layout.length > 0) {
    return <RenderBlocks blocks={homepage.layout as never} context={context} />
  }

  const displayTeams = teams.length ? teams : context.teams

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="relative z-10 mx-auto max-w-[1120px] px-8 pb-16 pt-24">
          <p className="mb-4 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-[#b9bade]">
            {homepage?.heroEyebrow || 'Gruppenliga · Saison 2025/26'}
          </p>
          <h1 className="max-w-[640px] text-[clamp(42px,7vw,76px)] text-white">
            {homepage?.heroTitle ? (
              homepage.heroTitle
            ) : (
              <>
                Mit Leidenschaft
                <br />
                für{' '}
                <span className="text-transparent [-webkit-text-stroke:1px_white]">Karben.</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-[#cfd0e8]">
            {homepage?.heroLead ||
              'Der FC Karben e.V. ist die fußballerische Heimat der Stadt Karben — vom Bambini-Training bis zur ersten Mannschaft. Gegründet 2015, getragen von echter Vereinsliebe.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href={homepage?.heroPrimaryCta?.href || '/verein/mitglied-werden'}
              className="inline-flex rounded-[2px] bg-white px-6 py-3.5 text-sm font-semibold text-navy hover:bg-[#e4e4f4]"
            >
              {homepage?.heroPrimaryCta?.label || 'Jetzt Mitglied werden'}
            </Link>
            <Link
              href={homepage?.heroSecondaryCta?.href || '/#mannschaften'}
              className="inline-flex rounded-[2px] border border-white/40 px-6 py-3.5 text-sm font-semibold text-white hover:border-white"
            >
              {homepage?.heroSecondaryCta?.label || 'Mannschaften ansehen'}
            </Link>
          </div>
        </div>
        <div className="border-t border-white/12 bg-navy-deep">
          <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-8 py-5">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#8f90c0]">
              Nächstes Spiel
            </span>
            <span className="text-[13px] text-[#b9bade]">
              Spielplan wird aus Fussball.de synchronisiert (1. Mannschaft)
            </span>
          </div>
        </div>
      </section>

      <section id="mannschaften" className="py-20">
        <div className="mx-auto max-w-[1120px] px-8">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
                Unsere Teams
              </p>
              <h2 className="text-[38px] text-navy">Mannschaften</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {displayTeams.map((team) => (
              <Link
                key={team.id}
                href={team.path}
                className="bg-white p-7 transition-colors hover:bg-paper"
              >
                <div className="mb-3.5 font-accent text-[13px] text-pitch">{team.shortLabel}</div>
                <h3 className="mb-1.5 text-2xl text-navy">{team.name}</h3>
                <p className="text-[13px] text-ink-soft">{team.league}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="presse" className="bg-paper py-20">
        <div className="mx-auto max-w-[1120px] px-8">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
                Aktuelles
              </p>
              <h2 className="text-[38px] text-navy">Presse</h2>
            </div>
            <Link
              href="/presse"
              className="border-b border-navy pb-0.5 text-sm font-semibold text-navy"
            >
              Alle Beiträge →
            </Link>
          </div>
          <ul className="divide-y divide-line border border-line bg-white">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={post.path}
                  className="flex flex-col gap-1 px-5 py-4 hover:bg-paper sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-semibold text-navy">{post.title}</span>
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt} className="text-sm text-ink-soft">
                      {new Date(post.publishedAt).toLocaleDateString('de-DE')}
                    </time>
                  ) : null}
                </Link>
              </li>
            ))}
            {posts.length === 0 ? (
              <li className="px-5 py-6 text-sm text-ink-soft">Beiträge folgen.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section id="aktuelles" className="py-20">
        <div className="mx-auto max-w-[1120px] px-8">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
                Live von Instagram
              </p>
              <h2 className="text-[38px] text-navy">Auf Social Media</h2>
            </div>
            <a
              href="https://www.instagram.com/fckarben/"
              className="border-b border-navy pb-0.5 text-sm font-semibold text-navy"
            >
              Mehr auf Instagram →
            </a>
          </div>
          <div className="mb-10 grid grid-cols-3 gap-0.5 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-navy odd:bg-navy-mid even:bg-navy-deep"
                aria-hidden
              />
            ))}
          </div>
          <p className="text-sm text-ink-soft">
            Redaktion pflegt Kacheln manuell im CMS (Social Tiles). Graph-API später optional.
          </p>
        </div>
      </section>

      <section id="verein" className="py-20">
        <div className="mx-auto grid max-w-[1120px] gap-12 px-8 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
              Über uns
            </p>
            <h2 className="text-[38px] text-navy">Der Verein</h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-soft">
              {homepage?.vereinIntro ||
                'Der FC Karben e.V. wurde im Mai 2015 gegründet und ist seitdem als fußballerische Heimat in der Stadt Karben gewachsen.'}
            </p>
            <Link
              href="/verein/vereinssatzung"
              className="mt-6 inline-flex rounded-[2px] bg-navy px-5 py-3 text-sm font-semibold text-white"
            >
              Vereinssatzung ansehen
            </Link>
            <div className="mt-10 flex gap-8">
              <div>
                <div className="font-display text-4xl text-navy">2015</div>
                <div className="text-sm text-ink-soft">Gegründet</div>
              </div>
              <div>
                <div className="font-display text-4xl text-navy">{displayTeams.length || 5}</div>
                <div className="text-sm text-ink-soft">Mannschaften</div>
              </div>
            </div>
          </div>
          <div className="border border-line p-6">
            <p className="mb-4 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
              Vorstand
            </p>
            <div className="divide-y divide-line">
              <div className="flex justify-between py-3 text-sm">
                <span className="text-ink-soft">1. Vorsitzender</span>
                <span className="font-semibold">Frank Lindner</span>
              </div>
              <div className="flex justify-between py-3 text-sm">
                <span className="text-ink-soft">Kontakt</span>
                <a href="mailto:info@fc-karben.de" className="font-semibold text-navy">
                  info@fc-karben.de
                </a>
              </div>
            </div>
            <Link
              href="/verein/vorstand"
              className="mt-4 inline-block text-sm font-semibold text-navy"
            >
              Mehr zum Vorstand →
            </Link>
          </div>
        </div>
      </section>

      <section id="sponsoren" className="border-y border-line py-14">
        <div className="mx-auto max-w-[1120px] px-8">
          <p className="mb-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
            Unsere Sponsoren
          </p>
          <div className="flex flex-wrap gap-3">
            {context.sponsors.length ? (
              context.sponsors.slice(0, 6).map((s) => (
                <a
                  key={s.id}
                  href={s.url || '/sponsoren'}
                  className="flex h-16 min-w-[120px] flex-1 items-center justify-center border border-line bg-paper text-sm text-ink-soft"
                >
                  {s.name}
                </a>
              ))
            ) : (
              <Link
                href="/sponsoren"
                className="flex h-16 min-w-[120px] flex-1 items-center justify-center border border-line bg-paper text-sm font-semibold text-navy"
              >
                Alle Sponsoren →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-[1120px] px-8 text-center">
          <h2 className="text-4xl">Folgt uns</h2>
          <p className="mx-auto mt-3 max-w-lg text-[#cfd0e8]">
            Spieltag-Eindrücke, Kurzvideos und Neuigkeiten gibt&apos;s zuerst auf Social Media.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/fckarben/"
              className="rounded-[2px] border border-white/30 px-5 py-2.5 text-sm font-semibold"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/FCKarben"
              className="rounded-[2px] border border-white/30 px-5 py-2.5 text-sm font-semibold"
            >
              Facebook
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

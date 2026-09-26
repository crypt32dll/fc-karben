import { FeaturedMedia } from '@/components/cms/FeaturedMedia'
import { LexicalContent } from '@/components/cms/LexicalContent'
import { ClubLink } from '@/components/ui/ClubLink'
import { hrefForPage } from '@/lib/club-paths'
import type { CatalogBody, CatalogPost, CatalogTeam } from '@/lib/content-catalog'

import { FussballDeDisclosure } from './FussballDeDisclosure'
import { TeamJumpNav } from './TeamJumpNav'

type Props = {
  team: CatalogTeam
  reports: CatalogPost[]
}

const sectionClass = 'scroll-mt-[calc(var(--header-height)+3.5rem)]'

/**
 * Mannschaft scroll layout: sticky jump nav, club content first,
 * fussball.de widgets behind progressive disclosure.
 */
export function TeamPage({ team, reports }: Props) {
  return (
    <div className="mt-10">
      <TeamJumpNav teamName={team.name} />

      <div className="mx-auto max-w-[800px] space-y-16">
        <section id="ueber-uns" className={sectionClass} aria-labelledby="heading-ueber-uns">
          <h2 id="heading-ueber-uns" className="mb-6 font-display text-3xl text-navy">
            Über uns
          </h2>
          <AboutSection team={team} />
        </section>
      </div>

      <div className="mx-auto mt-16 max-w-[1120px] space-y-10">
        <section id="spielplan" className={sectionClass} aria-labelledby="heading-spielplan">
          <FussballDeDisclosure
            title="Spielplan"
            headingId="heading-spielplan"
            label="Spielplan"
            dataId={team.widgetSpielplanId}
            type="team-matches"
            fussballDeUrl={team.fussballDeUrl}
          />
        </section>

        <section id="tabelle" className={sectionClass} aria-labelledby="heading-tabelle">
          <FussballDeDisclosure
            title="Tabelle"
            headingId="heading-tabelle"
            label="Tabelle"
            dataId={team.widgetTabelleId}
            type="table"
            fussballDeUrl={team.fussballDeUrl}
          />
        </section>

        <section id="berichte" className={sectionClass} aria-labelledby="heading-berichte">
          {team.widgetSpielberichteId ? (
            <FussballDeDisclosure
              title="Spielberichte"
              headingId="heading-berichte"
              label="Spielberichte"
              dataId={team.widgetSpielberichteId}
              type="news"
              fussballDeUrl={team.fussballDeUrl}
            />
          ) : (
            <h2 id="heading-berichte" className="mb-6 font-display text-3xl text-navy">
              Spielberichte
            </h2>
          )}
          {reports.length ? (
            <div className={team.widgetSpielberichteId ? 'mt-8' : undefined}>
              {team.widgetSpielberichteId ? (
                <h3 className="mb-4 font-display text-2xl text-navy">Aus der Presse</h3>
              ) : null}
              <ReportsSection reports={reports} />
            </div>
          ) : !team.widgetSpielberichteId ? (
            <div>
              <p className="text-ink-soft">Aktuell keine Spielberichte für diese Mannschaft.</p>
              <ClubLink
                href={hrefForPage('presse')}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-2"
              >
                Zur Presse →
              </ClubLink>
            </div>
          ) : null}
        </section>
      </div>

      <div className="mx-auto mt-16 max-w-[800px] space-y-16">
        <section id="kontakt" className={sectionClass} aria-labelledby="heading-kontakt">
          <h2 id="heading-kontakt" className="mb-6 font-display text-3xl text-navy">
            Kontakt
          </h2>
          <KontaktSection team={team} />
        </section>
      </div>
    </div>
  )
}

function AboutSection({ team }: { team: CatalogTeam }) {
  return (
    <div className="space-y-8">
      {team.photoUrl ? (
        <FeaturedMedia src={team.photoUrl} alt={team.photoAlt || team.name} />
      ) : null}
      {team.summary ? <p className="max-w-2xl text-lg text-ink">{team.summary}</p> : null}
      {team.content ? <LexicalContent data={team.content as CatalogBody} /> : null}
      {!team.content && !team.summary && !team.photoUrl ? (
        <p className="text-ink-soft">Noch kein Team-Text hinterlegt.</p>
      ) : null}
    </div>
  )
}

function ReportsSection({ reports }: { reports: CatalogPost[] }) {
  return (
    <ul className="divide-y divide-line border border-line">
      {reports.map((post) => (
        <li key={post.id}>
          <ClubLink
            href={post.path}
            className="club-interactive flex min-h-11 flex-col gap-1 px-4 py-4 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <span className="font-semibold text-ink">{post.title}</span>
            {post.publishedAt ? (
              <time className="text-xs text-ink-soft" dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('de-DE')}
              </time>
            ) : null}
          </ClubLink>
        </li>
      ))}
    </ul>
  )
}

function KontaktSection({ team }: { team: CatalogTeam }) {
  const contacts = team.contacts || []
  const hasContactContent = Boolean(team.contactContent)
  const empty = !hasContactContent && !team.trainingTimes && !contacts.length

  return (
    <div className="space-y-8">
      {hasContactContent ? <LexicalContent data={team.contactContent as CatalogBody} /> : null}
      {team.trainingTimes ? (
        <div>
          <h3 className="mb-3 font-display text-2xl text-navy">Trainingszeiten</h3>
          <p className="whitespace-pre-line text-ink">{team.trainingTimes}</p>
        </div>
      ) : null}
      {contacts.length ? (
        <div>
          <h3 className="mb-3 font-display text-2xl text-navy">Ansprechpartner</h3>
          <ul className="space-y-4">
            {contacts.map((c) => (
              <li key={`${c.role}-${c.name}`} className="border-b border-line pb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-pitch">{c.role}</p>
                <p className="font-semibold text-ink">{c.name}</p>
                {c.phone ? (
                  <a href={`tel:${c.phone}`} className="mt-1 block min-h-11 py-2 text-sm text-navy">
                    {c.phone}
                  </a>
                ) : null}
                {c.email ? (
                  <a
                    href={`mailto:${c.email}`}
                    className="block min-h-11 py-2 text-sm text-navy underline underline-offset-2"
                  >
                    {c.email}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {empty ? <p className="text-ink-soft">Noch keine Kontaktdaten hinterlegt.</p> : null}
    </div>
  )
}

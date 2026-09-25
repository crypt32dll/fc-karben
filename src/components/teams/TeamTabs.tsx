'use client'

import { useState } from 'react'

import { FeaturedMedia } from '@/components/cms/FeaturedMedia'
import { LexicalContent } from '@/components/cms/LexicalContent'
import { ClubLink } from '@/components/ui/ClubLink'
import type { CatalogBody, CatalogPost, CatalogTeam } from '@/lib/content-catalog'
import { hrefForPage } from '@/lib/club-paths'

import { FussballDeWidget } from './FussballDeWidget'

type TabId = 'team' | 'spielplan' | 'tabelle' | 'spielberichte' | 'kontakt'

type Props = {
  team: CatalogTeam
  reports: CatalogPost[]
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'team', label: 'Team' },
  { id: 'spielplan', label: 'Spielplan' },
  { id: 'tabelle', label: 'Tabelle' },
  { id: 'spielberichte', label: 'Spielberichte' },
  { id: 'kontakt', label: 'Kontakt' },
]

export function TeamTabs({ team, reports }: Props) {
  const [tab, setTab] = useState<TabId>('team')

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label={`${team.name} Bereiche`}
        className="flex flex-wrap gap-1 border-b border-line"
      >
        {TABS.map((t) => {
          const selected = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              className={`min-h-11 px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                selected
                  ? 'border-b-2 border-navy text-navy'
                  : 'border-b-2 border-transparent text-ink-soft hover:text-navy'
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        {tab === 'team' ? (
          <div role="tabpanel" id="panel-team" aria-labelledby="tab-team">
            <TeamTab team={team} />
          </div>
        ) : null}
        {tab === 'spielplan' ? (
          <div role="tabpanel" id="panel-spielplan" aria-labelledby="tab-spielplan">
            {team.widgetSpielplanId ? (
              <FussballDeWidget dataId={team.widgetSpielplanId} type="team-matches" />
            ) : (
              <WidgetFallback team={team} label="Spielplan" />
            )}
          </div>
        ) : null}
        {tab === 'tabelle' ? (
          <div role="tabpanel" id="panel-tabelle" aria-labelledby="tab-tabelle">
            {team.widgetTabelleId ? (
              <FussballDeWidget dataId={team.widgetTabelleId} type="table" />
            ) : (
              <WidgetFallback team={team} label="Tabelle" />
            )}
          </div>
        ) : null}
        {tab === 'spielberichte' ? (
          <div role="tabpanel" id="panel-spielberichte" aria-labelledby="tab-spielberichte">
            <ReportsTab reports={reports} />
          </div>
        ) : null}
        {tab === 'kontakt' ? (
          <div role="tabpanel" id="panel-kontakt" aria-labelledby="tab-kontakt">
            <KontaktTab team={team} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TeamTab({ team }: { team: CatalogTeam }) {
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

function ReportsTab({ reports }: { reports: CatalogPost[] }) {
  if (!reports.length) {
    return (
      <div>
        <p className="text-ink-soft">Aktuell keine Spielberichte für diese Mannschaft.</p>
        <ClubLink
          href={hrefForPage('presse')}
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-2"
        >
          Zur Presse →
        </ClubLink>
      </div>
    )
  }
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

function KontaktTab({ team }: { team: CatalogTeam }) {
  const contacts = team.contacts || []
  return (
    <div className="space-y-8">
      {team.trainingTimes ? (
        <section>
          <h2 className="mb-3 font-display text-2xl text-navy">Trainingszeiten</h2>
          <p className="whitespace-pre-line text-ink">{team.trainingTimes}</p>
        </section>
      ) : null}
      {contacts.length ? (
        <section>
          <h2 className="mb-3 font-display text-2xl text-navy">Ansprechpartner</h2>
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
        </section>
      ) : null}
      {!team.trainingTimes && !contacts.length ? (
        <p className="text-ink-soft">Noch keine Kontaktdaten hinterlegt.</p>
      ) : null}
    </div>
  )
}

function WidgetFallback({ team, label }: { team: CatalogTeam; label: string }) {
  return (
    <div className="rounded-[2px] border border-line bg-paper px-4 py-6">
      <p className="text-sm text-ink-soft">
        {label}-Widget noch nicht konfiguriert. Im CMS unter Mannschaften die Fussball.de Widget-ID
        eintragen.
      </p>
      {team.fussballDeUrl ? (
        <a
          href={team.fussballDeUrl}
          className="mt-4 inline-flex min-h-11 items-center rounded-[2px] bg-navy px-4 text-sm font-semibold text-white"
          rel="noopener noreferrer"
          target="_blank"
        >
          Auf Fussball.de öffnen
        </a>
      ) : null}
    </div>
  )
}

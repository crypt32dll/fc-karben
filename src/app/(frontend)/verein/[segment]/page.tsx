import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const PAGES: Record<string, { title: string; body: string }> = {
  vorstand: {
    title: 'Vorstand',
    body: '1. Vorsitzender: Frank Lindner. Weitere Vorstandsmitglieder und Kontakte werden im CMS gepflegt.',
  },
  'mitglied-werden': {
    title: 'Mitglied werden',
    body: 'Mitgliedsanträge als PDF/DOC unter Formulare. Online-Formular folgt optional später.',
  },
  beitragsstruktur: {
    title: 'Beitragsstruktur',
    body: 'Beiträge und Fördermitgliedschaft — Inhalt aus WordPress migrieren.',
  },
  vereinssatzung: {
    title: 'Vereinssatzung',
    body: 'Die Vereinssatzung steht nach Migration als Seite bzw. Download bereit.',
  },
  platzbelegung: {
    title: 'Platzbelegung',
    body: 'Belegung Günter-Reutzel-Sportfeld — Inhalt aus WordPress.',
  },
  gremien: {
    title: 'Gremien',
    body: 'Vereinsgremien — Inhalt aus WordPress.',
  },
}

type Props = { params: Promise<{ segment: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment } = await params
  return { title: PAGES[segment]?.title || 'Verein' }
}

export default async function VereinSubpage({ params }: Props) {
  const { segment } = await params
  const page = PAGES[segment]
  if (!page) notFound()
  return (
    <article className="mx-auto max-w-[800px] px-8 py-16">
      <p className="mb-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-pitch">
        Verein
      </p>
      <h1 className="text-5xl text-navy">{page.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">{page.body}</p>
      <p className="mt-8 text-sm text-ink-soft">
        Redakteure können diese Seite im CMS mit dem Page Builder (Blöcke) neu aufbauen.
      </p>
    </article>
  )
}

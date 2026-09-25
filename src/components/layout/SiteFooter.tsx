import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer id="anfahrt" className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1120px] px-8 py-14">
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <div className="font-display text-2xl font-bold uppercase text-navy">
              FC Karben e.V.
            </div>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              Günter-Reutzel-Sportfeld · Karl-Liebknecht-Str. 48 · 61184 Karben
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-navy">Verein</h4>
              <Link href="/verein/vorstand" className="block text-ink-soft hover:text-navy">
                Vorstand
              </Link>
              <Link href="/verein/vereinssatzung" className="block text-ink-soft hover:text-navy">
                Vereinssatzung
              </Link>
              <Link href="/verein/mitglied-werden" className="block text-ink-soft hover:text-navy">
                Mitglied werden
              </Link>
              <Link href="/verein/beitragsstruktur" className="block text-ink-soft hover:text-navy">
                Beitragsstruktur
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-navy">Mannschaften</h4>
              <Link href="/1-mannschaft" className="block text-ink-soft hover:text-navy">
                1. Mannschaft
              </Link>
              <Link href="/2-mannschaft" className="block text-ink-soft hover:text-navy">
                2. Mannschaft
              </Link>
              <Link href="/3-mannschaft" className="block text-ink-soft hover:text-navy">
                3. Mannschaft
              </Link>
              <Link href="/e-jugend" className="block text-ink-soft hover:text-navy">
                E-Jugend
              </Link>
              <Link href="/alte-herren" className="block text-ink-soft hover:text-navy">
                Alte Herren
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-navy">Kontakt</h4>
              <a href="mailto:info@fc-karben.de" className="block text-ink-soft hover:text-navy">
                info@fc-karben.de
              </a>
              <Link href="/anfahrt" className="block text-ink-soft hover:text-navy">
                Anfahrt
              </Link>
              <Link href="/formulare" className="block text-ink-soft hover:text-navy">
                Formulare
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-sm text-ink-soft">
          <span>© {new Date().getFullYear()} FC Karben e.V.</span>
          <span className="space-x-3">
            <Link href="/impressum" className="hover:text-navy">
              Impressum
            </Link>
            <span>·</span>
            <Link href="/datenschutz" className="hover:text-navy">
              Datenschutz
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}

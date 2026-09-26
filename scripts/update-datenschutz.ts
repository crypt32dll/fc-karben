/**
 * Replace the migrated Datenschutz page with a notice that matches the ClubSite setup.
 * Usage: pnpm exec tsx scripts/update-datenschutz.ts
 */
import './load-env.ts'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

const HTML = `
<p>Der FC Karben e.V. betreibt diese Website. Hier erfahren Sie, welche personenbezogenen Daten dabei verarbeitet werden, zu welchem Zweck das geschieht und welche Rechte Sie haben. Stand: 26. September 2026.</p>

<h2>Verantwortlicher</h2>
<p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
<p>FC Karben e.V.<br>c/o Jürgen Stoppany<br>Karl-Liebknecht-Str. 48<br>61184 Karben</p>
<p>Telefon: 06039 938710<br>E-Mail: <a href="mailto:info@fc-karben.de">info@fc-karben.de</a></p>
<p>Der Verein ist im Vereinsregister des Amtsgerichts Frankfurt am Main unter VR 15600 eingetragen. Vertreten wird er durch den Vorstand: Frank Lindner, Jürgen de Stoppany und Michael Buxmann.</p>

<h2>Hosting und Server-Protokolle</h2>
<p>Die Website wird bei Vercel Inc. (USA) betrieben. Die Auslieferung erfolgt über einen Standort in Frankfurt am Main. Beim Aufruf einer Seite verarbeitet der Server automatisch die dafür nötigen Verbindungsdaten:</p>
<ul>
<li>IP-Adresse</li>
<li>Datum und Uhrzeit des Abrufs</li>
<li>aufgerufene Adresse</li>
<li>Browsertyp und Betriebssystem</li>
<li>die zuvor besuchte Seite, sofern Ihr Browser sie übermittelt</li>
</ul>
<p>Diese Daten brauchen wir, um die Seite auszuliefern, stabil zu halten und Missbrauch zu erkennen. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Die Daten werden nur so lange gespeichert, wie es für Betrieb und Sicherheit erforderlich ist.</p>
<p>Vercel ist ein Unternehmen in den USA. Soweit Daten dorthin übermittelt werden, stützen wir das auf das EU-US Data Privacy Framework, sofern der Anbieter danach zertifiziert ist, sonst auf Standardvertragsklauseln. Datenschutzerklärung: <a href="https://vercel.com/legal/privacy-policy">vercel.com/legal/privacy-policy</a>.</p>

<h2>Inhalte und Datenbank</h2>
<p>Texte, Mannschaften und Beiträge liegen in einer Postgres-Datenbank bei Neon (betrieben von Databricks, Inc., USA). Dort liegen die redaktionellen Inhalte und die Zugänge für das Redaktionssystem, keine Besucherprofile. Für eine Übermittlung in die USA gilt derselbe Rahmen wie beim Hosting. Datenschutzerklärung: <a href="https://www.databricks.com/legal/privacynotice">databricks.com/legal/privacynotice</a>.</p>

<h2>Bilder und Dateien</h2>
<p>Fotos, Logos und Downloads, zum Beispiel Vereinsformulare, liegen auf dem Webspace von 1&amp;1 IONOS (IONOS SE, Deutschland) und werden unter fc-karben.de ausgeliefert.</p>
<p>Sponsorenlogos auf der Startseite und Bilder im Fließtext lädt Ihr Browser direkt von dort. Dabei wird Ihre IP-Adresse an IONOS übermittelt. Titelbilder liefert in der Regel unser eigener Server aus; IONOS sieht dann die Serveranfrage. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Datenschutzerklärung: <a href="https://www.ionos.de/terms-gtc/datenschutzerklaerung/">ionos.de/terms-gtc/datenschutzerklaerung</a>.</p>

<h2>Schriften, Reichweite, Cookies</h2>
<p>Die Schriften werden von unserer eigenen Website ausgeliefert. Es gibt keine Verbindung zu Google Fonts. Wir setzen kein Google Analytics, kein Facebook-Pixel, keine Werbenetzwerke und keine Kartendienste ein. Eine Reichweitenmessung der Besuche findet nicht statt.</p>
<p>Beim normalen Besuch setzen wir keine Cookies. Cookies entstehen nur, wenn jemand aus dem Verein im Redaktionssystem unter /admin angemeldet ist oder eine Entwurfsvorschau öffnet. Das betrifft die Redaktion, nicht die öffentliche Website.</p>
<p>Zur Bestätigung der Inhaberschaft in der Google Search Console kann ein Meta-Tag im Seitenkopf stehen. Damit werden keine Besucher erfasst.</p>

<h2>Spielplan und Tabelle (fussball.de)</h2>
<p>Auf den Mannschaftsseiten laden Spielplan und Tabelle erst, wenn Sie den jeweiligen Reiter öffnen. Dann wird ein Fenster von next.fussball.de eingeblendet. Der Betreiber von fussball.de (DFB GmbH &amp; Co. KG) erhält dabei Ihre IP-Adresse und Browserdaten und kann in diesem Fenster eigene Cookies setzen.</p>
<p>Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Das Speichern von Informationen in Ihrem Browser erfolgt, weil Sie den Spielplan oder die Tabelle selbst abrufen (§ 25 Absatz 2 Nummer 2 TDDDG). Informationen des Anbieters: <a href="https://www.fussball.de/privacy">fussball.de/privacy</a>.</p>

<h2>Platzbelegung (Google Calendar)</h2>
<p>Auf der Seite Platzbelegung können Sie den Belegungsplan des Sportfelds laden. Der Plan wird erst angezeigt, wenn Sie den Button „Kalender anzeigen“ bzw. „Kalender laden“ betätigen. Dann wird ein Fenster von Google Calendar (Google Ireland Limited / Google LLC) eingeblendet. Google erhält dabei Ihre IP-Adresse und Browserdaten und kann in diesem Fenster eigene Cookies setzen.</p>
<p>Rechtsgrundlage ist Ihre Einwilligung über den Klick (Artikel 6 Absatz 1 Buchstabe a DSGVO) sowie § 25 Absatz 1 TDDDG. Datenschutzerklärung von Google: <a href="https://policies.google.com/privacy">policies.google.com/privacy</a>.</p>

<h2>Links zu anderen Websites</h2>
<p>Links zu Sponsoren, zu <a href="https://www.instagram.com/fckarben/">Instagram</a>, zu <a href="https://www.facebook.com/FCKarben">Facebook</a> und zu fussball.de sind gewöhnliche Verweise. Erst wenn Sie einen Link anklicken, gilt die Datenschutzerklärung der Zielseite. Wir binden keine Social-Media-Plugins ein, die schon beim Öffnen unserer Seite Daten an Meta senden. Instagram-Bilder werden auf der Startseite derzeit nicht automatisch von Instagram geladen.</p>

<h2>Suche</h2>
<p>Die Suche auf dieser Website verarbeitet den Suchbegriff auf unserem Server, um Treffer anzuzeigen. Der Begriff kann in den Server-Protokollen stehen. Wir erstellen daraus keine Profile und geben ihn nicht zu Werbezwecken weiter. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO.</p>

<h2>E-Mail</h2>
<p>Auf der Website gibt es kein Kontaktformular. Wenn Sie uns an <a href="mailto:info@fc-karben.de">info@fc-karben.de</a> schreiben, verarbeiten wir Ihre Angaben, um die Anfrage zu beantworten. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe b DSGVO, soweit es um eine Mitgliedschaft oder eine andere Anfrage zu unseren Leistungen geht, sonst Artikel 6 Absatz 1 Buchstabe f DSGVO. Die Nachrichten bleiben gespeichert, solange wir sie für die Bearbeitung brauchen, und danach nur, wenn eine gesetzliche Aufbewahrung das verlangt.</p>
<p>Systemnachrichten des Redaktionssystems, etwa zum Zurücksetzen eines Passworts, können über Resend, Inc. (USA) versendet werden. Das wird nicht durch den normalen Besuch der Website ausgelöst. Datenschutzerklärung: <a href="https://resend.com/legal/privacy-policy">resend.com/legal/privacy-policy</a>.</p>

<h2>Fehleranalyse</h2>
<p>Der Server kann technische Fehlermeldungen an Sentry (Functional Software, Inc., USA) senden, etwa die aufgerufene Adresse, den Zeitpunkt und Diagnosedaten. Im Browser der Besucher wird dafür kein Skript geladen. Es findet kein Werbe-Tracking statt. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Datenschutzerklärung: <a href="https://sentry.io/privacy/">sentry.io/privacy</a>.</p>

<h2>Veröffentlichte Kontaktdaten</h2>
<p>Namen und Kontaktdaten von Vorstand sowie Trainerinnen und Trainern veröffentlichen wir, weil diese Personen den Verein nach außen vertreten. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Wer nicht mehr genannt werden möchte, schreibt an <a href="mailto:info@fc-karben.de">info@fc-karben.de</a>.</p>

<h2>Ihre Rechte</h2>
<p>Sie haben gegenüber dem Verein das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit, soweit die gesetzlichen Voraussetzungen erfüllt sind. Beruht eine Verarbeitung auf Artikel 6 Absatz 1 Buchstabe f DSGVO, können Sie widersprechen. Eine Einwilligung können Sie mit Wirkung für die Zukunft widerrufen.</p>
<p>Außerdem haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Zuständig ist:</p>
<p>Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br>Postfach 3163<br>65021 Wiesbaden<br><a href="https://datenschutz.hessen.de/">datenschutz.hessen.de</a></p>

<h2>Pflicht zur Bereitstellung</h2>
<p>Die technischen Verbindungsdaten sind nötig, damit wir die Website ausliefern können. Weitere Angaben, etwa in einer E-Mail an den Verein, sind freiwillig. Ohne sie können wir die jeweilige Anfrage nicht beantworten.</p>
<p>Es findet keine automatisierte Entscheidungsfindung und kein Profiling im Sinne von Artikel 22 DSGVO statt.</p>
`.trim()

async function main() {
  const payload = await getPayload({ config: (await import('../src/payload.config.ts')).default })
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'datenschutz' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    draft: false,
  })
  const doc = existing.docs[0]
  if (!doc) throw new Error('Seite datenschutz not found')

  const layout = (doc as { layout?: unknown[] }).layout
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const content = convertHTMLToLexical({ editorConfig, html: HTML, JSDOM })
  const meta = (doc as { meta?: Record<string, unknown> | null }).meta ?? {}

  await payload.update({
    collection: 'pages',
    id: doc.id,
    draft: false,
    overrideAccess: true,
    data: {
      content,
      ...(Array.isArray(layout) && layout.length > 0 ? { layout: [] } : {}),
      meta: {
        ...meta,
        description:
          'Informationen des FC Karben e.V. zur Verarbeitung personenbezogener Daten auf dieser Website: Hosting, Medien, fussball.de und Ihre Rechte.',
      },
    },
  })

  console.log('Updated datenschutz', {
    id: doc.id,
    clearedLayout: Array.isArray(layout) && layout.length > 0,
  })
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

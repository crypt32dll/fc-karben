# Instagram-Feed — Anleitung für den Kanal-Admin

Kurz: Damit die Homepage automatisch die neuesten Posts von **@fckarben** zeigt, brauchen wir Zugang über einen Feed-Dienst (kein Passwort vom Instagram-Account an die Web-Entwickler).

---

## Was ihr einrichten solltet

### 1. Instagram-Konto-Typ

- Konto muss **öffentlich** sein (nicht privat).
- Konto-Typ: **Business** oder **Creator** (kostenlos umstellbar in der Instagram-App unter Einstellungen → Account-Typ).
- Persönliche „Privatkonten“ funktionieren mit der aktuellen Instagram-API **nicht** mehr (Basic Display API ist abgeschaltet).

### 2. Optional, aber empfohlen: Facebook-Seite

- Viele Tools verlangen eine verknüpfte **Facebook-Seite** des Vereins.
- In Instagram: Einstellungen → Business → Seite verknüpfen (oder über Meta Business Suite).

### 3. Feedframer verbinden (unser Standard)

Wir nutzen [Feedframer](https://feedframer.com) (Free-Tier, JSON-API, passt zu Next.js — siehe [Next.js-Doku](https://feedframer.com/docs/examples/nextjs)):

1. Account bei https://feedframer.com anlegen (Vereins-E-Mail).
2. Instagram **@fckarben** verbinden (OAuth — ihr meldet euch mit dem Vereins-Instagram an).
3. API-Key erzeugen (Dashboard → API Key).
4. An das Web-Team senden:
   - **API-Key** (z. B. `ff_…`)
   - Bestätigung: Username ist **@fckarben**
   - Optional: Screenshot, dass der Feed im Feedframer-Dashboard Posts zeigt

Das Web-Team hinterlegt den Key als Umgebungsvariable `FEEDFRAMER_API_KEY` (Vercel + lokal). Danach erscheinen die Posts in der Social-Leiste der Homepage (Cache ca. 1 Stunde).

### 4. Was ihr **nicht** an uns schicken müsst

- Instagram-Passwort
- Persönliche Facebook-Logins von Privatpersonen (nur Vereins-Assets)

---

## Checkliste zum Abhaken

- [ ] Instagram @fckarben ist **öffentlich**
- [ ] Account ist **Business** oder **Creator**
- [ ] (Empfohlen) Facebook-Seite des Vereins verknüpft
- [ ] Feedframer-Konto angelegt und @fckarben verbunden
- [ ] API-Key an Web-Team geschickt
- [ ] Im Feedframer-Dashboard sind aktuelle Posts sichtbar

---

## Alternativen (nur zur Info)

| Option | Kosten | Aufwand | Bemerkung |
| --- | --- | --- | --- |
| **Feedframer** (gewählt) | Free-Tier | niedrig | JSON, Design bleibt bei uns |
| **Instagram Graph API** (Meta direkt) | kostenlos | hoch | Meta-App, Token-Refresh, Review |
| **SociableKIT / Widget-Embeds** | Free mit Branding | niedrig | Fremdes Design / Wasserzeichen |
| **CMS Social Tiles** (Fallback) | — | manuell | Schon im Payload-Admin möglich |

Ohne API-Key bleibt der Fallback: manuelle Kacheln unter Payload → **Social Tiles**.

---

## Nach dem Key: Go-Live (Web-Team)

1. `FEEDFRAMER_API_KEY=…` in `.env` / Vercel setzen  
2. Optional: `NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/fckarben/`  
3. Deploy / Dev-Server neu starten  
4. Homepage Social-Grid prüfen (`pnpm exec tsx scripts/probe-feedframer.ts`)

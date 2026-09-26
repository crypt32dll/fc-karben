# SEO Crawl Report — fc-karben-three.vercel.app

Stand: 2026-09-26 · Quelle: Sitemap (201 URLs) · Report: `tmp/seo-crawl-report.json`

## Sitemap-Übersicht

| Gruppe | Anzahl |
| --- | ---: |
| Presse-Beiträge | 182 |
| Verein | 7 |
| Mannschaften | 5 |
| Statisch (Presse, Sponsoren, Anfahrt, …) | 6 |
| Home | 1 |
| **Gesamt** | **201** |

Crawl erneut:

```bash
pnpm exec tsx scripts/crawl-seo-sitemap.ts -- --sitemap path/to/sitemap.xml
```

## Befunde (nach Häufigkeit)

| Issue | Count | Schwere | Ursache (kurz) |
| --- | ---: | --- | --- |
| `noindex` | 201 | Go-Live | Soft-launch: `ALLOW_SEARCH_INDEXING` nicht gesetzt → `noindex,nofollow` |
| `missing-json-ld` | 201 | mittel | JSON-LD nur für Articles via `meta.other` (wirkt nicht); Organization fehlt |
| `title-duplicated-brand` | 200 | hoch | `buildTitle()` + Layout-`template: '%s \| FC Karben'` + teils CMS-Titel mit Brand → z. B. `Vorstand \| FC Karben \| FC Karben \| FC Karben` |
| `missing-og-image` | 38 | mittel | Kein Default-OG; Posts ohne Featured Image |
| `meta-description-too-short` | 22 | mittel | CMS-Meta / Excerpts zu kurz (&lt;70) |
| `title-too-long` | 15 | niedrig | Lange Presse-Titel + doppeltes Brand-Suffix |
| `meta-description-too-long` | 7 | niedrig | &gt;150 Zeichen |
| `title-too-short` | 1 | niedrig | Home-Titel ohne Template-Nutzen |
| **`robots.txt` → 404** | — | **kritisch** | `robots.ts` wird von `[slug]` abgefangen (`robots.txt` als Page-Slug) |

Positiv: überall genau 1× H1, Canonicals korrekt, HTTP 200 für alle Sitemap-URLs.

## Kritische Beispiele

- Title: `Vorstand | FC Karben | FC Karben | FC Karben`
- `og:title`: `Vorstand | FC Karben` (bereits Brand, dann nochmal Template)
- `/robots.txt` liefert HTML-404 statt robots.txt

## Fixes applied (2026-09-26, staging remains noindex)

1. **Title pipeline** — `normalizePageTitle` + layout template only; CMS titles stripped of brand suffix  
2. **robots.txt** — moved to `src/app/robots.ts` (no longer caught by `[slug]`); still `Disallow: /` while `ALLOW_SEARCH_INDEXING` unset  
3. **Default OG** — fallback `/logo.png` on all pages  
4. **JSON-LD** — Organization in layout + NewsArticle on Presse  
5. **Short meta descriptions** — regenerator pads &lt;70 chars; `pnpm migrate:seo --apply` for pages/posts/teams  

**Not done (by request):** Production indexing (`ALLOW_SEARCH_INDEXING=true`).

# FC Karben — Domain Glossary

Shared language for the codebase. Prefer these terms in code, ADRs, and reviews.

| Term | Meaning |
| --- | --- |
| **Beitrag** | News/press article migrated from WordPress `post` (`posts` collection) |
| **Seite** | Static page migrated from WordPress `page` (`pages` collection) |
| **Mannschaft** | Club team with roster/contact and optional Fussball.de link (`teams`) |
| **Spielbericht** | Beitrag categorized as a match report (via `categories`) |
| **Kategorie** | Taxonomy from WordPress (`categories`) |
| **Medien** | Uploaded file in Vercel Blob (`media`), keyed by `wpId` when migrated |
| **Redirect** | 301 from a legacy WordPress URL to a canonical club route (`redirects`) |
| **Match** | Upcoming/past fixture for the first team (`matches`), synced from MatchFeed |
| **MatchFeed** | Daily cron fetches fussball.de → upserts `matches`; ClubSite scoreboard reads CMS via ContentCatalog thin pass-through (no live pageview fetch, no manual overrides) |
| **ContentCatalog** | Read seam for the ClubSite (no Payload leaks into UI); maps Lexical → **CatalogBody**; Data Cache is **tag-only** via one draft+cache policy helper; respects Next **draftMode** for Preview / Live Preview |
| **CatalogBody** | ClubSite-owned rich-text DTO validated at the ContentCatalog / Page Builder seam |
| **SeoSurface** | Metadata, JSON-LD, sitemap, robots |
| **SocialFeed** | Homepage social tiles; Phase 1 = manual CMS tiles |
| **MigrationPipeline** | WXR extract → transform → load into Payload (Mannschaft seed lives here) |
| **ClubSite** | Public Next.js App Router frontend |
| **Page Builder** | Owns block meaning: LayoutView validation + searchable plain text; Payload `src/blocks` = CMS schema; `RenderBlocks` paints only (ADR-0002) |
| **LayoutView** | Zod-validated page-builder DTO (discriminated union on `blockType`) consumed by `RenderBlocks` |
| **clubPaths** | Canonical ClubSite URLs + known-path registry (SEO, nav, preview, proxy short-circuit) |
| **Redirect policy** | Legacy → canonical only; proxy is a thin edge adapter |
| **Search** | Index plain text + query hits in one module; ContentCatalog `searchContent` delegates; Payload `beforeSync` is a thin adapter |
| **wpId** | Stable WordPress ID used for idempotent migration upserts |

## Roles

- **Admin** — full Payload access (site owner)
- **Editor** — Media team (`cmunoz`); publish content, **use page builder blocks**, no user/system admin
- Public articles show **no byline**; SEO author is the club organization

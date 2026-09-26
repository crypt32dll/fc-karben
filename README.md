<p align="center">
  <img src="public/logo.png" alt="FC Karben" width="96" height="120" />
</p>

# FC Karben

[![CI](https://img.shields.io/github/actions/workflow/status/crypt32dll/fc-karben/ci.yml?style=flat-square&label=CI)](https://github.com/crypt32dll/fc-karben/actions)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24-3c873a?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![Payload](https://img.shields.io/badge/Payload-3-0b0b0b?style=flat-square)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

Website and CMS for **FC Karben e.V.** — club pages, press, Mannschaften, sponsors, and fussball.de integrations — built with Next.js App Router and Payload CMS 3.

[Overview](#overview) · [Features](#features) · [Getting started](#getting-started) · [Scripts](#scripts) · [Architecture](#architecture) · [Docs](#docs)

## Overview

This repo is the ClubSite rewrite that replaces the legacy WordPress site. Editors work in Payload Admin; the public site reads through a **ContentCatalog** seam so UI code never depends on Payload types. Content was migrated from WordPress WXR; media stays on the club’s 1&1 webspace.

```text
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  ClubSite    │────▶│  ContentCatalog │────▶│   Payload    │
│  (Next.js)   │     │  (read DTO)     │     │  + Postgres  │
└──────────────┘     └─────────────────┘     └──────┬───────┘
                                                    │
                     ┌─────────────────┐            │
                     │  1&1 SFTP media │◀───────────┘
                     │  MatchFeed cron │
                     └─────────────────┘
```

## Features

- **Page Builder** — curated blocks (Hero, TeamGrid, Scoreboard, SocialGrid, …) for editor-built pages; Lexical rich text for migrated WordPress content
- **Mannschaften** — scroll layout with sticky jump nav, fussball.de widgets (Spielplan / Tabelle / Spielberichte), CMS-editable Kontakt
- **MatchFeed** — daily Vercel Cron syncs 1. Mannschaft fixtures from fussball.de into Payload
- **SocialFeed** — Instagram via Feedframer when configured, otherwise CMS Social Tiles
- **SEO** — metadata, JSON-LD, sitemap, robots, soft-launch indexing gate
- **Search** — Payload search plugin + ClubSite `/suche`
- **Preview** — Draft Mode / Live Preview with `PREVIEW_SECRET`

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **24+**
- [pnpm](https://pnpm.io/) **10** (pinned via `packageManager` in `package.json`)
- A Postgres database ([Neon](https://neon.tech) works well — no Docker required)

### Setup

```bash
cp .env.example .env
# set at least POSTGRES_URL and PAYLOAD_SECRET

pnpm install
pnpm dev
```

| Surface | URL |
| --- | --- |
| ClubSite | [http://localhost:3000](http://localhost:3000) |
| Payload Admin | [http://localhost:3000/admin](http://localhost:3000/admin) |

After changing collections, blocks, or Payload plugins:

```bash
pnpm generate:importmap
pnpm generate:types
```

> [!TIP]
> Locally you can omit SFTP env vars — uploads go to `./media`. On Vercel, set `SFTP_*` and `MEDIA_PUBLIC_BASE_URL` (see [ADR 0001](docs/adr/0001-media-storage.md)).

> [!IMPORTANT]
> Keep `ALLOW_SEARCH_INDEXING` unset/false until cutover. When `false`, `robots.txt` disallows crawlers and pages emit noindex.

## Environment

Minimal local `.env`:

```bash
POSTGRES_URL=postgresql://USER:PASSWORD@HOST/db?sslmode=verify-full
PAYLOAD_SECRET=long-random-string
```

Common optional variables (full list in [`.env.example`](.env.example)):

| Variable | Purpose |
| --- | --- |
| `SFTP_*` / `MEDIA_PUBLIC_BASE_URL` | Production media on 1&1 |
| `PREVIEW_SECRET` | Admin Preview / Live Preview |
| `CRON_SECRET` | Protect MatchFeed cron |
| `FEEDFRAMER_API_KEY` | Live Instagram SocialFeed |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring |
| `RESEND_API_KEY` | Transactional email adapter |
| `ALLOW_SEARCH_INDEXING` | Enable public indexing at go-live |

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Next.js + Payload dev server |
| `pnpm build` / `pnpm start` | Production build & serve |
| `pnpm lint` / `pnpm format` | Biome check / autofix |
| `pnpm test:unit` | Vitest unit suite |
| `pnpm test:e2e` | Playwright |
| `pnpm sync:matches` | Run MatchFeed sync once |
| `pnpm migrate:wxr -- --file path/to/export.xml` | WXR migration (dry-run unless `--apply`) |
| `pnpm seed:sponsors` | Seed sponsor records |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `pnpm generate:importmap` | Regenerate Payload admin import map |

CI (`.github/workflows/ci.yml`) runs lint, unit tests, and `tsc --noEmit` on Node 24.

## Architecture

| Layer | Role |
| --- | --- |
| **ClubSite** | `src/app/(frontend)` — public App Router UI |
| **Payload** | `src/app/(payload)` + `src/collections` — Admin & API |
| **ContentCatalog** | Tag-cached read DTOs; draft-aware for Preview |
| **Page Builder** | Zod `LayoutView` → `RenderBlocks` ([ADR 0002](docs/adr/0002-page-builder.md)) |
| **Media** | SFTP cloud-storage adapter → HTTPS public URLs ([ADR 0001](docs/adr/0001-media-storage.md)) |
| **MatchFeed** | Cron `/api/cron/sync-matches` (06:00 UTC daily on Vercel `fra1`) |

Domain terms (Beitrag, Seite, Mannschaft, …) live in [CONTEXT.md](CONTEXT.md).

### Content model (Payload)

- **posts** / **pages** / **teams** / **categories** / **media**
- **matches** — synced fixtures (do not edit by hand)
- **sponsors** / **social-tiles**
- **redirects** — legacy WordPress → canonical club paths

Editors: **Admin** (full) or **Editor** (content + page builder, no user admin). Public articles have **no byline**.

## Docs

| Doc | Topic |
| --- | --- |
| [CONTEXT.md](CONTEXT.md) | Domain glossary |
| [docs/adr/0001-media-storage.md](docs/adr/0001-media-storage.md) | 1&1 SFTP media |
| [docs/adr/0002-page-builder.md](docs/adr/0002-page-builder.md) | Page Builder blocks |
| [docs/instagram-admin.md](docs/instagram-admin.md) | Feedframer / Instagram setup |

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `Missing POSTGRES_URL` | `.env` present; Neon connection string with `sslmode=verify-full` |
| Admin empty / stale UI after schema change | `pnpm generate:importmap` and restart `pnpm dev` |
| Uploads fail on Vercel | `SFTP_*` + `MEDIA_PUBLIC_BASE_URL`; probe with `pnpm exec tsx scripts/probe-sftp.ts` |
| Preview button broken | `PREVIEW_SECRET` set in env and Payload live-preview config |
| MatchFeed / cron 401 | `CRON_SECRET` matches Vercel cron Bearer token |
| Site not indexed | Soft-launch: set `ALLOW_SEARCH_INDEXING=true` only at cutover |

> [!NOTE]
> This project uses a Next.js release with breaking changes vs older docs. Prefer guides under `node_modules/next/dist/docs/` and heed deprecation notices (see [AGENTS.md](AGENTS.md)).

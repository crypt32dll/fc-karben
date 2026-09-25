# FC Karben

Next.js 16 + Payload CMS 3 website for **FC Karben e.V.**

## Stack

- Next.js App Router + Payload Admin (`/admin`)
- **Postgres** via Neon (`POSTGRES_URL`) — no Docker required
- **1&1 SFTP** for media (HTTPS via `MEDIA_PUBLIC_BASE_URL`). Locally without SFTP env → Payload disk under `media/`
- Biome, Vitest, Playwright, GitHub Actions CI
- **Page Builder** blocks for editors

## Quick start

1. Create a free [Neon](https://neon.tech) Postgres database (or any hosted Postgres).
2. Copy env and fill secrets:

```bash
cp .env.example .env
# set POSTGRES_URL + PAYLOAD_SECRET
# on Vercel: set SFTP_* + MEDIA_PUBLIC_BASE_URL
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin).

After changing Payload plugins/collections:

```bash
pnpm generate:importmap
pnpm generate:types
```

## Media (1&1 SFTP)

Production media uses a custom SFTP adapter (`src/storage/sftp-storage.ts`) with `@payloadcms/plugin-cloud-storage`.

1. Set `SFTP_HOST`, `SFTP_PORT`, `SFTP_USER`, `SFTP_PASSWORD`, `SFTP_BASE_PATH`
2. Set `MEDIA_PUBLIC_BASE_URL` to the HTTPS origin that serves that path (e.g. `https://fc-karben.de/wp-content/uploads`)
3. Redeploy; run `pnpm generate:importmap` after plugin changes

Locally, omit SFTP env to keep uploads on disk under `media/`.

WXR migration registers legacy attachment URLs (`wpSourceUrl`) without copying binaries into another object store.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm lint` / `pnpm format` | Biome |
| `pnpm test:unit` | Vitest |
| `pnpm migrate:wxr -- --file path/to/export.xml` | WXR dry-run report |
| `pnpm build` | Production build |

## Content model

See [CONTEXT.md](./CONTEXT.md). Editors use **Admin** or **Editor** roles; public articles have **no byline**.

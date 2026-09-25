# FC Karben

Next.js 16 + Payload CMS 3 website for **FC Karben e.V.**

## Stack

- Next.js App Router + Payload Admin (`/admin`)
- **Postgres** via Neon (`POSTGRES_URL`) — no Docker required
- **Vercel Blob** for media. Locally without `BLOB_READ_WRITE_TOKEN` → Payload local disk under `media/`
- Biome, Vitest, Playwright, GitHub Actions CI
- **Page Builder** blocks for editors

## Quick start

1. Create a free [Neon](https://neon.tech) Postgres database (or any hosted Postgres).
2. Copy env and fill secrets:

```bash
cp .env.example .env
# set POSTGRES_URL + PAYLOAD_SECRET
# on Vercel: create a Blob store → BLOB_READ_WRITE_TOKEN
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin).

After changing Payload plugins/collections:

```bash
pnpm generate:importmap
pnpm generate:types
```

## Media (Vercel Blob)

Production media uses `@payloadcms/storage-vercel-blob` with `clientUploads: true`.

1. In the Vercel project: **Storage → Create → Blob**
2. Ensure `BLOB_READ_WRITE_TOKEN` is set (often linked automatically)
3. Redeploy; run `pnpm generate:importmap` after plugin changes

Locally, omit the token to keep uploads on disk under `media/`.

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

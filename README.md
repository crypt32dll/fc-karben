# FC Karben

Next.js 16 + Payload CMS 3 website for **FC Karben e.V.**

## Stack

- Next.js App Router + Payload Admin (`/admin`)
- **Postgres** via Neon (`POSTGRES_URL`) — no Docker required
- **Cloudflare R2** for media (S3-compatible). Locally without R2 env → Payload local disk under `media/`
- Biome, Vitest, Playwright, GitHub Actions CI
- **Page Builder** blocks for editors

## Quick start

1. Create a free [Neon](https://neon.tech) Postgres database (or any hosted Postgres).
2. Copy env and fill secrets:

```bash
cp .env.example .env
# set POSTGRES_URL + PAYLOAD_SECRET
# optional later: R2_* for Cloudflare image storage
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin).

After changing Payload plugins/collections:

```bash
pnpm generate:importmap
pnpm generate:types
```

## Media (Cloudflare R2)

We do **not** use Vercel Blob. Production media goes to Cloudflare R2 via `@payloadcms/storage-s3`.

Set in `.env` / Vercel:

- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT` (e.g. `https://<accountid>.r2.cloudflarestorage.com`)
- `R2_REGION=auto`
- optional custom domain: `NEXT_PUBLIC_MEDIA_URL=https://media.fc-karben.de`

Then run `pnpm generate:importmap` so the admin upload handler matches R2.

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

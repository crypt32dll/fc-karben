# FC Karben

Next.js 16 + Payload CMS 3 website for **FC Karben e.V.**

## Stack

- Next.js App Router + Payload Admin (`/admin`)
- Neon / Postgres (`POSTGRES_URL`)
- Cloudflare R2 for media (optional locally)
- Biome (lint/format), Vitest, Playwright, GitHub Actions CI
- **Page Builder**: editors compose pages from blocks in Payload

## Quick start

```bash
cp .env.example .env
# start Postgres (optional docker-compose)
docker compose up -d
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin).

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

# ADR 0001: Media storage

## Status

Superseded (2026-09-25) — was Cloudflare R2; now **Vercel Blob**.

## Context

Payload needs object storage on Vercel (ephemeral filesystem). R2’s free tier requires a credit card; the project stays on Vercel Hobby where possible.

## Decision

Store uploads in **Vercel Blob** via `@payloadcms/storage-vercel-blob` (`BLOB_READ_WRITE_TOKEN`). Enable `clientUploads` to bypass the ~4.5MB function body limit. Locally, omit the token and use Payload local upload under `media/`.

Also wire Blob for import-export plugin collections (`exports`, `imports`).

## Consequences

- Hobby limits (~1 GB storage, 10k simple / 2k advanced ops, 10 GB transfer / month) — full WP media migration may exceed this
- Datenschutz texts should mention Vercel (Blob)
- Migration downloads WP attachments into Blob when the token is set
- Custom domain `media.fc-karben.de` is not used; Blob serves `*.public.blob.vercel-storage.com`

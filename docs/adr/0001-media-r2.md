# ADR 0001: Media on Cloudflare R2

## Status

Accepted

## Context

Payload needs object storage on Vercel (ephemeral filesystem). The club already uses Cloudflare for DNS/CDN.

## Decision

Store uploads in **Cloudflare R2** via `@payloadcms/storage-s3`, public URL via custom domain `media.fc-karben.de` behind Cloudflare CDN. Locally, omit R2 env vars and use Payload local upload.

## Consequences

- No Vercel Blob dependency
- Datenschutz texts must mention Cloudflare
- Migration downloads WP attachments into R2

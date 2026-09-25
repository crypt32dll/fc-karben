# ADR 0001: Media storage

## Status

Accepted (2026-09-26) — **1&1 SFTP webspace** (supersedes Vercel Blob / earlier R2 draft).

## Context

Payload on Vercel cannot persist uploads on the function filesystem. Hobby Vercel Blob (~1 GB) is too small for the full WordPress media library. The club already has 1&1 hosting with SFTP.

## Decision

- Store new Payload `media` uploads on the **1&1 webspace via SFTP** (`ssh2-sftp-client` + `@payloadcms/plugin-cloud-storage`).
- Serve files over **HTTPS** (`MEDIA_PUBLIC_BASE_URL`, typically `https://fc-karben.de/wp-content/uploads/...`) — not the SFTP protocol in the browser.
- Legacy WordPress attachments are **registered** in Payload (`wpId`, `wpSourceUrl`) without re-uploading binaries, as long as they remain reachable at the public URL.
- Env: `SFTP_HOST`, `SFTP_PORT`, `SFTP_USER`, `SFTP_PASSWORD`, `SFTP_BASE_PATH`, `MEDIA_PUBLIC_BASE_URL`.
- Locally, omit SFTP env to keep Payload local disk under `media/`.

## Consequences

- Domain/docroot must eventually serve `SFTP_BASE_PATH` at `MEDIA_PUBLIC_BASE_URL` (webspace may start empty).
- No Blob `clientUploads` — large admin uploads go through the serverless function (size/timeout limits).
- Prefer SFTP over plain FTP on Vercel.
- Datenschutz: media host is 1&1 / fc-karben.de, not Vercel Blob.
- Rotate SFTP credentials if they were ever shared outside env vars.

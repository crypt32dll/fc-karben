# ADR 0002: Page Builder for editors

## Status

Accepted

## Context

Editors (Media team) need to create and rearrange pages without developer involvement, while migrated WordPress HTML still needs a home.

## Decision

Use Payload **`blocks`** on `pages.layout` (and optional `homepage.layout`) with a curated set of club-themed blocks (Hero, RichText, CTA, Image, TeamGrid, PostList, Scoreboard, SocialGrid, Sponsors, Downloads, Board, Spacer). Keep legacy `content` richText for WXR imports as fallback when `layout` is empty.

## Consequences

- `RenderBlocks` is the ClubSite seam for layout
- New pages should prefer blocks over free-form HTML
- Block set can grow without changing access roles

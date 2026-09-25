# FC Karben — Design System Master

Source: `fc-karben-demo.html` + ui-ux-pro-max sports/club direction.

## Tokens

| Token | Value |
| --- | --- |
| Navy | `#2b2b5c` |
| Navy deep | `#1c1c3f` |
| Navy mid | `#3a3a75` |
| Pitch | `#3f7d3f` |
| Paper | `#f4f4f8` |
| Line | `#d8d8e6` |
| Ink | `#22223a` |
| Ink soft | `#5c5c78` |
| Radius | `2px` |

## Typography

- Display: **Barlow Condensed** (uppercase headlines)
- Accent labels: **Archivo Black**
- Body: **Inter** (via `next/font`)

## Homepage sections

1. Sticky nav + Mitglied werden CTA
2. Navy hero
3. Scoreboard (1. Mannschaft via MatchFeed)
4. Teams grid
5. Social tiles + notices
6. Verein + board
7. Sponsors
8. Social CTA + footer

## Anti-slop

No glassmorphism, no purple SaaS gradients, no floating badges on hero, no bylines on articles.

## Interaction (sitewide)

- `cursor: pointer` on all actionable controls (`a[href]`, `button`, …)
- Hover styles only when `(hover: hover) and (pointer: fine)` — touch uses `:active` press feedback
- Visible `focus-visible` rings (2px navy / pitch on dark surfaces)
- Min touch target ~44px (`min-h-11`) on primary controls and footer links
- `prefers-reduced-motion`: disable smooth scroll and shorten transitions
- Skip link → `#main-content`; sticky header compensated via `scroll-padding-top`
- Utility `.club-interactive` for list rows / navigational surfaces


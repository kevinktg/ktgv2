# 03-01 — Metadata + OG/Twitter — execution summary

**Executed:** 2026-04-03  
**Verification:** `pnpm run lint` and `pnpm run build` exit 0.

## Route → metadata source

| Route | Source |
|-------|--------|
| `/` | `src/app/page.jsx` — `export const metadata` |
| `/blog` | `src/app/blog/page.jsx` — `export const metadata` (OG/Twitter absolute images) |
| `/blog/[slug]` | `src/app/blog/[slug]/page.jsx` — `generateMetadata` + `toAbsoluteUrl()` for featured image |
| `/expertise` | `src/app/expertise/page.jsx` — `export const metadata` |
| `/validation` | `src/app/validation/page.jsx` — `export const metadata` |
| `/hub` | redirect only → inherits `src/app/layout.jsx` defaults |
| `/hub/snippets` | `src/app/hub/snippets/layout.jsx` — `export const metadata` |
| `/hub/chat` | `src/app/hub/chat/layout.jsx` — `export const metadata` |

Root: `src/app/layout.jsx` — `metadataBase`, default `openGraph`, `twitter`.

## Implementation notes

- `src/lib/wordpress.js` — `toAbsoluteUrl()` for absolute OG/Twitter image URLs on dynamic posts.
- Blog post OG fallback image: `/assets/ktg.svg` (correct asset path).
- Duplicate module-level `siteUrl` redeclaration removed from `BlogPage` body (uses top-level constant).

## Requirements

- SEO-01, SEO-02 — addressed per plan must_haves.

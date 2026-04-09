# Phase 2 — Technical research: WordPress content & blog

**Phase:** 2 — WordPress content & blog  
**Gathered:** 2026-04-01  
**Question answered:** What must be true to plan hardening without breaking ISR, `_embed`, or the App Router shell?

---

## Findings

### Current client (`src/lib/wordpress.js`)

- **`fetchWithTimeout`** exists (`AbortController`, `REQUEST_TIMEOUT = 10000`) and is used for **`testWordPressConnection`** and for **403 fallback** paths in `getPosts` / `getPostBySlug`.
- **Primary** `getPosts` / `getPostBySlug` calls use **plain `fetch()`** without timeout — slow or hung WordPress can block SSR longer than 10s in practice (platform limits differ; still a gap vs roadmap “timeouts on all fetches”).
- **Fetch policy** is already documented in file header (aligns with `.planning/PROJECT.md`): health = `no-store`; list/slug = `next: { revalidate: 60 }`. Any change must **preserve** that split.
- **Errors:** non-OK responses and parse issues generally return `[]` or `null`; exceptions caught. “Consistent error surfaces” may mean **typed/logging** clarity and ensuring **no uncaught** paths when combining `signal` with Next fetch.

### Blog routes (`src/app/blog/`)

- **Index** (`page.jsx`): `revalidate = 60`, try/catch → empty list on failure; uses `getPosts()` with default **per_page=10** (single page only).
- **`[slug]/page.jsx`**: `generateStaticParams` prefetches first 20 slugs; `getPostBySlug` + `notFound()` when missing; body via **`dangerouslySetInnerHTML`** on `post.content.rendered` — **CMS-03** / trust stance must be **documented** (code comment + optional `.planning` pointer), not silently “fixed” with heavy sanitization unless scoped.
- **`not-found.jsx`**: present under `blog/` for segment.

### Dependencies

- **Phase 1** is not a code blocker for this research; **ROADMAP** lists Phase 2 depending on Phase 1 for *ordering*, not a compile dependency.

### Risk: `fetch` + `AbortSignal` + Next cache

- Next.js `fetch` with `next: { revalidate }` should accept `signal`; executor must **verify** after change: `npm run build` and a sample `/blog` + `/blog/[slug]` load without new errors.

---

## Validation Architecture (Nyquist / execution)

| Dimension | Approach |
|-----------|----------|
| **Automated** | No project test runner in repo (`CLAUDE.md`). **Gate = `npm run build`** (and `pnpm lint` if configured in CI). |
| **Manual / UAT** | Browser: `/blog` lists posts; bogus slug → not-found UX; post renders HTML body without breaking layout. |
| **Regression** | After client change, re-check **featured image** via `_embed` and **403 fallback** path still behaves. |

---

## RESEARCH COMPLETE

Recommended plan split:

1. **02-01** — Centralize WordPress JSON fetching on **timeout-capable** helper; document **HTML trust** for `dangerouslySetInnerHTML` (requirements CMS-03).
2. **02-02** — Blog UX: **pagination or higher per_page** for index if product needs >10 posts; confirm **not-found** and **featured** fallbacks; align with BLOG-* acceptance.

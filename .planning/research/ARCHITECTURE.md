# Architecture Research

**Domain:** Next.js App Router + headless CMS (marketing site + blog)
**Researched:** 2026-03-21
**Confidence:** HIGH (Next.js caching/RSC boundaries verified via Context7 `/vercel/next.js/v16.0.3`); MEDIUM (WordPress webhook/on-demand patterns — ecosystem convention, verify against your WP setup)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Edge / CDN (Vercel)                                  │
│  Full Route Cache · Data Cache · ISR-style revalidation                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                      Next.js App Router (`src/app/`)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Root layout  │  │ Route groups │  │ page.tsx     │  │ Route Handlers   │ │
│  │ metadata SEO │  │ (marketing)  │  │ (RSC fetch)  │  │ (revalidate etc) │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                 │                │                    │           │
│         └─────────────────┴────────────────┴────────────────────┘           │
│                              │                                               │
│         ┌────────────────────┴────────────────────┐                         │
│         │  Server Components (default)             │                         │
│         │  async pages/layouts · fetch → Data Cache │                         │
│         └────────────────────┬────────────────────┘                         │
│                              │                                               │
│         ┌────────────────────┴────────────────────┐                         │
│         │  Client Components (`"use client"`)      │                         │
│         │  Lenis · GSAP · interactive UI islands   │                         │
│         └──────────────────────────────────────────┘                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  `src/lib/` — CMS adapter (REST client, timeouts, mapping)                   │
│  `src/components/` — presentation; split RSC vs client by motion/interaction│
├─────────────────────────────────────────────────────────────────────────────┤
│                     Headless CMS (WordPress REST API)                        │
│  Posts · Media · Embedded resources · (optional) webhooks → revalidate    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Root `app/layout.jsx`** | Global HTML shell, fonts, analytics, providers that must wrap all routes | Server Component; imports one client layout wrapper for scroll/motion if needed |
| **Route segments** (`app/(marketing)/`, `app/blog/`) | URL structure, nested layouts, segment-level caching defaults | Folders + optional `layout.jsx`; use `export const revalidate` at segment when whole subtree shares one policy |
| **Page modules** (`page.jsx`) | Compose UI, call `fetch` or data helpers, export `metadata` / `generateMetadata` | Async Server Components for CMS-backed pages; keep data access in same request tree as rendering |
| **CMS adapter** (`lib/wordpress.js`) | Base URL, timeouts, headers, error fallbacks, mapping REST → view models | Single module so caching tags and fetch options stay consistent |
| **Client islands** | Scroll, animation, carousels, theme toggles | `"use client"`; avoid fetching CMS data here unless intentional (adds bundle and complexity) |
| **Revalidation surface** | On-demand cache bust when CMS publishes | Route Handler or Server Action calling `revalidateTag` / `revalidatePath` from `next/cache` (often triggered by WP webhook) |

## Recommended Project Structure (aligned with KTG One)

```
src/
├── app/
│   ├── layout.jsx              # Root shell, metadata defaults
│   ├── globals.css
│   ├── (marketing)/            # Optional: route group for static-ish pages
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── blog/
│   │   ├── layout.jsx
│   │   ├── page.jsx            # Post list
│   │   └── [slug]/page.jsx     # Post detail — fetch by slug
│   ├── sitemap.js
│   └── api/                    # Route Handlers: webhooks, health, revalidate
├── components/
│   ├── ClientLayout.jsx        # Lenis, GSAP context, client-only providers
│   └── …                       # Split: RSC wrappers vs animated sections
├── lib/
│   └── wordpress.js            # All REST access; centralize fetch + cache options
└── libs/
    └── lenis.jsx               # Smooth scroll integration
```

### Structure Rationale

- **`app/`:** File-system routing; co-locate `loading.jsx`, `error.jsx`, `not-found.jsx` per segment when UX needs differ between marketing and blog.
- **`lib/wordpress.js`:** One place to set `next.revalidate`, `next.tags`, timeouts, and fallbacks — avoids inconsistent caching (see PROJECT.md: align `no-store` vs `revalidate` deliberately).
- **`components/`:** Marketing often mixes RSC shells with client motion; keep heavy animation behind explicit client boundaries to limit client JS.

## How Systems Are Typically Structured

### Layering: marketing vs blog

| Concern | Marketing pages | Blog (CMS) |
|---------|-----------------|-------------|
| **Data source** | Mostly static copy, optional CMS fields later | WordPress REST (`posts`, `_embed`, pagination) |
| **Caching** | Often static or long `revalidate`; can be fully static if no per-request personalization | Time-based `fetch(..., { next: { revalidate: N } })` and/or **tags** + webhook |
| **Rendering** | Server-first sections + client motion islands | RSC for HTML body and SEO; sanitize rich text on server |
| **Routing** | `/`, `/expertise`, etc. | `/blog`, `/blog/[slug]` |

Major **integration** points: shared root layout (brand, nav), shared design system (Tailwind), shared SEO utilities (metadata, JSON-LD, sitemap). The **content rendering boundary** is usually: fetch and parse in Server Components → pass serializable props to client sections → never pass raw HTML into client unless sanitized.

### Caching, ISR, and the Data Cache (App Router)

Next.js maps prior Page Router concepts to **fetch cache options** (Context7: migrating guide, v16.0.3):

| Intent | `fetch` option | Analog |
|--------|----------------|--------|
| Cache until manual invalidation | `cache: 'force-cache'` (default for `fetch`) | `getStaticProps` |
| Fresh every request | `cache: 'no-store'` | `getServerSideProps` |
| Periodic refresh | `next: { revalidate: seconds }` | ISR / time-based revalidation |

**Tag-based** invalidation: `fetch(..., { next: { tags: ['posts'] } })` then `revalidateTag('posts', 'max')` from a Route Handler or Server Action for **on-demand** updates (stale-while-revalidate with `profile` recommended in v16 docs).

**Segment config** (`export const revalidate`, `dynamic`, etc.) sets defaults for the route subtree; combine with fetch-level options deliberately so you do not accidentally mark an entire marketing site dynamic because one leaf uses `no-store`.

### Content rendering boundaries

1. **Server:** Fetch from CMS, map to typed/view-model shapes, sanitize HTML (e.g. allowlist) before output.
2. **Client:** Interactivity and animation only; if you must show CMS-driven UI in client, pass **data**, not unparsed HTML, or use a trusted pipeline.
3. **Suspense:** Wrap slow CMS branches in `<Suspense fallback={...}>` so static chrome can stream (Context7: cache components / streaming examples).

## Architectural Patterns

### Pattern 1: CMS adapter + centralized fetch policy

**What:** All WordPress calls go through `lib/wordpress.js` (or split by domain: `posts`, `media`) with shared `fetch` options.
**When to use:** Always for headless CMS to avoid divergent cache behavior.
**Trade-offs:** Slightly more indirection; huge win for consistency and testability.

**Example:**

```javascript
// Centralize: revalidate vs tags vs no-store in one module
export async function getPosts(page, perPage) {
  return fetch(url, {
    next: { revalidate: 60, tags: ['wp-posts'] },
    headers: { /* … */ },
  });
}
```

### Pattern 2: Static marketing shell, dynamic blog subtree

**What:** Keep homepage and marketing routes statically generated or long-interval ISR; isolate blog routes that need shorter `revalidate` or tags.
**When to use:** Typical marketing + blog split; reduces blast radius of dynamic data.
**Trade-offs:** May duplicate layout pieces unless you use shared layouts/components.

### Pattern 3: On-demand revalidation (webhook path)

**What:** WordPress (or middleware) POSTs to `/api/revalidate` with a secret; handler calls `revalidateTag('wp-posts', 'max')` or `revalidatePath('/blog')`.
**When to use:** Editors expect near-instant publish without waiting for time-based ISR.
**Trade-offs:** Must secure the endpoint; **MEDIUM confidence** — pattern is standard but implementation is project-specific (verify WP plugin capabilities).

## Data Flow

### Request flow (blog post page)

```
Visitor GET /blog/[slug]
    ↓
Next.js resolves segment — applies route/segment cache rules
    ↓
async Server Component page.jsx
    ↓
lib/wordpress.getPostBySlug(slug) → fetch(Data Cache hit/miss)
    ↓
Map JSON → React tree (RSC) + metadata
    ↓
Stream HTML; hydrate client islands (nav, motion)
```

### Key data flows

1. **Time-based freshness:** `next.revalidate` on post list and post detail fetches.
2. **Publish event:** Webhook → Route Handler → `revalidateTag` / `revalidatePath` → next request gets fresh Data Cache entries.
3. **Sitemap / SEO:** Generation reads same adapter or build-time snapshot; keep URL scheme consistent with `app` routes.

## Recommended Build Order (implementation sequence)

Typical order for this architecture (dependencies flow top-down):

1. **Foundation:** `app/layout.jsx`, global styles, fonts, error boundaries baseline.
2. **CMS adapter:** `lib/wordpress.js` with timeouts, env-based base URL, and **explicit** cache policy (resolve `no-store` vs `revalidate` vs tags per PROJECT.md).
3. **Marketing routes:** static or long-cache pages; client motion islands (Lenis/GSAP) behind `ClientLayout`.
4. **Blog list + detail:** `[slug]` dynamic segment, `generateMetadata`, HTML sanitization, image handling (`next/image` + CMS URLs).
5. **SEO artifacts:** `sitemap.js`, robots, JSON-LD; align pagination with CMS (`per_page` caps — see CONCERNS).
6. **Revalidation API:** optional webhook route + `revalidateTag` for production editorial workflow.
7. **Hardening:** monitoring, rate limits on webhooks, fallback UI when CMS is down.

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|---------------------------|
| **Low traffic (typical portfolio)** | Single Next app on Vercel; WordPress on managed host; time-based ISR sufficient |
| **Spiky traffic / many posts** | Shorter ISR only where needed; CDN cache friendly headers from WP; paginate lists; consider tag-based revalidation to avoid hammering origin |
| **Multi-locale / preview** | Separate preview deployment or draft mode; separate fetch credentials — adds complexity early — defer unless required |

### Scaling priorities

1. **First bottleneck:** WordPress origin latency or rate limits — mitigate with Data Cache, `revalidate`, and sensible `per_page`.
2. **Second bottleneck:** Large client bundles from pulling too much into `"use client"` — keep CMS rendering server-side.

## Anti-Patterns

### Anti-Pattern 1: Mixed fetch cache policies in ad hoc calls

**What people do:** Copy-paste `fetch` in each page with different `cache` / `revalidate` settings.
**Why it's wrong:** Unpredictable staleness, hard-to-debug 404/empty states after publish.
**Do this instead:** Centralize in the CMS module; document one matrix (list vs detail vs health check).

### Anti-Pattern 2: Marking the whole app dynamic for one widget

**What people do:** Use `cache: 'no-store'` or `export const dynamic = 'force-dynamic'` at root for a tiny live element.
**Why it's wrong:** Forfeits static optimization for all descendants.
**Do this instead:** Scope dynamism to the segment or use client-side fetch only for that widget, or isolate in a nested route.

### Anti-Pattern 3: Rich HTML from CMS straight into client components

**What people do:** Pass `content.rendered` into interactive trees without sanitizing.
**Why it's wrong:** XSS and hydration mismatch risk.
**Do this instead:** Sanitize on server; prefer RSC for body content.

## Integration Points

### External services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| **WordPress REST** | Server-side `fetch` via adapter; `_embed` for media | Timeouts and 403 fallbacks (existing code paths); align User-Agent/Referer with host policy |
| **Vercel** | Build + deploy; env vars for `NEXT_PUBLIC_WORDPRESS_URL` | `installCommand` constraints per `vercel.json` |
| **(Optional) WP webhooks** | POST to Next Route Handler → `revalidateTag` | Secure with shared secret; validate payload |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `app/*` ↔ `lib/wordpress` | Direct async imports | Keep side effects (logging) out of hot paths if possible |
| RSC ↔ Client layout | Props / context | Do not pass non-serializable data to client |
| SEO ↔ CMS | `generateMetadata` uses same adapter | Avoid duplicate fetch logic with different cache keys |

## Sources

- Next.js v16.0.3 — Caching and revalidating: [Data fetching caching strategies (App Router)](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/02-guides/migrating/app-router-migration.mdx), [Caching and revalidating](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/01-getting-started/09-caching-and-revalidating.mdx)
- Next.js v16.0.3 — Fetching data / Suspense: [Fetching data](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/01-getting-started/07-fetching-data.mdx), [Cache Components](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/01-getting-started/06-cache-components.mdx)
- Project context: `.planning/PROJECT.md` (KTG One constraints, brownfield notes)

---
*Architecture research for: Next.js App Router + headless CMS (KTG One / ktgv2)*
*Researched: 2026-03-21*

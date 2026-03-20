# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Next.js App Router full-stack frontend with a headless WordPress CMS

**Key Characteristics:**
- Server Components by default; interactive UI isolated in `"use client"` components
- Blog and SEO-critical routes fetch WordPress JSON via `fetch` in Server Components with ISR (`revalidate`)
- Global shell: root layout wraps all pages in smooth-scroll (`ReactLenis`) and shared chrome (`Header` / `Footer` patterns per route)
- No dedicated API layer in-repo for CMS: `src/lib/wordpress.js` calls WordPress REST directly from the server

## Layers

**App Router (pages, layouts, metadata):**
- Purpose: URL mapping, HTML shell, route-level `metadata` / `generateMetadata`, ISR configuration
- Location: `src/app/`
- Contains: `layout.jsx`, `page.jsx`, route segments (`blog/`, `expertise/`, `validation/`), `template.jsx`, `sitemap.js`
- Depends on: `@/components/*`, `@/lib/wordpress`, Next.js (`next/font`, `next/image`, `next/link`, `next/navigation`)
- Used by: HTTP requests to Vercel-hosted Next.js

**Presentation & interaction (`components/`):**
- Purpose: UI sections, animations, navigation, reusable primitives
- Location: `src/components/`
- Contains: Feature sections (`HeroSection.jsx`, `ExpertiseSection.jsx`, …), layout helpers (`ClientLayout.jsx`, `PageTransition.jsx`), `ui/` and `shadcn-studio/` building blocks
- Depends on: GSAP (`@gsap/react`, `gsap`), Tailwind classes, Lenis via parent `ClientLayout`, occasionally `@/lib/utils` (`cn`)
- Used by: App Router pages and layouts

**Data & integration (`lib/`):**
- Purpose: External HTTP integration and small pure helpers
- Location: `src/lib/wordpress.js`, `src/lib/utils.js`
- Contains: WordPress REST client (`getPosts`, `getPostBySlug`, `testWordPressConnection`), helpers (`getFeaturedImage`, `formatDate`), `cn()` for class merging
- Depends on: `NEXT_PUBLIC_WORDPRESS_URL` (with fallback host in code), Next.js `fetch` caching (`next: { revalidate }`)
- Used by: Server Components (`src/app/page.jsx`, `src/app/blog/*`, `src/app/sitemap.js`) and client components only for pure helpers imported from `wordpress.js` (e.g. `BlogPreview.jsx` uses `getFeaturedImage`, `formatDate`)

**Scroll / animation bridge (`libs/`):**
- Purpose: Integrate Lenis smooth scroll with GSAP `ScrollTrigger` ticker
- Location: `src/libs/lenis.jsx`
- Contains: `ReactLenis` wrapper wiring `gsap.ticker` and `ScrollTrigger.scrollerProxy`
- Depends on: `lenis`, `gsap`, `gsap/ScrollTrigger`
- Used by: `src/components/ClientLayout.jsx`

## Data Flow

**Homepage blog preview:**

1. Request hits `src/app/page.jsx` (Server Component).
2. Server calls `getPosts(1, 6)` in `src/lib/wordpress.js` (WordPress `/wp-json/wp/v2/posts` with `_embed`, ISR 60s).
3. On failure, `blogPosts` stays `[]`; page still renders.
4. Serialized props pass `posts` to client `BlogPreview` for animated grid; pure helpers from `wordpress.js` run on client for formatting and image URL.

**Blog list (`/blog`):**

1. `src/app/blog/page.jsx` calls `getPosts()`.
2. Posts rendered server-side; JSON-LD built inline for SEO.
3. No client global state; links navigate to `/blog/[slug]`.

**Blog post (`/blog/[slug]`):**

1. `generateStaticParams` in `src/app/blog/[slug]/page.jsx` pre-builds slugs from first page of posts.
2. `generateMetadata` and default export fetch `getPostBySlug(slug)`; missing post → `notFound()` from `next/navigation`.
3. HTML body uses `dangerouslySetInnerHTML` for `post.content.rendered` (trusted CMS output pattern).

**Sitemap:**

1. `src/app/sitemap.js` merges static routes with dynamic URLs from `getPosts(1, 100)`.
2. Errors in post fetch are logged; static routes still returned.

**State Management:**
- No Redux/Zustand usage in `src/` (Zustand is listed in `package.json` but unused in application code).
- Local UI state via React hooks in client components; server data fetched per request/route with ISR.

## Key Abstractions

**WordPress REST client:**
- Purpose: Single integration point for posts and embedded media
- Examples: `src/lib/wordpress.js`
- Pattern: Async functions returning arrays/null; `console.error` on failure; empty array/null fallbacks for resilience

**Route-level ISR:**
- Purpose: Balance freshness and performance for CMS-backed pages
- Examples: `export const revalidate = 60` in `src/app/page.jsx`, `src/app/blog/page.jsx`, `src/app/blog/[slug]/page.jsx`
- Pattern: Next.js incremental static regeneration on `fetch` options in `wordpress.js`

**Client layout shell:**
- Purpose: Smooth scroll + global cursor without blocking RSC tree
- Examples: `src/components/ClientLayout.jsx`, `src/app/layout.jsx` (imports `ClientLayout`, `GeometricBackground`, `CursorDot`)
- Pattern: Client boundary only where DOM/scroll behavior requires it

**Section components:**
- Purpose: Composable homepage slices reused on dedicated routes (`expertise`, `validation`)
- Examples: `src/components/ExpertiseSection.jsx`, `src/components/ValidationSection.jsx` used from `src/app/expertise/page.jsx` and `src/app/validation/page.jsx`

## Entry Points

**Next.js application:**
- Location: `package.json` scripts → `next dev` / `next build` / `next start`
- Triggers: Local dev or Vercel production
- Responsibilities: Bundle App Router tree from `src/app/`

**Root layout:**
- Location: `src/app/layout.jsx`
- Triggers: Every document request
- Responsibilities: Fonts (`next/font/google`), global CSS (`./globals.css`), default `metadata` / `viewport`, wraps children with `ClientLayout`, background, analytics (`SpeedInsights`), `CursorDot`

**Per-route transition template:**
- Location: `src/app/template.jsx`
- Triggers: Navigations between routes (nested under layout)
- Responsibilities: Wraps route segments in `PageTransition` for enter/exit animation

**Sitemap generator:**
- Location: `src/app/sitemap.js`
- Triggers: `/sitemap.xml` request (Next.js metadata route convention)
- Responsibilities: Merge static and WordPress-derived URLs

## Error Handling

**Strategy:** Fail soft for CMS availability; fail hard for missing blog posts (404).

**Patterns:**
- `try/catch` around `getPosts` / `getPostBySlug` in pages; empty lists and `notFound()` for missing slugs
- `wordpress.js` returns `[]` or `null` on HTTP errors; optional fallback fetch without `_embed` on 403
- `console.error` for diagnostics (no structured logging service in-repo)

## Cross-Cutting Concerns

**Logging:** `console.error` / `console.warn` in `wordpress.js` and pages

**Validation:** Response shape checks (`Array.isArray` for post lists); HTML from WordPress rendered with awareness of XSS tradeoffs (CMS-trusted content)

**Authentication:** None for public portfolio; WordPress is read-only via public REST

**Performance / UX:** `next.config.js` image `remotePatterns` for `ktg.one` and WordPress host; Lenis + GSAP ticker sync in `src/libs/lenis.jsx`

---

*Architecture analysis: 2026-03-21*

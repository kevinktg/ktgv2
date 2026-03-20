# Project Research Summary

**Project:** KTG One (ktgv2)  
**Domain:** Next.js App Router marketing/portfolio site + headless WordPress blog on Vercel  
**Researched:** 2026-03-21  
**Confidence:** MEDIUM–HIGH (stack/architecture strong on Next 16 + official patterns; features partly industry norms; WP operational edge cases environment-specific)

## Executive Summary

KTG One is a **public marketing and editorial site**: Next.js owns all routes and UX; WordPress is a **read-only content API** (`/wp-json/wp/v2/*`, `_embed` for media). Experts ship this as **server-first App Router pages** (RSC + `fetch` Data Cache) with **small client islands** for Lenis, GSAP, and interaction—matching the brand’s motion bar without surrendering Core Web Vitals.

The recommended approach is to **lock the core stack** (Next 16 + React 19, Tailwind 4, GSAP 3.13 + `@gsap/react`, Lenis, Vercel) and **centralize every WordPress call** in `src/lib/wordpress.js` with an **explicit fetch policy** (tags + `revalidate` vs `no-store`), then layer blog routes, SEO artifacts, and optional webhooks. **Do not** animate layout properties, duplicate scroll controllers, or scatter incompatible `fetch` options—those are the fastest paths to jank and “stale forever” bugs.

Primary risks are **caching semantics** (Next Data Cache vs route cache vs WordPress/plugin caching of JSON), **pagination blind spots** (sitemaps and lists stopping at page 1), **unbounded fetches** to WordPress, and **raw HTML trust** for `content.rendered`. Mitigate with a documented policy table, tagged fetches + optional `revalidateTag` webhooks, paginated REST loops using `X-WP-Total` / `X-WP-TotalPages`, a single timeout wrapper on hot paths, and a signed-off sanitization or trust model for rich text.

## Key Findings

### Recommended Stack

Research supports staying on the **current brownfield line**: Next.js **16.x** with **React 19.2.x** (keep `react` / `react-dom` aligned), **Tailwind CSS 4.x** via the existing PostCSS pipeline, **WordPress REST + `_embed`** (no CMS swap in v1), **GSAP 3.13 + `@gsap/react` 2.1** with `useGSAP` and scoped cleanup, **Lenis 1.3.x** with **one** scroll/RAF integration point synced to GSAP’s ticker, and **Vercel** as deploy target (`vercel.json` constraints including `installCommand` with `--legacy-peer-deps` until peer conflicts are resolved). Use **`next/image`** with complete `images.remotePatterns` for WP hosts; keep **@vercel/speed-insights** for RUM proof. **Audit or remove** unused **Three/R3F** and **AI SDK** packages if not product-critical—they inflate bundle and peer-dep pain.

**Core technologies:**

- **Next.js 16:** App Router, RSC, Metadata API, image optimization, Vercel-native deploy — standard for this product class.  
- **React 19:** Aligned runtime for Next 16; avoid version skew.  
- **Tailwind 4:** Utility tokens + v4 import/PostCSS stack already in project.  
- **WordPress (REST):** Editorial CMS with `_embed`; GraphQL deferred until complexity demands it.  
- **GSAP + @gsap/react:** ScrollTrigger storytelling with automatic context teardown.  
- **Lenis:** Smooth scroll; must not fight ScrollTrigger (single driver).  
- **Vercel:** Hosting, CDN, Speed Insights.

See `.planning/research/STACK.md` for alternatives (ISR vs on-demand, GraphQL vs REST) and explicit “what not to use.”

### Expected Features

**Must have (table stakes):**

- Fast perceived performance (CWV-friendly; motion must not tank LCP/CLS)  
- Mobile-responsive layout  
- Clear navigation and contact / next-step CTA  
- Blog index + `[slug]` post pages with stable URLs and reliable featured media (`_embed`, fallbacks)  
- Page-level SEO (`metadata` / `generateMetadata`, absolute OG/Twitter image URLs)  
- Sitemap + robots  
- Graceful CMS failure handling + professional `not-found`  
- Accessible basics (including reduced motion for heavy animation)  
- Sensible security posture (no secrets in client, sanitize HTML policy for WP bodies)

**Should have (competitive / brand):**

- Distinctive GSAP + Lenis motion within perf rules  
- Editorial long-form narrative and case-study depth (where product demands)  
- Strong share previews (OG/Twitter) and JSON-LD where implemented  
- Performance as proof (Speed Insights / analytics story)  
- Content ops that let editors publish without devs

**Defer (v2+ or v1.x triggers):**

- Full in-app live CMS preview, heavy Algolia-style search, comments, member-only blog, parallel experimental app trees in production  
- WP replacement or native apps / authenticated areas (out of scope per PROJECT)  
- Multi-sitemap, RSS, on-demand revalidation — **after** validation triggers (post volume, editor expectations)

See `.planning/research/FEATURES.md` for anti-features and prioritization matrix (P1–P3).

### Architecture Approach

Adopt a **layered App Router** architecture: Vercel edge caches → **RSC-first** pages that `fetch` through a **single CMS adapter** → **client islands** for Lenis/GSAP only. **Route handlers** optional for webhooks calling `revalidateTag` / `revalidatePath`. Split **marketing** (often static or long `revalidate`) from **blog** (shorter ISR or tags + webhook). **Never** mark the whole app dynamic for one widget—scope `dynamic` / `no-store` to the segment that needs it. **Sanitize** rich HTML on the server; pass serializable props to clients.

**Major components:**

1. **Root `app/layout` + segment layouts** — global shell, fonts, metadata defaults, optional route groups.  
2. **`lib/wordpress.js`** — all REST access, timeouts, headers, error fallbacks, and **one** fetch/cache policy.  
3. **Client layout / motion** — Lenis, GSAP, interactive UI behind `"use client"`.  
4. **Blog routes** — list + `[slug]` with `generateMetadata` and shared adapter.  
5. **SEO artifacts** — `sitemap`, `robots`, JSON-LD aligned with routes.  
6. **Optional `/api` revalidate** — secured webhook for on-demand freshness.

See `.planning/research/ARCHITECTURE.md` for diagrams, anti-patterns, and build order.

### Critical Pitfalls

1. **Mismatched caching semantics** — Next Data Cache, route cache, and WordPress/plugin caching of `/wp-json` can all produce “stale forever.” **Avoid:** tag WP fetches, document one freshness policy, verify origin `Cache-Control` and plugin exclusions, use `revalidateTag` where appropriate (not only `revalidatePath`).  
2. **Treating `cache: 'no-store'` and `next.revalidate` as interchangeable** — causes hammering WP or surprise staleness. **Avoid:** a small **fetch policy table** for list, detail, sitemap, metadata, health checks.  
3. **Pagination / “first page only”** — sitemaps and lists silently drop posts beyond REST page size (~100). **Avoid:** loop `page` until `X-WP-TotalPages` headers exhausted.  
4. **Unbounded fetches / no timeouts on hot paths** — SSR hangs, 504s, empty states. **Avoid:** one `fetch` wrapper with `AbortSignal`, shared timeout, consistent error handling.  
5. **`post.content.rendered` without a threat model** — XSS and broken embeds. **Avoid:** trusted WP posture, server-side sanitization or allowlist, minimal plugins.  
6. **Build-time coupling to live WP for `generateStaticParams`** — fragile CI when WP is down. **Avoid:** deterministic slug artifact or explicit dynamic strategy + docs.

See `.planning/research/PITFALLS.md` for the full checklist and recovery strategies.

## Implications for Roadmap

Suggested phase structure follows dependency order from architecture research and MVP scope from feature research.

### Phase 1: Foundation + shell

**Rationale:** Establishes routing, fonts, global styles, error boundaries, and a single place for motion/chrome without blocking CMS work.  
**Delivers:** Root layout, `globals.css`, baseline `not-found` / error patterns, `ClientLayout` (Lenis + GSAP ticker sync) wired once.  
**Addresses:** Table stakes (responsive shell, nav placeholder, theme), performance baseline for motion.  
**Avoids:** Pitfall duplicate scroll controllers; root-level `dynamic = 'force-dynamic'` without cause.

### Phase 2: CMS adapter + fetch policy

**Rationale:** Every downstream feature depends on consistent, testable WordPress access.  
**Delivers:** `lib/wordpress.js` with env-based base URL, timeouts on **all** hot paths, documented matrix (`revalidate`, tags, `no-store` where justified), empty/error shapes.  
**Addresses:** Blog data dependencies; “fresh content” requirement from FEATURES.  
**Avoids:** Pitfalls 1–2 (cache mismatch, `no-store` vs `revalidate` drift), Pitfall 4 (unbounded fetch).

### Phase 3: Marketing routes + motion islands

**Rationale:** Delivers homepage and key story sections using static or long-cache patterns while validating GSAP discipline.  
**Delivers:** Marketing pages/sections, hero/story blocks, transform/opacity-only animation, `prefers-reduced-motion`.  
**Addresses:** P1 differentiator (distinctive motion) + table stakes (CTA, responsive layout).  
**Avoids:** Layout-thrashing animation (STACK + PITFALLS performance traps).

### Phase 4: Blog list + detail + rich content

**Rationale:** Core editorial surface; depends on adapter and SEO patterns.  
**Delivers:** `/blog`, `/blog/[slug]`, `_embed` media, `generateMetadata`, typography for prose, differentiated empty vs error.  
**Addresses:** Table stakes (blog, URLs, featured images, CMS failure handling).  
**Avoids:** Pitfalls 3–5 (pagination awareness, XSS/HTML trust), client-side WP waterfalls.

### Phase 5: SEO + discoverability

**Rationale:** Depends on stable routes and complete URL lists.  
**Delivers:** `sitemap`, `robots`, JSON-LD consistency, OG/Twitter with absolute URLs; **paginated** sitemap if post count warrants.  
**Addresses:** Table stakes (sitemap, robots, metadata); P2 JSON-LD.  
**Avoids:** Pitfall 3 (first-page-only sitemap).

### Phase 6: Integration hardening + optional revalidation

**Rationale:** Editorial workflow and production truth require infra alignment.  
**Delivers:** Optional secured webhook → `revalidateTag`; WP plugin/CDN checklist for `/wp-json`; monitoring.  
**Addresses:** FEATURES v1.x triggers (on-demand revalidation); Pitfall 1 origin caching.  
**Avoids:** Unsigned webhooks; confusing `revalidatePath` vs `revalidateTag`.

### Phase 7: Build/CI + reliability polish

**Rationale:** Closes brownfield gaps called out in CONCERNS.  
**Delivers:** CI vs Vercel install alignment (`--legacy-peer-deps` or peer-dep fix), `generateStaticParams` strategy when WP unavailable, slug export artifact if needed.  
**Avoids:** Pitfall 6 (build coupling), technical debt from parallel `ktg*` trees (document or archive).

### Phase Ordering Rationale

- **Adapter before blog** prevents rework when cache tags and revalidation are added.  
- **Marketing + motion** can proceed in parallel with blog after adapter exists, or immediately after shell—either way, **blog SEO** waits for real routes and data.  
- **Sitemap after** blog routes ensures URL completeness; **webhooks** after tagged fetches and handler design.  
- **Hardening last** validates production behavior rather than guessing.

### Research Flags

Phases likely needing deeper research during planning (`/gsd:research-phase` or spike):

- **Phase 6 (Integration hardening):** WordPress host plugins, caching, and webhook capabilities vary—verify against real WP instance.  
- **Phase 5 (SEO at scale):** If post count explodes, research `generateSitemaps` and split sitemaps.  
- **Phase 4 (Rich content):** Sanitization library choice and embed allowlist if threat model tightens.

Phases with standard patterns (minimal extra research):

- **Phase 1–3:** Next.js App Router layout, Tailwind 4, GSAP `useGSAP` — well-documented.  
- **Phase 2:** WordPress REST pagination headers — documented in WP REST reference.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next 16 + React 19 + Tailwind 4 + GSAP/Lenis alignment verified against project files and Context7; WP “REST not GraphQL” is a deliberate product fit. |
| Features | MEDIUM | Table stakes are industry-standard; exact IA and case-study depth are product decisions. |
| Architecture | HIGH | RSC + adapter + client islands matches Next 16 docs and project constraints. |
| Pitfalls | MEDIUM–HIGH | Next/WP REST pitfalls are well-documented; plugin/CDN behavior needs environment validation. |

**Overall confidence:** MEDIUM–HIGH

### Gaps to Address

- **WordPress operational layer:** Cache plugins, security plugins, and CDN rules for `/wp-json` — validate with staging curl tests and host docs.  
- **Single authoritative freshness policy:** Resolve `no-store` vs `revalidate` vs tags in code and docs—currently flagged active in PROJECT.  
- **Experimental `ktg/` trees:** Decide canonical app root to avoid merge confusion.  
- **Unused deps (Three, AI):** Confirm removal or product requirement before locking roadmap.  
- **Tailwind v4 upgrades:** Re-verify against tailwindcss.com when bumping minors.

## Sources

### Primary (HIGH confidence)

- Context7 `/vercel/next.js` (v16.x) — `fetch` caching, `revalidateTag`, tags, App Router migration, Metadata API.  
- Context7 `/greensock/react` — `useGSAP`, scope, cleanup.  
- Next.js v16.0.3 docs (GitHub) — caching, revalidating, `generate-metadata`, fetching data.  
- WordPress developer reference — REST pagination (`X-WP-Total`, `X-WP-TotalPages`), REST server / CORS.  
- Project: `package.json`, `next.config.js`, `vercel.json`, `src/lib/wordpress.js`, `.planning/PROJECT.md`, `AGENTS.md`.

### Secondary (MEDIUM confidence)

- Headless WP + Next ecosystem (ISR, webhooks, GraphQL vs REST tradeoffs).  
- Stack Overflow / community reports on LiteSpeed and similar caching REST JSON.

### Tertiary (LOW confidence)

- Competitor-specific feature lists — directional only; validate per release.

---

*Research completed: 2026-03-21*  
*Ready for roadmap: yes*

*Detailed inputs: `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`*

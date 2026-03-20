# Roadmap: KTG One (ktgv2)

## Overview

Deliver a production-ready KTG One site in three coarse milestones: first a consistent marketing shell with Lenis/GSAP discipline; then WordPress-backed blog reading with safe HTML and predictable errors; finally SEO surfaces and operational reliability (build/CI, monitoring) so visitors can find the site and the team can ship with confidence.

## Phases

**Phase numbering:** Integer phases (1, 2, 3) for this milestone. Decimal phases reserved for urgent inserts via `/gsd:insert-phase`.

- [ ] **Phase 1: Marketing shell & motion** — Shared layout, client shell, GSAP/Lenis sync and performance rules
- [ ] **Phase 2: WordPress content & blog** — CMS adapter usage, post detail, index, not-found, HTML trust stance
- [ ] **Phase 3: SEO & operations** — Metadata, social previews, sitemap, build/CI, Speed Insights

## Phase Details

### Phase 1: Marketing shell & motion
**Goal:** Visitors experience a consistent branded shell with reliable Lenis/GSAP motion and no hydration failures on primary marketing routes.

**Depends on:** Nothing (first phase)

**Requirements:** MRKT-01, MRKT-02, MOTN-01, MOTN-02

**Success Criteria** (what must be TRUE):
  1. Visitor sees marketing pages using the shared app layout (fonts, global styles, header/footer patterns as implemented).
  2. Client-only shell (Lenis, GSAP-capable layout) wraps interactive routes without hydration failures on primary pages.
  3. GSAP usage follows project rules: `useGSAP` with scope, ScrollTrigger registered, transform/opacity-first animations.
  4. Smooth scroll (Lenis) and ScrollTrigger stay synchronized (single driver; no duplicate scroll controllers).

**Plans**

- [ ] **01-01** — [GSAP + Lenis correctness](phases/01-marketing-shell/01-01-PLAN.md) — ESM ScrollTrigger in Lenis bridge; `useGSAP` scope/deps; BlogPreview wheel + ScrollTrigger API fixes
- [ ] **01-02** — [Shell, hydration, motion QA](phases/01-marketing-shell/01-02-PLAN.md) — Route walkthrough, reduced-motion / transition hardening

### Phase 2: WordPress content & blog
**Goal:** Visitors can list and read WordPress posts with stable URLs, embedded media, safe HTML rendering, and clear handling of missing or failed content.

**Depends on:** Phase 1

**Requirements:** CMS-01, CMS-02, CMS-03, BLOG-01, BLOG-02, BLOG-03

**Success Criteria** (what must be TRUE):
  1. Site retrieves posts via REST with `_embed` for featured media using `src/lib/wordpress.js`.
  2. Visitor can browse a blog index that lists posts from WordPress.
  3. Visitor can open a post at `/blog/[slug]` with stable URLs aligned to WordPress permalinks.
  4. Unknown slugs show the App Router not-found experience (not a generic 500).
  5. Published WordPress HTML bodies render in post detail without breaking the page shell; trust/sanitization stance is documented and consistent.
  6. Single-post fetch handles empty API results and errors without crashing the page shell.

**Plans**

- [ ] **02-01** — WordPress client hardening — timeouts on all fetches, consistent error surfaces, HTML trust note for `dangerouslySetInnerHTML`
- [ ] **02-02** — Blog routes — index + `[slug]` + not-found; featured media fallbacks; pagination strategy if needed

### Phase 3: SEO & operations
**Goal:** Search and social surfaces reflect core routes and blog posts; production builds and monitoring match documented constraints.

**Depends on:** Phase 2

**Requirements:** SEO-01, SEO-02, SEO-03, OPS-01, OPS-02

**Success Criteria** (what must be TRUE):
  1. Core marketing and blog routes expose titles and descriptions via `metadata` / `generateMetadata`.
  2. Where dynamic metadata is implemented, Open Graph / Twitter metadata uses absolute image URLs.
  3. Generated sitemap includes key static routes and blog post URLs the product should expose.
  4. Production install/build matches documented constraints (`npm install --legacy-peer-deps` where required) and `npm run build` passes in CI.
  5. Speed Insights (or equivalent documented RUM) is included for production monitoring.

**Plans**

- [ ] **03-01** — Metadata + OG/Twitter absolute URLs audit across marketing + blog templates
- [ ] **03-02** — Sitemap scale (paginate beyond 100 posts), CI/build parity, Speed Insights verification

## Progress

**Execution order:** 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Marketing shell & motion | 0/2 | In progress (01-01 code landed) | - |
| 2. WordPress content & blog | 0/2 | Not started | - |
| 3. SEO & operations | 0/2 | Not started | - |

---
*Roadmap created: 2026-03-21 — granularity: coarse (3 phases)*  
*Milestone: current v1 planning cycle*  
*Last updated: 2026-03-21 — Phase 1 plans filed under `.planning/phases/01-marketing-shell/`; GSAP hygiene fixes in `src/`*

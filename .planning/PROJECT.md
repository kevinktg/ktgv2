# KTG One (ktgv2)

## What This Is

A public marketing and portfolio site for KTG (“KTG One”) — long-form storytelling, GSAP-driven motion, and a headless WordPress–backed blog — shipped as a Next.js App Router app on Vercel. Content for posts and embedded media is loaded from the WordPress REST API; the in-repo app owns layout, animation, SEO surfaces, and deployment.

## Core Value

Visitors reliably get a fast, credible brand experience and can read blog content sourced from WordPress without the marketing site depending on WordPress for page shells or routing.

## Requirements

### Validated

- ✓ Next.js App Router site with server-first pages and client islands — `src/app/` layouts, routes, `metadata` / `generateMetadata`, ISR-style fetch revalidation for CMS data — existing
- ✓ Headless WordPress integration for posts (list + by slug), featured images via `_embed`, connection test helper — `src/lib/wordpress.js` — existing
- ✓ Global shell: fonts, Speed Insights, Lenis + GSAP-friendly client layout patterns — `src/app/layout.jsx`, `src/components/ClientLayout.jsx`, `src/libs/lenis.jsx` — existing
- ✓ Blog and SEO artifacts: blog routes, JSON-LD where implemented, sitemap generation — `src/app/blog/`, `src/app/sitemap.js` — existing
- ✓ Styling system: Tailwind v4 + global theme tokens — `src/app/globals.css`, `tailwind.config.js`, `postcss.config.mjs` — existing
- ✓ Production deploy target Vercel with documented install constraints — `vercel.json`, `package.json` — existing

### Active

- [ ] Resolve open codebase concerns in priority order (dependency cleanup, experimental `ktg*` trees, WordPress fetch timeouts, sitemap pagination beyond 100 posts) per `.planning/codebase/CONCERNS.md`
- [ ] Align implementation with `AGENTS.md` where it differs (e.g. `cache: 'no-store'` vs current `revalidate` usage) with an explicit decision
- [ ] Populate `openmemory.md` as a living index when major components or integrations stabilize

### Out of Scope

- Replacing WordPress with a different CMS in v1 planning — would be a major pivot; defer unless explicitly prioritized
- Native mobile apps — web-first
- Visitor authentication / accounts — not part of current public marketing site

## Context

- **Brownfield:** Production-oriented Next.js 16 + React 19 codebase; path alias `@/*` → `src/*` (`jsconfig.json`).
- **CMS:** WordPress at `NEXT_PUBLIC_WORDPRESS_URL` (fallback host documented in `src/lib/wordpress.js`); read-only from the app.
- **Motion:** GSAP + Lenis patterns; performance-sensitive (transform/opacity, ScrollTrigger).
- **Parallel trees:** Root-level `ktg/`, `ktg2/`, `ktg3/` folders appear to be exports/experiments; canonical app is under `src/`.
- **Initialization note:** This document was bootstrapped from repository analysis and `.planning/codebase/*` after GSD codebase mapping (2026-03-21), not from a live interview. Refine goals with the product owner when needed.

## Constraints

- **Tech stack:** Next.js App Router, Tailwind v4, GSAP, Lenis, WordPress REST — established; large framework changes need explicit approval
- **Hosting:** Vercel; `installCommand` uses `npm install --legacy-peer-deps` per `vercel.json`
- **Content:** Blog copy and HTML bodies ultimately originate in WordPress; trust and sanitization assumptions apply (see CONCERNS)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Headless WordPress for blog | Editorial workflow and media stay in CMS; Next owns UX | — Pending |
| GSAP + Lenis for motion | Brand requirement for scroll storytelling; documented perf patterns in AGENTS | — Pending |
| npm + package-lock as primary install | CI uses `npm ci` | — Pending |

---
*Last updated: 2026-03-21 after GSD project initialization*

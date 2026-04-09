# Roadmap: KTG One (ktgv2)

## Overview

Deliver a production-ready KTG One site in three coarse milestones: first a consistent marketing shell with Lenis/GSAP discipline; then WordPress-backed blog reading with safe HTML and predictable errors; finally SEO surfaces and operational reliability (build/CI, monitoring) so visitors can find the site and the team can ship with confidence.

A parallel feature branch (`feature/ulti-chat-integration`) builds the AI hub chat at `/hub/chat` â€” this is separate from the v1 marketing milestone but tracked here.

**Two tracks until merge:** The table under [Progress](#progress) is **marketing phases 1â€“3 only**. Hub chat progress lives in the **Hub Chat Feature Branch** table below and in `.planning/STATE.md`. After this branch merges to `main`, fold hub work into **Phases 4+** as a single ordered roadmap.

## Planning discipline

- Reconciliation / alignment work defaults to **markdown and `.planning/` only** unless you explicitly request application code under `src/`.

## Roadmap evolution

- **2026-04-01:** Hub chat lives at `/hub/chat` (`src/app/hub/chat`, `src/app/api/hub/chat/route.js`). Legacy AI Studio app was **moved** to `_reference/ulti-chat/` (gitignored), not deleted. After merge to `main`, the hub table below folds into **Phases 4+** (one sequence of plans).

## Phases

**Phase numbering:** Integer phases (1, 2, 3) for this milestone. Decimal phases reserved for urgent inserts via `/gsd:insert-phase`.

- [ ] **Phase 1: Marketing shell & motion** â€” Shared layout, client shell, GSAP/Lenis sync and performance rules
- [ ] **Phase 2: WordPress content & blog** â€” CMS adapter usage, post detail, index, not-found, HTML trust stance
- [ ] **Phase 3: SEO & operations** â€” Metadata, social previews, sitemap, build/CI, Speed Insights
- [ ] **Phase 5: Hub Chat Production** — Integrated streaming chat at /hub/chat with multi-model support, MCPs, and GSAP animations

### Phase 5: Hub Chat Production
**Goal:** Implement the production-ready AI chat gateway with streaming, tool calling, and high-end animations.

**Depends on:** Phase 1 (for motion shell)

**Requirements:** HUB-PH2, HUB-PH5, HUB-PH6, HUB-PH7

**Success Criteria** (what must be TRUE):
  1. Visitor can chat with multiple models (Gemini, Claude, GPT) at /hub/chat.
  2. Messages stream in real-time with smooth GSAP transitions.
  3. User can toggle web search (grounding) and use active MCP/Skills (db-access).
  4. Chat settings persist via localStorage.

**Plans**

- [ ] **05-01** — [API & Page Scaffolding](phases/05-hub-chat-production/05-01-PLAN.md) — Multi-provider POST route; useChat hook integration
- [ ] **05-02** — [Logic & UI Components](phases/05-hub-chat-production/05-02-PLAN.md) — ChatControls (Model/Search/MCPs); settings persistence
- [ ] **05-03** — [UX Refinement & Tooling](phases/05-hub-chat-production/05-03-PLAN.md) — GSAP message animations; db-access tool verification

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

- [ ] **01-01** â€” [GSAP + Lenis correctness](phases/01-marketing-shell/01-01-PLAN.md) â€” ESM ScrollTrigger in Lenis bridge; `useGSAP` scope/deps; ScrollTrigger API fixes across homepage sections
- [ ] **01-02** â€” [Shell, hydration, motion QA](phases/01-marketing-shell/01-02-PLAN.md) â€” Route walkthrough, reduced-motion / transition hardening

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

- [x] **02-01** â€” [WordPress client hardening](phases/02-wordpress-content-blog/02-01-PLAN.md) â€” timeouts on all fetches, consistent error surfaces, HTML trust note for `dangerouslySetInnerHTML`
- [x] **02-02** â€” [Blog routes](phases/02-wordpress-content-blog/02-02-PLAN.md) â€” index + `[slug]` + not-found; featured media fallbacks; pagination strategy if needed

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

- [ ] **03-01** â€” Metadata + OG/Twitter absolute URLs audit across marketing + blog templates
- [ ] **03-02** â€” Sitemap scale (paginate beyond 100 posts), CI/build parity, Speed Insights verification

---

## Hub Chat Feature Branch (`feature/ulti-chat-integration`)

**Goal:** Integrate AI chat at `/hub/chat` as a multi-model gateway with personas, prompt injects, skills, and MCP toggles.

**Branch:** `feature/ulti-chat-integration` (off main @ `9b46dde`)
**Research:** `.planning/phases/hub-RESEARCH.md`
**Detail plan:** `task_plan.md` (root)

**Hub Chat Phases**

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Branch + deps + reference move | âœ… Complete |
| 2 | API route (9 providers, 21 models, 4 SDK bugs fixed) | âœ… Complete |
| 3 | Component decomposition | â¸ï¸ Deferred |
| 4 | shadcn/ui conversion | âœ… Complete |
| 5 | Route integration at `/hub/chat` | âœ… Complete |
| 6 | Verification (live testing) | ðŸ”„ In Progress â€” needs API keys |
| 7 | Polish (dots, Iosevka, real skills, presets) | â¸ï¸ Pending |

**Blocked on:** API keys in `.env.local`. Run `vercel env pull .env.local`.

**Post-merge numbering (target):** Hub verification + production env â†’ **Phase 4**; hub polish (deferred Phase 7 items) â†’ **Phase 5** or sub-plans under Phase 4; then resume marketing **Phases 1â€“3** open plans as needed (or run in parallel with Phase 4 if marketing ships first).

---

## Progress

**Execution order:** 1 â†’ 2 â†’ 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Marketing shell & motion | 1/2 | In progress (01-01 complete; 01-02 QA pending) | - |
| 2. WordPress content & blog | 2/2 | Complete (executed 2026-04-01) | 2026-04-01 |
| 3. SEO & operations | 0/2 | Not started | - |

---
*Roadmap created: 2026-03-21 â€” granularity: coarse (3 phases)*
*Milestone: current v1 planning cycle*
*Last updated: 2026-04-01 â€” Roadmapper: two-track note, post-merge Phase 4+, planning discipline; prior 2026-03-24 hub table*

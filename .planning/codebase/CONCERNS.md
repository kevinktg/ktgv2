# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**Orphaned AI / chat dependencies:**
- Issue: `package.json` includes `ai`, `@ai-sdk/openai`, and `zustand`, but there are no imports from these packages under `src/`. Git history indicates `src/app/api/chat/route.js` was removed, leaving no in-repo consumer for the AI SDK stack.
- Why: Feature removal or migration without dependency cleanup.
- Impact: Larger install surface, confusing audits, possible peer-dep pressure (project relies on `vercel.json` `installCommand` with `--legacy-peer-deps`).
- Fix approach: Remove unused packages after confirming no planned chat route, or restore a single API route and wire imports intentionally.

**Likely-unused npm packages:**
- Issue: The `array` package is listed in `package.json` but is not referenced in application code under `src/` (only the word "array" appears in comments in `src/lib/wordpress.js`).
- Why: Leftover from an experiment or mistaken add.
- Impact: Noise in dependency tree and supply-chain review scope.
- Fix approach: `npm uninstall array` after verifying no dynamic `require`.

**Duplicate / experimental app trees at repo root:**
- Issue: Untracked or parallel directories `ktg/`, `ktg2/`, `ktg3/` contain copies of pages and components (e.g. `ktg/mnt/user-data/outputs/blog/[slug]/page.jsx`, `ktg2/page.jsx`). The production app lives under `src/` per `jsconfig.json` path alias `@/*` → `./src/*`.
- Why: Export or scaffold experiments checked into the same repo.
- Impact: Editors and searches surface wrong files; risk of editing a dead copy; merge/confusion for future agents.
- Fix approach: Move experiments to a branch, archive folder outside the Next app root, or delete after diffing against `src/`.

**Project memory guide empty:**
- Issue: `openmemory.md` at the repository root is empty.
- Why: Guide not yet populated per project conventions.
- Impact: Onboarding and cross-session continuity rely on `AGENTS.md` and code only.
- Fix approach: Populate the guide as components and integrations stabilize (per workspace rules).

**WordPress fetch timeout inconsistency:**
- Issue: `src/lib/wordpress.js` defines `fetchWithTimeout` (10s) for connection tests and 403 fallbacks, but primary `getPosts` / `getPostBySlug` use plain `fetch` without `AbortSignal`, so a hung upstream can block SSR/build longer than the documented timeout.
- Why: ISR `next: { revalidate: 60 }` path may have been added without unifying timeout behavior.
- Impact: Slow or stuck WordPress can delay page generation and sitemap builds.
- Fix approach: Route all WordPress calls through `fetchWithTimeout` (or shared wrapper) with consistent abort and logging.

## Known Bugs

**Sitemap may omit posts beyond the first 100:**
- Symptoms: `/sitemap.xml` lists at most 100 blog URLs from `getPosts(1, 100)` in `src/app/sitemap.js`.
- Trigger: More than 100 published posts in WordPress with newer posts beyond the first page of the REST response order.
- Workaround: None for discoverability; SEO may miss URLs.
- Root cause: Single-page fetch with no pagination loop.
- Blocked by: None; fix is incremental fetches or WP endpoint that returns all slugs.

**Build-time static params depend on live WordPress:**
- Symptoms: `generateStaticParams` in `src/app/blog/[slug]/page.jsx` calls `getPosts(1, 20)`; if the API fails during build, params return `[]` and fewer routes are pre-rendered (mitigated by `dynamicParams = true`).
- Trigger: WordPress down or blocked during CI/build.
- Workaround: On-demand ISR still builds missing slugs at runtime when the API is healthy.
- Root cause: No persisted slug list for build-only use.

## Security Considerations

**Rendered WordPress HTML without sanitization:**
- Risk: `post.content.rendered` is injected with `dangerouslySetInnerHTML` in `src/app/blog/[slug]/page.jsx`. JSON-LD uses `JSON.stringify` in a script tag (safe for JSON-LD). If the WordPress site is compromised or a malicious post is published, script-bearing HTML could execute in the browser context.
- Current mitigation: Trust boundary is the self-hosted WordPress instance and editorial access; content is first-party CMS output.
- Recommendations: Keep WP hardened (roles, plugins), consider server-side sanitization (e.g. `isomorphic-dompurify` or allowlist) for HTML bodies, or render via a constrained rich-text pipeline.

**Public WordPress URL in client bundle:**
- Risk: `NEXT_PUBLIC_WORDPRESS_URL` falls back to a default host in `src/lib/wordpress.js` (visible in client/server bundles). This exposes which origin is queried (not secret, but fixed infrastructure detail).
- Current mitigation: Override via env in production for flexibility.
- Recommendations: Set explicit `NEXT_PUBLIC_WORDPRESS_URL` in Vercel env; avoid relying on the baked-in default long term.

**No application-level authentication:**
- Risk: Site is public marketing/blog; no user sessions in `src/`. If future admin or API routes are added, they must not follow “client-only” checks.
- Current mitigation: N/A for current scope.
- Recommendations: Use Next.js `middleware` and server-only secrets for any future protected routes.

## Performance Bottlenecks

**WebGL hero (`HeroImages.jsx`):**
- Problem: Three.js + `@react-three/fiber` canvas runs on the home hero after lazy load (`src/components/HeroSection.jsx`).
- Measurement: Not captured in-repo (no perf budgets or RUM thresholds checked in).
- Cause: GPU shader work and texture uploads per session on first paint of hero.
- Improvement path: Offer reduced-motion path (respect `prefers-reduced-motion`), cap DPR on low-end devices, or static fallback image for repeat visits.

**Scroll stack complexity (Lenis + GSAP + ScrollTrigger):**
- Problem: `src/libs/lenis.jsx` wires Lenis to GSAP ticker, `ScrollTrigger.scrollerProxy`, and exposes `window.lenis` for `SkipButton` / `HeroSection`.
- Measurement: Not instrumented in-repo.
- Cause: Tight coupling between smooth scroll and animation timelines; order of registration matters.
- Improvement path: Centralize scroll integration tests (even smoke in browser), document teardown expectations when adding new `ScrollTrigger` sections.

**WordPress ISR vs freshness:**
- Problem: Posts use `revalidate = 60` and fetches use `next: { revalidate: 60 }` in `src/lib/wordpress.js` and `src/app/blog/[slug]/page.jsx`.
- Measurement: Depends on traffic and CDN; not logged here.
- Cause: Cached responses may lag CMS edits by up to a minute.
- Improvement path: Use `revalidatePath` / webhook from WordPress on publish if near-real-time updates are required.

## Fragile Areas

**GSAP sections with horizontal scroll and ref timing (`ValidationSection.jsx`):**
- Why fragile: Multiple refs, `sessionStorage` for animation state, and `console.warn` paths when refs or horizontal content are missing suggest edge cases on fast navigation or layout shift.
- Common failures: ScrollTrigger mis-measurement if images/fonts load late.
- Safe modification: Change layout in small steps; run `ScrollTrigger.refresh()` after asset load if adding content above the section; test mobile and reduced viewport.
- Test coverage: No automated tests (see Test Coverage Gaps).

**Global `window.lenis` usage:**
- Why fragile: `src/libs/lenis.jsx` assigns `window.lenis` for cross-component scroll control; any typo or double-mount can leave stale references.
- Common failures: SSR/hydration already guarded by client components; risk is mostly runtime ordering.
- Safe modification: Prefer React context or a small module singleton if refactoring; keep cleanup in `useEffect` return.
- Test coverage: None.

## Scaling Limits

**WordPress REST as single content bottleneck:**
- Current capacity: Rate limits and PHP worker limits depend on Hostinger/WordPress plan (not documented in-repo).
- Limit: Traffic spikes or slow REST responses affect Next.js page generation and ISR.
- Symptoms at limit: Timeouts, empty blog arrays, empty sitemap entries for posts.
- Scaling path: Edge cache HTML aggressively, add CDN in front of WP, or increase WP tier; consider GraphQL or dedicated headless plugin if API becomes hot.

**GitHub Actions vs Vercel install flags:**
- Current capacity: `.github/workflows/deploy.yml` runs `npm ci` then `npm run build` without `--legacy-peer-deps`; `vercel.json` uses `npm install --legacy-peer-deps`.
- Limit: Lockfile/peer resolution differences can cause CI pass/fail to diverge from Vercel.
- Symptoms at limit: CI fails on peer conflicts while Vercel succeeds (or vice versa).
- Scaling path: Align install command (e.g. `npm ci --legacy-peer-deps` if required) or resolve peer dependencies so legacy flag is unnecessary.

## Dependencies at Risk

**Peer-deps workaround (`--legacy-peer-deps`):**
- Risk: Documented as required in `vercel.json` and `AGENTS.md`; indicates dependency tree tension (React 19 + ecosystem).
- Impact: Future major upgrades may require manual resolution.
- Migration plan: Periodically run `npm ls` and upgrade stacks together; aim to remove `--legacy-peer-deps` when peers align.

## Missing Critical Features

**Automated tests:**
- Problem: No `*.test.*` or `*.spec.*` files detected under the repo; `AGENTS.md` states no test framework is configured.
- Current workaround: Manual QA and `npm run build` / lint in CI.
- Blocks: Regressions in GSAP, routing, or WordPress integration are caught late.
- Implementation complexity: Medium (choose Vitest or Playwright for smoke, mock WP or use staging URL).

## Test Coverage Gaps

**WordPress client (`src/lib/wordpress.js`):**
- What's not tested: Error branches, 403 fallback, non-array JSON, timeout behavior.
- Risk: Silent empty blog or wrong ISR behavior after API changes.
- Priority: High for content-dependent revenue/SEO.
- Difficulty to test: Requires HTTP mocking or contract tests against a fixture JSON.

**Animation and layout integration:**
- What's not tested: Lenis + GSAP synchronization, hero lazy load, Validation section horizontal scroll.
- Risk: Visual regressions and scroll jank on specific browsers.
- Priority: Medium.
- Difficulty to test: Typically E2E or visual snapshots, higher flake without stable selectors.

---

*Concerns audit: 2026-03-21*
*Update as issues are fixed or new ones discovered*

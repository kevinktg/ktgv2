# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**Animation-Heavy Components & Memory Overhead:**
- Issue: ValidationSection, ExpertiseSection, PhilosophySection, and BlogPreview all use complex GSAP timelines with ScrollTrigger, multiple staggered animations, and sessionStorage checks. These components run initialization timeouts (ValidationSection: 300ms delay, with ResizeObserver + window.addEventListener for reschedules).
- Files: `src/components/ValidationSection.jsx` (332 lines), `src/components/ExpertiseSection.jsx` (256 lines), `src/components/PhilosophySection.jsx` (193 lines), `src/components/BlogPreview.jsx` (284 lines)
- Impact: Animation setup delays (300ms setTimeout), multiple ScrollTrigger instances competing for DOM measurement cycles, potential jank on lower-end devices. ResizeObserver triggers rapid re-layouts.
- Fix approach: Consolidate animation registration into a single manager per page, debounce ScrollTrigger.refresh() calls, consider intersection-based animation triggers as fallback for lower-end browsers, profile with DevTools to identify actual frame drops.

**Console Logging Left in Production Code:**
- Issue: WordPress.js module logs errors, warnings, and connection diagnostics directly to console. Blog pages also log errors. No centralized error handling or silent fail-safe for production.
- Files: `src/lib/wordpress.js` (18 console statements across getPosts, getPostBySlug, testWordPressConnection), `src/app/blog/page.jsx`, `src/app/blog/[slug]/page.jsx`, `src/app/sitemap.js`
- Impact: Exposed error details in browser console (API endpoints, timeouts, fallback attempts), unstructured logging makes debugging harder, no error tracking to identify issues pre-release.
- Fix approach: Replace console.error/warn with conditional logging tied to environment variable (log in dev/staging, silent in prod). Integrate Sentry or similar error tracking for production failures. Wrap API errors in custom Error class with structured context.

**SessionStorage Dependency for Animation State:**
- Issue: ValidationSection, ExpertiseSection, BlogPreview, HeroImages all use sessionStorage to skip animations on revisit (setItem on animation complete, check on mount). This couples UI state to browser storage and doesn't account for tab refresh or navigation patterns.
- Files: `src/components/ValidationSection.jsx` (lines 67-71, 97), `src/components/ExpertiseSection.jsx` (lines 46-51, 96), `src/components/BlogPreview.jsx` (lines 29-33, 92), `src/components/HeroImages.jsx` (lines 149-153)
- Impact: Animation skipping is fragile (sessionStorage can be cleared by users), inconsistent UX (some tabs animate, some don't), no server-side awareness of animation state, difficult to test animation logic.
- Fix approach: Move animation control to React state with URL search param or route tracking (e.g., `?_anim=done`), use React context to share animation state across page, or implement server-side preference tracking if user is logged in.

## Known Bugs

**WordPress API Timeout Fallback Not Guaranteed:**
- Symptoms: Blog pages show "System awaiting input from WordPress..." when getPosts() returns empty array. Fallback to fetch without `_embed` parameter only triggers on 403 status, but other timeout/connection errors return empty array silently.
- Files: `src/lib/wordpress.js` (lines 40-101 in getPosts, 104-160 in getPostBySlug)
- Trigger: Network timeout, DNS failure, WordPress server 500 error, or intermittent 403 from shared hosting
- Workaround: Restart WordPress site or clear Vercel cache to force revalidate. Manual POST to blog page should trigger revalidate = 60.

**ResizeObserver Setup Timing Issue in ValidationSection:**
- Symptoms: Horizontal scroll animation may not fire immediately on mount if layout is still settling. Console warns "[ValidationSection] No horizontal overflow yet — layout may still be settling."
- Files: `src/components/ValidationSection.jsx` (lines 123-161, particularly line 141)
- Trigger: Fast renders or when browser hasn't measured layout yet (typically doesn't happen in normal navigation, but possible on very slow devices or during SSR->CSR hydration)
- Workaround: Scroll trigger is re-armed by ResizeObserver, so scrolling down then up again forces re-calculation.

**HeroImages Canvas Texture Loading Race Condition:**
- Symptoms: On desktop, isReady state may set before textures finish loading, causing opacity fade-in to complete before material is ready. Textures load async in useEffect Promise.all().
- Files: `src/components/HeroImages.jsx` (lines 93-105, 173)
- Trigger: Slow network, large image files, or rapid component mount/unmount
- Workaround: Textures load in background after fade-in completes, so visual pop-in is minimal.

## Security Considerations

**WordPress API URL Exposed in Client Code:**
- Risk: NEXT_PUBLIC_WORDPRESS_URL is hardcoded as a public env var and visible in browser Network tab. CORS or rate limiting could allow DDoS.
- Files: `src/lib/wordpress.js` (line 2), also passed to Image component in BlogPreview
- Current mitigation: Firewall rules on WordPress host (presumably configured), ISR caching reduces repeated hits
- Recommendations: Wrap WordPress fetches through Next.js API route (e.g., `/api/posts`) to hide origin URL and add rate limiting. Use `dangerouslySetInnerHTML` in blog page (line 69) is safe (trusted schema.org JSON-LD), but verify no user-generated content is injected.

**dangerouslySetInnerHTML for JSON-LD:**
- Risk: JSON-LD is trusted schema.org content, but if post.title or post.url ever comes from untrusted source, XSS is possible.
- Files: `src/app/blog/page.jsx` (line 69)
- Current mitigation: WordPress API provides raw title/slug, assuming sanitized on WordPress side
- Recommendations: Add explicit sanitization layer for post.title and post.slug before JSON-LD injection, or move JSON-LD generation to server-side metadata export.

## Performance Bottlenecks

**Continuous requestAnimationFrame in GlobalCursor:**
- Problem: animate() runs in requestAnimationFrame loop even when user is not moving mouse. Performs DOM writes (transform style updates) 60fps continuously.
- Files: `src/components/GlobalCursor.jsx` (lines 25-37, 41)
- Cause: RAF always re-schedules itself; no check to pause when mouse hasn't moved
- Improvement path: Add `isMoving` flag (like CursorDot), pause RAF when idle, resume on mousemove. Expected savings: 60 layout/composite ops/sec when static.

**Excessive GSAP gsap.set() Calls in CursorDot Animation Loop:**
- Problem: render() function calls gsap.set() for EVERY dot on EVERY frame (12 dots * 60fps = 720 property updates/sec). gsap.set() includes property interpolation and cache invalidation.
- Files: `src/components/CursorDot.jsx` (lines 42-48, 61-67)
- Cause: Using GSAP for immediate positional updates instead of CSS transforms or direct style mutation
- Improvement path: Replace gsap.set() calls with direct `el.style.transform = '...'` for position-only updates, reserve GSAP for actual tweens (fade in/out). Expected savings: ~80% reduction in JS execution time during render loop.

**Multiple ScrollTrigger Instances Without Consolidation:**
- Problem: ValidationSection creates 1 ScrollTrigger, ExpertiseSection creates 1, PhilosophySection creates multiple (per quote element). Each trigger has its own invalidateOnRefresh logic and recalculation budget.
- Files: Multiple component files with ScrollTrigger usage
- Cause: Component-level architecture doesn't share trigger context
- Improvement path: Create a central ScrollTrigger manager or use Lenis scroll listener instead of scrub-based triggers for smoother interaction. Profile to quantify impact.

**Blog Images Not Lazy-Loaded Initially:**
- Problem: BlogPreview maps posts and creates Image components; first 3 use loading="eager", but many images are below fold and still preload due to horizontal scroll layout.
- Files: `src/components/BlogPreview.jsx` (line 193)
- Cause: Horizontal scroll pattern hides images off-screen, but browser still fetches them
- Improvement path: Implement scroll-aware lazy loading with Intersection Observer, or rely on browser native lazy-loading with loading="lazy" for below-fold images.

## Fragile Areas

**BlogPreview Horizontal Scroll with Wheel Hijacking:**
- Files: `src/components/BlogPreview.jsx` (lines 35-68)
- Why fragile: Manually hijacks wheel events with preventDefault() and calculates boundary detection. Tolerance value (SCROLL_BOUNDARY_TOLERANCE = 2px) is magic number; may break on zoomed browsers or touch devices.
- Safe modification: Test boundary conditions across zoom levels (75%, 100%, 125%), add debug logging for scroll position, consider using CSS scroll-snap and native overflow behavior instead of wheel hijacking.
- Test coverage: No unit tests for scroll boundary logic; manual testing only.

**ExpertiseSection Stat Counter Animation with data- Attributes:**
- Files: `src/components/ExpertiseSection.jsx` (lines 149-169)
- Why fragile: Uses data-val, data-is-float, data-suffix HTML attributes as configuration for counter animation. If markup changes or attribute is missing, counter silently skips. Line 152 checks `data-animated` flag to prevent double-run, but this flag persists across component remounts.
- Safe modification: Move counter config to explicit data object prop, pass formatters as functions, reset `data-animated` flag on cleanup.
- Test coverage: No validation that all counters animate; only manual visual inspection.

**HeroImages Platform Detection with Inline Timeout:**
- Files: `src/components/HeroImages.jsx` (lines 148-171)
- Why fragile: Detects mobile via `window.innerWidth < 768`, but uses hard-coded 100ms timeout for mobile to setIsReady. Timeout is arbitrary and may not account for slow devices or async resource loading.
- Safe modification: Use Intersection Observer or resource load completion event instead of fixed timeout; query window.matchMedia for media query consistency.
- Test coverage: No responsive testing automation.

**ValidationSection Shutter Animation Depends on Ref Order:**
- Files: `src/components/ValidationSection.jsx` (lines 74-99)
- Why fragile: Initial check `if (!horizontalScrollRef.current || !shutterRef.current || !cardRef.current) { return; }` returns early, but setTimeout might run before refs are populated. Animations are queued without error boundaries.
- Safe modification: Use optional chaining consistently, add try-catch around animation setup, ensure refs are fully initialized before any GSAP calls.
- Test coverage: No unit tests for ref initialization order.

## Scaling Limits

**ISR Revalidate at 60 Seconds:**
- Current capacity: Vercel ISR regenerates blog page every 60 seconds (set in `src/app/blog/page.jsx` line 11). For high-traffic sites with frequent posts, this may cause stale content or regeneration storms.
- Limit: ~1,440 regenerations per day per route. If 10 routes + manual edits, can trigger Vercel's cost limits.
- Scaling path: Implement webhook-based on-demand revalidation from WordPress (when post is published), use fine-grained ISR with stale-while-revalidate headers, or move to fully dynamic blog with caching layer.

**WordPress API Pagination Implicit (No Page Param Passed):**
- Current capacity: getPosts() defaults to page 1, perPage 10. Home page requests 6 posts. Blog page requests all posts (default 10, no pagination UI).
- Limit: WordPress hosts limited to ~10-20 posts per request depending on plan. No infinite scroll or pagination implemented.
- Scaling path: Implement cursor-based pagination (pass offset) or keyset pagination (pass last_id), add pagination UI to blog list, implement infinite scroll for BlogPreview carousel.

## Dependencies at Risk

**GSAP + ScrollTrigger Heavy Dependency:**
- Risk: GSAP is ~50KB gzipped; ScrollTrigger adds complexity. Upgrade 3.13 → 4.x planned; API may break.
- Impact: Complex scroll-linked animations would need refactoring if GSAP is removed or major version is skipped.
- Migration plan: Gradually replace GSAP tweens with CSS Transitions for simple properties (opacity, transforms), use Framer Motion or React Spring for complex animations, keep GSAP only for ScrollTrigger-specific logic. Consider pure CSS scroll-driven animations (CSS Scroll Snap) as fallback.

**Three.js + React Three Fiber for HeroImages:**
- Risk: Three.js ~600KB, adds significant bundle size for single shader-based reveal effect. Maintenance burden for Three.js version compatibility.
- Impact: Desktop users on slower connections experience longer initial paint; mobile doesn't use Three.js (fallback to CSS background image), creating code path divergence.
- Migration plan: Replace Three.js shader with CSS mask-image and CSS filter effects, or use Wistia/Cloudinary image transform API. Eliminates 600KB overhead.

**Zustand State Management (Installed but Not Evident):**
- Risk: package.json lists zustand 4.5.7, but no grep matches in src code. Either unused dependency or store not exported/used correctly.
- Impact: Dead code weight (~3KB), maintenance confusion
- Migration plan: Audit for actual Zustand usage, remove if unused. If store is planned, implement centralized animation state store (replaces sessionStorage).

## Missing Critical Features

**No Error Boundary Component:**
- Problem: If any animation setup throws (e.g., GSAP plugin registration fails), entire page crashes. No fallback UI.
- Blocks: Graceful degradation on older browsers, recovery from animation library errors
- Recommendation: Wrap all GSAP-heavy sections in React Error Boundary, provide fallback render that skips animations.

**No Test Suite:**
- Problem: 43 source files, 0 test files. No unit, integration, or E2E tests detected.
- Blocks: Refactoring animation logic (risky), regression detection on upgrades, CI/CD confidence
- Recommendation: Set up Vitest + React Testing Library, add tests for: animation state transitions, ref initialization, sessionStorage logic, WordPress API mocking, responsive breakpoints.

**No Performance Monitoring:**
- Problem: No Lighthouse CI, Web Vitals collection, or real-user monitoring (RUM). Animation performance blind spot.
- Blocks: Data-driven optimization decisions, customer-facing performance SLA
- Recommendation: Add @vercel/speed-insights (already in package.json but not integrated), set up Sentry for error + performance monitoring, configure Lighthouse CI in CI/CD.

## Test Coverage Gaps

**Animation State Persistence Logic (sessionStorage):**
- What's not tested: Interaction between multiple animated sections on same page, order of animation completion, cross-tab sessionStorage sync
- Files: ValidationSection, ExpertiseSection, BlogPreview, HeroImages (all using sessionStorage pattern)
- Risk: Animation may play twice on page reload, or not at all on browser back navigation
- Priority: High (impacts user experience on every visit)

**WordPress API Resilience:**
- What's not tested: Timeout fallback logic (line 60-76 in wordpress.js), error message truncation, non-array response handling
- Files: `src/lib/wordpress.js`
- Risk: Silent failures, truncated error logs, 5xx errors not caught
- Priority: High (blog unavailability is visible to users)

**Responsive Image Scaling:**
- What's not tested: Image srcset/sizes at different viewport widths, lazy-loaded images in carousel
- Files: BlogPreview, blog/page.jsx, blog/[slug]/page.jsx
- Risk: Oversized images on mobile, broken images due to lazy-load timing
- Priority: Medium (affects mobile UX)

**Scroll Boundary Detection (Wheel Hijacking):**
- What's not tested: Scroll position at zoom levels, RTL layout, touch scroll simulation
- Files: `src/components/BlogPreview.jsx` (lines 47-49)
- Risk: Horizontal scroll breaks when browser is zoomed, or on tablets with touch
- Priority: Medium (affects mobile scroll experience)

---

*Concerns audit: 2026-03-21*

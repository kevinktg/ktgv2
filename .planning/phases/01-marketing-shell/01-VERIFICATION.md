---
phase: 01-marketing-shell
verified: 2026-04-02T00:00:00Z
status: human_needed
score: 3/4 roadmap success criteria closed in code; 1/4 + 01-02 manual tasks need browser
re_verification: false
human_verification:
  - test: Primary route walk — hydration / console
    expected: No React hydration mismatch warnings; no unexpected red errors on `/`, `/blog`, `/expertise`, `/validation`
    why_human: Requires Chrome DevTools; not observable from static analysis
  - test: PageTransition + Lenis + ScrollTrigger pin ordering after navigation
    expected: No stuck pinned sections after in-app nav; scroll consistent; no full reload needed
    why_human: Runtime layout/scroll interaction
  - test: Mobile viewport pass
    expected: Same as route walk at narrow width or real device
    why_human: Viewport-specific behavior
---

# Phase 1: Marketing shell & motion — Verification

**Phase goal (ROADMAP):** Visitors experience a consistent branded shell with reliable Lenis/GSAP motion and no hydration failures on primary marketing routes.

**Mode:** Initial verification (no prior `*-VERIFICATION.md`).

## Must-haves vs codebase

| # | Roadmap success criterion | Code evidence | Status |
|---|---------------------------|---------------|--------|
| 1 | Shared app layout (fonts, globals, shell patterns) | `src/app/layout.jsx` — Syne/Inter/Iosevka, `globals.css`, `ClientLayout`, `GeometricBackground`, `DockNav`, `PageTransition`, `CursorDot` | ✓ |
| 2 | Client shell wraps routes; **no hydration failures** on primary pages | `ClientLayout` + `ReactLenis` in `src/components/ClientLayout.jsx`; `suppressHydrationWarning` where used; Expertise `sessionStorage` gated in `useEffect` | Code present; **hydration/console not proven without browser** (01-02 tasks open) |
| 3 | GSAP: `useGSAP` + scope, ScrollTrigger registered, transform/opacity-first | `gsap.registerPlugin(ScrollTrigger)` in `src/libs/lenis.jsx` + `PhilosophySection.jsx`; all `useGSAP` usages in `src/components/*.jsx` include `scope:` (grep-verified) | ✓ |
| 4 | Lenis + ScrollTrigger synchronized (single driver) | `src/libs/lenis.jsx`: ticker bridge, `scrollerProxy(window)`, `ScrollTrigger.update` on Lenis scroll, cleanup | ✓ |

### Requirements (REQUIREMENTS.md)

| ID | Evidence | Automated |
|----|----------|-----------|
| MRKT-01 | Same as criterion 1 | ✓ |
| MRKT-02 | Same as criterion 2 | Partial — needs human QA |
| MOTN-01 | Same as criterion 3 | ✓ |
| MOTN-02 | Same as criterion 4 | ✓ |

### Plans 01-01 / 01-02

- **01-01:** Lenis ESM `ScrollTrigger`, scoped `useGSAP` on `SkipButton`, `dependencies: [hasPlayed]` on `ExpertiseSection` — **matches repo** (per `01-01-SUMMARY.md` + file reads).
- **01-02:** Reduced motion + Philosophy `SplitText`/`ScrollTrigger` — **implemented** (`usePrefersReducedMotion`, `PhilosophySection`, `globals.css` `@media (prefers-reduced-motion)`). **Still pending:** route walk, PageTransition/pin QA, Chrome + mobile pass (see `01-02-PLAN.md` checkboxes).

### Anti-patterns (spot grep)

- No blocker stubs found on critical paths; `ValidationSection.jsx` has no `console.*` (per `01-02-SUMMARY.md`).

## Overall

Automated/code review supports **MOTN-01**, **MOTN-02**, and **MRKT-01** structure. **MRKT-02** (no hydration issues) and **01-02** navigation/pin behavior **require human browser QA** before Phase 1 can be marked fully passed.

**Status: human_needed** — checklist above is from `01-02-SUMMARY.md`.

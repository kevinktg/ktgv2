---
phase: 01-marketing-shell
plan: 01-02
subsystem: marketing-ui
tags: [nextjs, shell, hydration, gsap, reduced-motion]

requires:
  - phase: 01-marketing-shell
    provides: ClientLayout, routes, Philosophy/Validation sections
provides:
  - Build verification record for shell QA plan
  - Human verification checklist for remaining manual tasks
affects: [MRKT-01, MRKT-02]

key-files:
  created:
    - .planning/phases/01-marketing-shell/01-02-SUMMARY.md
  modified: []

key-decisions:
  - "Automated verification: production build passes; browser QA deferred to Kevin (not run in agent environment)."

requirements-completed: [] # MRKT-01 / MRKT-02 remain partially manual until checklist below is done

duration: —
completed: 2026-04-02
---

# Phase 1 Plan 01-02: Shell, hydration, and motion QA — Summary

**Production build is green; reduced-motion and Philosophy SplitText work are recorded as done in-plan; route walk, PageTransition pin check, and optional Validation console audit remain for human verification.**

## Automated verification (this session)

| Check | Result |
|-------|--------|
| `pnpm run build` | **Passed** — Next.js 16.1.6 (Turbopack), compiled successfully, static generation completed for all routes including `/`, `/blog`, `/expertise`, `/validation`, `/hub/*`. |
| Browser / Chrome | **Not run** — agent cannot drive Chrome; see Human verification below. |

## Completed items (per 01-02-PLAN.md)

- **Reduced motion:** `prefers-reduced-motion` handling (`usePrefersReducedMotion`), Philosophy GSAP skipped when reduced; `globals.css` slows background animations under reduced motion — marked complete in plan.
- **Philosophy:** Safe `SplitText` (string-only), staggered opacity/y on `.split-char` with ScrollTrigger `once` (no Club plugin) — marked complete in plan.

## Optional: ValidationSection `console.warn` audit

- **Grep:** `src/components/ValidationSection.jsx` — **no `console.warn` and no `console.*` calls** in this file. Nothing to silence for production noise from direct logging in `ValidationSection`.

## Human verification required

Complete these when you have Chrome (and optionally one mobile viewport). Check boxes in `01-02-PLAN.md` as you finish.

### 1. Primary route walk — hydration / console errors

1. Run `pnpm dev` (or use deployed preview).
2. Open DevTools → **Console** (preserve log on navigation if available).
3. Visit in order: `/`, `/blog`, `/expertise`, `/validation`.
4. **Pass criteria:** No React hydration mismatch warnings; no unexpected red errors (ignore known third-party noise if any).

### 2. PageTransition + Lenis + ScrollTrigger — pin ordering

1. From `/`, navigate to another marketing route (e.g. `/blog`) via in-app links (DockNav or body links), then back.
2. Scroll pages that use ScrollTrigger pins (e.g. Validation / long sections).
3. **Pass criteria:** No “stuck” pinned sections after navigation; scroll feels consistent with Lenis; no need for a full page reload to fix layout.

### 3. Optional: ValidationSection runtime noise

- File-level audit: **no `console` usage** in `ValidationSection.jsx`. If you still see warnings while on `/`, note the **stack trace** — they may come from GSAP/ScrollTrigger or another component.

### 4. Manual pass (plan verification)

- Plan asks: **Chrome + one mobile viewport** — repeat route walk at a narrow width (DevTools device toolbar or real device).

## Deviations from plan

- **None for code.** This execution session produced documentation and build evidence only; manual QA items were not automated.

## Self-check: PASSED

- `01-02-SUMMARY.md` created at `.planning/phases/01-marketing-shell/01-02-SUMMARY.md`.
- `pnpm run build` exited 0 (2026-04-02).

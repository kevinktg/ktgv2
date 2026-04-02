---
phase: 01-marketing-shell
plan: 01
subsystem: ui
tags: [gsap, lenis, scrolltrigger, usegsap, nextjs]

requires:
  - phase: —
    provides: —
provides:
  - Verified Lenis + ScrollTrigger bridge uses ESM `ScrollTrigger` and `gsap.registerPlugin`
  - Verified SkipButton `useGSAP` scoped correctly; ExpertiseSection session gate + `dependencies: [hasPlayed]`
affects: [01-02 marketing QA, homepage motion]

tech-stack:
  added: []
  patterns:
    - "Lenis bridge: ticker sync + scrollerProxy(window) + ScrollTrigger.update on scroll"
    - "Session-gated timelines: `dependencies: [hasPlayed]` + `sessionStorage` in ScrollTrigger callbacks"

key-files:
  created: []
  modified: []

key-decisions:
  - "Expertise persistence uses ScrollTrigger `onLeave` (not tween `onComplete`) — valid lifecycle for marking section complete"

patterns-established: []

requirements-completed: [MOTN-01, MOTN-02]

duration: —
completed: 2026-04-02
---

# Phase 01 Plan 01: GSAP + Lenis correctness — Verification Summary

**Post-merge verification: ESM ScrollTrigger in the Lenis bridge, scoped `useGSAP` on SkipButton, and `hasPlayed` + sessionStorage gating on ExpertiseSection; production build passes.**

## Performance

- **Duration:** Verification-only (no implementation tasks in this pass)
- **Tasks (plan):** 5 (all marked complete upstream)
- **Files reviewed:** 3 (`lenis.jsx`, `SkipButton.jsx`, `ExpertiseSection.jsx`)

## Verification — Plan Intent vs Code

### `src/libs/lenis.jsx`

- Static `import { ScrollTrigger } from "gsap/ScrollTrigger"` and `gsap.registerPlugin(ScrollTrigger)` — matches plan (no `require`).
- Ticker bridge, `scrollerProxy`, cleanup on unmount — aligned with GSAP 3 + Lenis expectations.

### `src/components/SkipButton.jsx`

- `useGSAP(..., { scope: buttonRef })` — matches plan (replaces invalid empty dependency array pattern).

### `src/components/ExpertiseSection.jsx`

- `useGSAP(..., { scope: containerRef, dependencies: [hasPlayed] })` — matches plan for session/`hasPlayed` gates.
- `sessionStorage.setItem('expertise-revealed', 'true')` is on ScrollTrigger **`onLeave`** (not invalid `onComplete` on the scrollTrigger config object). Intent satisfied: persist after the user completes the pinned scroll experience.

### `BlogPreview.jsx` (plan: single horizontal wheel handler)

- **Not present** in the repository (component removed; homepage in `src/app/page.jsx` has no blog strip). Duplicate wheel-handler spot-check is **N/A** for the current tree. Blog content lives on `/blog` routes.

## Build

- **Command:** `pnpm run build` (repo root)
- **Result:** **PASS** (exit code 0). Next.js 16.1.6 compiled successfully.
- **Note:** WordPress API returned **504** for one slug during static generation; build still completed. External CMS availability is unrelated to 01-01 motion correctness.

## Task Commits

- No new task commits in this verification pass; plan work was merged previously.

## Deviations from Plan

None for verified files. BlogPreview file absent — document as scope drift vs original plan file paths, not a regression.

## Next Phase Readiness

- Safe to proceed with `01-02` marketing QA / shell checks; browser spot-check of hero → expertise → validation still recommended per plan notes.

## Self-Check: PASSED

- [x] `01-01-SUMMARY.md` exists at `.planning/phases/01-marketing-shell/01-01-SUMMARY.md`
- [x] `pnpm run build` succeeded in this session

---
*Phase: 01-marketing-shell*
*Completed: 2026-04-02*

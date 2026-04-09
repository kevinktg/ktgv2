---
phase: 01-marketing-shell
plan: 03
subsystem: ui
tags: [gsap, scrolltrigger, lenis, transitions, stacking]

requires:
  - phase: 01-01
    provides: Lenis + ScrollTrigger bridge
provides:
  - ScrollTrigger `end: "+=72vh"` on HeroTransition + ExpertiseTransition (scrub span tied to viewport-relative scroll)
  - `z-local-bridge` (46) token + ExpertiseTransition uses it above pinned section overlays (45)
  - HeroTransition wipe layer `bg-white` + slightly taller band; documented stacking comments

affects: [homepage /, 01-02 manual QA]

tech-stack:
  added: [z-local-bridge theme token]
  patterns:
    - "Bridge transitions: z-local-bridge between z-local-high and z-dock"
    - "Scrub range: +=vh after start instead of only end: bottom top"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/HeroTransition.jsx
    - src/components/ExpertiseTransition.jsx
    - .planning/phases/01-marketing-shell/01-UI-SPEC-stacking.md

key-decisions:
  - "72vh scroll span for timeline (example distance; tune if QA says so)"
  - "ExpertiseTransition above pin via z-local-bridge, not dock-level z"

requirements-completed: [MOTN-01, MOTN-02 partial — MRKT-02 needs 01-02 route QA]

duration: —
completed: 2026-04-03
---

# Phase 01 Plan 03 — Transition visibility — Summary

**Executed (2026-04-03):** Extended scrub range (`end: "+=72vh"`), added `z-local-bridge` for ExpertiseTransition vs pin, HeroTransition white wipe + slightly taller box, UI-SPEC table row. **`pnpm run build` passes.**

## Human verification (required)

1. `pnpm dev` → `http://localhost:3000/?replay=1`
2. Slow-scroll: hero → HeroTransition → expertise → ExpertiseTransition → validation.
3. Confirm both wipes read as **motion**, ExpertiseTransition not hidden under pin.

Record results in `01-UAT.md`.

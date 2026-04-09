# Phase 99: Cursor — one task (transition QA) — Context

**Gathered:** 2026-04-03  
**Status:** Ready for planning / execution

<domain>

## Phase boundary

Close the loop on **homepage transition bands** only:

- `src/components/HeroTransition.jsx` — Hero → Expertise wipe + grid; ScrollTrigger scrubbed over full `h-dvh` band.
- `src/components/ExpertiseTransition.jsx` — Expertise → Validation bridge; `z-local-bridge` vs pinned `ExpertiseSection`.

Out of scope: Philosophy, Validation horizontal scroll, hub chat, blog — unless a fix here forces a shared change.

</domain>

<decisions>

## Implementation decisions

- Lenis ↔ GSAP remains **single driver** via `src/libs/lenis.jsx` (`scrollerProxy`, `lenis:scroll-ready`).
- ScrollTrigger for both transitions: **`start: "top bottom"`**, **`end: "bottom top"`** so scroll distance matches full band passage (no short `+=` dead zone).
- Verification gate: **`pnpm run lint`**, **`pnpm run build`**, then **manual scroll UAT** on `/` (optional `NEXT_PUBLIC_KTG_DEBUG_SCROLL=1` for markers).

</decisions>

<specifics>

## Specific ideas

- IDs: `#hero-transition`, `#expertise-transition` for anchors and QA.
- Replay query: `?replay=1` on `/` clears session keys for hero/expertise transition (see `HeroTransition`).

</specifics>

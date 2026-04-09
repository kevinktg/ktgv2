# Phase 1: Marketing shell — Context (chat-derived)

**Gathered:** 2026-04-02  
**Status:** Ready for planning  
**Source:** Session transcript — homepage motion / stacking / chrome issues

## Phase boundary

Deliver **verifiable** fixes and QA for: (1) hero and expertise **transition bands** reading as wipes (not flat black + grid dots), (2) **stacking** among the first homepage bands vs **ExpertiseSection** pin, (3) **Validation** pinned cards with stable layout, (4) **DockNav** usable on all primary routes including `/blog`. Scope stays **Phase 1** — no new routes, no hub changes, no schema changes.

## Implementation decisions (locked from discussion)

- **Transitions:** Outer shell stays **transparent**; wipe is **white** `clip-path` on `z-local-mid`; grid on `z-local-low`. Do not reintroduce inner gradients that read as a solid black bar.
- **Lenis + ST:** Single scroller proxy in `src/libs/lenis.jsx`; after layout changes call `ScrollTrigger.refresh()` (existing timeout pattern is acceptable; avoid duplicate Lenis instances).
- **Dock:** Global dock **z-dock (52)** above section overlays; nav chrome stays **`opacity-100` / `pointer-events-auto`** — no hover-only visibility for primary navigation.
- **Validation:** Use **shadcn `Card`** with **fixed vertical footprint** for stacked card swap (pin timeline preserved); accordion rail scrolls inside a **max-height** region so the section does not blow viewport height unpredictably.
- **Wipe “completed” while band visible:** Treat as **ScrollTrigger scrub range** issue: timeline progress must map to scroll so the wipe is not fully **inset(100%…)** for the entire time the band is on screen — adjust **`start` / `end`**, **`scrub`**, or trigger element height — not arbitrary `vh` churn alone.

## Canonical references

**Downstream agents MUST read these before implementing.**

- `.planning/phases/01-marketing-shell/01-UI-SPEC-stacking.md` — z ladder, isolate wrapper, dock order  
- `.planning/phases/01-marketing-shell/01-01-PLAN.md` — completed GSAP/Lenis baseline  
- `.planning/phases/01-marketing-shell/01-02-PLAN.md` — shell QA scope  
- `CLAUDE.md` — Lenis path, `useGSAP`, font tokens  
- `AGENTS.md` — locked stack; do not add dependencies; avoid unrelated refactors  

## Specific ideas (from session)

- **ExpertiseSection** uses **ScrollTrigger `pin: true`** — when the pinned block overlaps **ExpertiseTransition**, verify **paint order** (`z-0` section vs `z-local-high` transition) matches the UI-SPEC intent.  
- **`?replay=1`** on `/` clears intro markers (see `HeroTransition`) — use when re-testing wipes.  

## Deferred

- Hub chat, blog pipeline beyond existing routes, Lighthouse 90+ (Phase 3), philosophy typography todo (separate pending todo file).

---

*Phase: 01-marketing-shell · Context: chat session 2026-04-02*

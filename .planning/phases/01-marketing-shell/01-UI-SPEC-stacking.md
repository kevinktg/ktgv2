# UI-SPEC — Global stacking (Phase 1 / marketing shell)

**Status:** Implemented in `src/` (2026-04-02) — z ladder + homepage `isolate` wrapper; `pnpm build` passes.

## Contract

### Z-index ladder (fixed + in-flow)

| Layer | z-index | Notes |
|-------|---------|--------|
| Geometric background | 0 | Behind content |
| Homepage early block wrapper | `relative z-0 isolate` | Scopes internal stacking vs `DockNav` |
| In-section overlays (shutters, etc.) | ≤ 45 | Must not tie global chrome |
| Section “bridge” transitions (ExpertiseTransition) | **46** (`z-local-bridge`) | Above pinned section UI (45), below dock (52) |
| Skip Intro (hero) | 51 | Below dock; above section UI |
| DockNav | 52 | Always above pinned-section overlays |
| GlobalCursor | 55 | |
| CursorDot | 60 | Last in layout tree |
| Dialog | 100 | |
| Tooltip / select / popover | 110 | |

### Isolation

- Wrap **Hero → HeroTransition → Expertise → ExpertiseTransition** in one `relative z-0 isolate` container so shutter/content z-fights stay inside one stacking context.

### Lenis + ScrollTrigger

- Single driver: `ScrollTrigger.scrollerProxy(window, …)` in `src/libs/lenis.jsx`.
- After DOM/layout changes: `ScrollTrigger.refresh()` when appropriate (existing patterns in sections).

### Verification

- [ ] Scroll `/`: dock visible above expertise/validation pin sequences.
- [ ] Skip control does not sit above `CursorDot` / global cursor.
- [ ] `/blog`, `/hub/chat`, `/expertise` routes: chrome order unchanged.

## Implementation checklist (source files)

1. `src/components/ExpertiseSection.jsx` — shutters `z-[45]`
2. `src/components/ValidationSection.jsx` — shutters `z-[45]`
3. `src/components/DockNav.jsx` — `z-[52]`
4. `src/components/SkipButton.jsx` — `z-[51]` (replace `z-[90]`)
5. `src/app/globals.css` — comment matches ladder
6. `src/app/page.jsx` — isolate wrapper as above

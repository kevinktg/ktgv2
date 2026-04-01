---
created: 2026-04-01T09:24:07.579Z
title: Philosophy section — safe GSAP scroll typography
area: ui
files:
  - src/components/PhilosophySection.jsx
  - src/components/SplitText.jsx
  - src/components/CursorDot.jsx
---

## Problem

Scroll-driven typography (Codrops/Tympanus-style) was reviewed from `.planning/text-animations/`; full 14-effect port is out of scope. The only on-brand surface for richer motion is **Philosophy** (genuine section). Current implementation uses `SplitText` + `useGSAP` with simple opacity/`y` stagger. Enhancement would add **one or two restrained** GSAP patterns (e.g. subtle `rotationX` reveal with `transformOrigin`, or line stagger) while:

- Preserving **`prefers-reduced-motion`** (existing hook).
- Avoiding **z-index / stacking** regressions vs `GeometricBackground`, **`CursorDot`** (must stay top), **`DockNav`**.
- Not adding **Splitting.js** or other deps; keep **manual** character spans.

## Solution

TBD at implementation time. Direction: `gsap.registerPlugin(ScrollTrigger)` scoped in section; `once: true` ScrollTriggers; `ScrollTrigger.refresh()` after layout (pattern already partially present); transform/opacity-first; optional `transformPerspective` on heading wrapper only. Reference conversation: safe subset > Codrops full set; blur/scrub/pin lower priority.

---
created: 2026-03-21T06:42:08.157Z
title: Verify stacking cards ScrollTrigger fix
area: ui
files:
  - src/components/ValidationSection.jsx
---

## Problem

ValidationSection converted from horizontal scroll strip to stacking cards (Graphite.com style). The rebuild-on-resize architecture (ResizeObserver + resize listener calling setupStackingCards repeatedly) caused nested pin-spacers in the DOM, breaking the scroll animation entirely.

Root cause: each rebuild wrapped an already-wrapped element in another pin-spacer div. ScrollTrigger.kill() removes the trigger but DOM unwrap + immediate re-wrap creates nesting.

Fix applied: replaced rebuild-on-resize with build-once pattern (matching ExpertiseSection and ScrollTransition). Single 300ms setTimeout, no ResizeObserver, no resize listener. invalidateOnRefresh + functional end() handles resize natively.

## Solution

1. Hard refresh (Ctrl+Shift+R) to clear stale HMR pin-spacer state
2. Scroll to ValidationSection and verify:
   - Section pins when scrolled to
   - Cards 2-5 slide in from right one-by-one
   - Snap stops at card boundaries
   - Only 1 pin-spacer for validation (no nesting)
   - Shutter + text reveal animations still work
3. Remove `markers: true` after verification passes
4. Commit the working implementation

---
created: 2026-04-01T12:00:00.000Z
title: Document hub chat single vs dual playground mode
area: ui
files:
  - src/app/hub/chat/page.jsx
---

## Problem

Hub chat should match common **model playground** behaviour: user explicitly chooses **single** or **dual** mode. Auditors flagged a second `useChat` / `isDualMode` as “dead” only because the UI did not yet reflect that choice—not because dual mode is forbidden. Without a written decision + UX contract, implementers may remove working hooks or ship a half-visible second stream.

## Solution

- Add a short **product/UX note** (e.g. `.planning` decision list, `STATE.md` Decisions, or Phase 7 / hub UI-SPEC): single = one column + one `useChat`; dual = two streams (layout: side-by-side desktop; tabs or stack on narrow screens), with explicit rules for **one send → both models** vs **independent inputs** (pick one for v1).
- Optional: run `$gsd:ui-phase` → `NN-UI-SPEC.md` once single vs dual and mobile behaviour are locked.
- Implementation follow-up: wire JSX to `isDualMode` / second chat when dual is on; keep single path minimal when off.

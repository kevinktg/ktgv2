---
status: testing
phase: 99-cursor-one-task
source:
  - "99-01-PLAN.md (execute plan; no 99-01-SUMMARY.md yet)"
started: "2026-04-03T12:00:00.000Z"
updated: "2026-04-03T18:30:00.000Z"
---

# Phase 99 — Transition QA (Hero + Expertise)

## Preflight (automated gate — Task 1)

| Field | Value |
|--------|--------|
| Date | 2026-04-03 |
| Git (short) | `dbe5b4c` |
| Node | v25.9.0 |
| pnpm | 10.28.0 |
| Automated | `pnpm run lint` — exit 0; `pnpm run build` — exit 0 |

**Correlation:** Human UAT below should be run against this commit (or later on the same branch if additional fixes land).

---

## Current Test

number: 1
name: Console health on full scroll path
expected: |
  With `pnpm dev`, open `http://localhost:3000/`, DevTools → Console. Scroll from Hero through HeroTransition, pinned Expertise, ExpertiseTransition, into the start of Validation. You should see no uncaught errors clearly tied to GSAP, ScrollTrigger, Lenis, or the transition components (ignore unrelated third-party noise).
awaiting: user response

---

## Tests

### 1. Console health on full scroll path
expected: No attributable GSAP / ScrollTrigger / Lenis / transition-component errors on the scroll path described in Current Test.
result: pending

### 2. HeroTransition (`#hero-transition`) — full-band scrub
expected: Slow scroll through the `h-dvh` band: clip/grid animation should track scroll for the whole band — no long segment where scroll moves but the wipe/grid feels “finished” early (no dead zone).
result: pending
automated_evidence_2026-04-03: |
  **Hard gate (this session):** `pnpm run lint` → exit 0; `pnpm run build` → exit 0 (Next 16.1.6 Turbopack).
  **Code contract:** `src/components/HeroTransition.jsx` — ScrollTrigger `start: "top bottom"`, `end: "bottom top"`, `scrub: 0.45`, `invalidateOnRefresh: true`; `#hero-transition`; `min-h-dvh h-dvh` section box.
  **Runtime shell (dev):** `pnpm dev` + `GET http://localhost:3000/` response HTML contains `id="hero-transition"` with expected wrapper classes.
  **Still manual (per verification-hard-gate):** scroll-linked scrub “feel”, dead-zone absence, console while scrolling — not proven by lint/build/curl.

### 3. ExpertiseTransition (`#expertise-transition`) — scrub + stacking
expected: Same full-band scrub feel as Test 2. Where bridge overlaps pinned expertise, bridge reads above shutters (`z-local-bridge` vs `z-local-high`); DockNav / skip / cursor layers still read per `UI-STACKING-CONTRACT` (transition must not cover dock).
result: pending

### 4. (Optional) Debug bands
expected: With `NEXT_PUBLIC_KTG_DEBUG_SCROLL=1` in `.env.local` and dev server restart, colored band tints / markers help align triggers with `#hero-transition` / `#expertise-transition` without new console errors.
result: pending

### 5. Replay query
expected: Load `/?replay=1` once, then scroll Hero → HeroTransition again; no uncaught errors; transitions still behave.
result: pending

---

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

---

## Gaps

[none yet]

---

## Evidence classes (99-02 — verification-hard-gate alignment)

Per `.cursor/rules/verification-hard-gate.mdc`, label claims honestly:

| Class | What it proves | Phase 99 tests |
|-------|----------------|----------------|
| **A** | `pnpm lint` / `pnpm build` — compile + static rules | Preflight; safe to automate in-session |
| **B** | DOM/SSR shell (e.g. `curl` / View Source: `#hero-transition` present) | Partial signal only; no ScrollTrigger |
| **C** | Scroll scrub, dead zone, z-order vs dock, console while scrolling | **Required** for Test 2–3 **PASS** — human or browser automation with scroll |

Lint/build green **does not** imply **C**. Do not mark Test 2–3 `pass` without **C** evidence.

---

## Legacy plan sections (99-01)

### Task 2 — Manual scroll UAT (human)

**Status:** in progress via verify-work tests above

**Environment:** `pnpm dev` → `http://localhost:3000/`

Full checklist: `.planning/phases/99-cursor-one-task/99-01-PLAN.md` § Task 2.

**Tester notes:** _(browser, OS, optional debug / replay)_

### Results (Task 3)

**Outcome:** _not recorded_

_Append PASS/FAIL and notes after Tests 1–5._

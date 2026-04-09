# Phase 01 — User acceptance (transitions + shell)

**Phase:** 1 — Marketing shell & motion  
**Updated:** 2026-04-03  
**Build:** `pnpm run build` — **PASS** (agent run)

## Automated / build

| Check | Result |
|-------|--------|
| `pnpm run build` | Pass |

## Manual — homepage transitions

| # | Step | Pass / Fail | Notes |
|---|------|-------------|-------|
| 1 | Open `/` with `?replay=1` | | |
| 2 | Hero → HeroTransition: white wipe + grid **visibly animates** while scrolling | | |
| 3 | Expertise pin active: ExpertiseTransition band **readable**, not fully hidden under expertise | | |
| 4 | ExpertiseTransition → Validation: handoff acceptable | | |
| 5 | Dock stays usable (no nav trapped) | | |

**Tester:** _  
**Date:** _

## Issues found → debug

If any **Fail**: open `$gsd-debug` with repro, or append gap to `01-03-PLAN.md` and re-execute targeted tasks.

## Sign-off

- [ ] UAT complete  
- [ ] Ready for PR / merge

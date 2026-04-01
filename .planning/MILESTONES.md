# Milestones — ktgv2

## Shipped / closed

| Version | Name | Notes |
|---------|------|--------|
| (pre-GSD) | Baseline site | Marketing shell, blog, hub snippets, GSAP/Lenis — in production narrative |
| 2026-03 → 04 | Hub integration branch | `/hub/chat` + `/api/hub/chat`; ulti-chat reference move; planning + build fixes |

## Current milestone

**v1.1 — Hub production evidence, polish, merge**

Started: 2026-04-01 (brownfield `$gsd-new-milestone`; no `MILESTONE-CONTEXT.md`).

**Assumption (verify in app, not in this repo):** Provider secrets exist in Vercel; chat responds in preview/production. **UI is not “all finished”** while Phase 7 items in `STATE.md` remain open or explicitly deferred.

## Future (backlog)

- Single roadmap on `main` (marketing phases + hub as Phase 4+ per `ROADMAP.md`)
- Optional v1.2: marketing Phase 2–3 execution, Lighthouse, CI parity

### Draft next milestone (confirm after v1.1)

**v1.2 — Hub playground parity (single/dual)** — Document + ship explicit **single/dual** toggle; wire second `useChat` and layout when dual; mobile behaviour (tabs/stack). See todo `2026-04-01-document-hub-chat-single-vs-dual-playground-mode.md`. **Do not switch `Current milestone` in PROJECT.md until v1.1 exit criteria are decided.**

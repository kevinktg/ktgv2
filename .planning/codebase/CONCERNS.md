# Codebase Concerns

> **2026-04 status:** `src/app/ulti-chat/` **removed** from the repo’s App Router. Production chat is **`src/app/hub/chat/page.jsx`** + **`src/app/api/hub/chat/route.js`**. Remaining “nested ulti-chat” notes in older maps are **historical**; risk surface for that pattern is **`_reference/ulti-chat/`** (local copy only, gitignored if present), not deployed routes.

**Last structural review:** 2026-04-01  
**Supersedes:** 2026-03-23 audit (written when `src/app/ulti-chat/` was a nested Next app)

## Current status

- **Hub chat (production paths):** `src/app/hub/chat/page.jsx` (UI), `src/app/api/hub/chat/route.js` (Vercel AI SDK, server-side). No `GoogleGenAI` / `NEXT_PUBLIC_GEMINI_*` usage under `src/` at last check — keep it that way.
- **Legacy applet:** The old AI Studio nesting lived at `src/app/ulti-chat/`; it was **removed from the app router** and parked under `_reference/ulti-chat/` (gitignored) for local reference only. It must not ship as part of the root Next build.
- **Docs:** Older files under `.planning/codebase/` may still mention `ulti-chat` paths; **`src/app/**/*.jsx` and API routes are the source of truth.**

## Active risks / follow-ups

| Area | Risk | Notes |
|------|------|--------|
| Hub UI | Large monolithic `page.jsx` | Decomposition deferred (STATE.md Phase 3); same maintainability cost as pre-integration. |
| Hub ops | Env keys + live verification | Phase 6: `.env.local` / Vercel secrets for providers under test. |
| WordPress | Timeouts, pagination, HTML trust | `REQUEST_TIMEOUT` in `wordpress.js`; sitemap scale per PROJECT.md. |
| Tests | None | No `jest`/`vitest` — regressions caught manually. |
| Production | Rate limits / abuse | Public chat endpoints may need throttling before wide release. |
| Lockfiles | `pnpm-lock.yaml` + `package-lock.json` both present | Align on one install tool for CI/local to avoid drift. |

## Historical note

The long 2026-03-23 write-up in version control described nested Next conflicts, client `NEXT_PUBLIC_GEMINI`, and dual `next` versions. **Those issues targeted the old nested tree.** Integration work merged hub chat into the main app (see branch / commit history, e.g. `feat: integrate ulti-chat…`). Do not re-open nested-app build nightmares without confirming `_reference/` or old paths actually exist in the working tree.

---

*Concerns audit refreshed: 2026-04-01*

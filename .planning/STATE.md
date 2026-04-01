# Project State

**Scope (source of truth):** Runtime behaviour: `src/app/**` and `src/app/api/**`. Hub narrative: this file + `.planning/ROADMAP.md`. Legacy AI Studio copy: `_reference/ulti-chat/` (gitignored), **moved** from `src/app/ulti-chat/` during integration — not an ad-hoc delete.

**Planning scope (three lanes — do not conflate):**

1. **Marketing / public site** — Homepage, `/blog`, `/expertise`, `/validation`, shell + motion (GSD phases **01-marketing-shell**, Lighthouse, WordPress reliability). Success = pages render, blog pulls CMS, QA from `01-02-PLAN.md` closed or deferred with a note.
2. **Hub chat (feature work)** — **`/hub/chat`** UI, **`/api/hub/chat`** (and related **`/api/hub/*`**) on branch `feature/ulti-chat-integration` until merge. Success = Phase 6 smoke recorded, Phase 7 scoped/deferred, then merge to `main`. See hub table below.
3. **Post-merge default** — One canonical tree on **`main`**: marketing plus hub routes in the **same** Next app (no `src/app/ulti-chat/`). Planning folds hub into the single **ROADMAP** (e.g. hub as phases 4+ per `.planning/ROADMAP.md`). **`_reference/ulti-chat/`** remains optional local-only reference, not production.

**Roadmap evolution (2026-04-01):** GSD roadmapper: keep **marketing 1–3** and **hub branch** as two visible tracks until merge; after `main` merge, fold hub into **Phases 4+**. See `.planning/ROADMAP.md` → Planning discipline + Roadmap evolution.

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-01)

**Core value:** Visitors reliably get a fast, credible brand experience and can read blog content sourced from WordPress without the marketing site depending on WordPress for page shells or routing.

**Current focus:** **Milestone v1.1** (see `.planning/MILESTONES.md` + `PROJECT.md`) — prove hub on **Vercel** (secrets in dashboard — not verifiable from repo alone), close Phase 6 with **written smoke evidence**, then Phase 7 polish or defer, then merge.

## Current Position

**Milestone:** v1.1 — Hub production evidence, polish, merge  
**Branch:** `feature/ulti-chat-integration` (off main @ `9b46dde`)  
**Hub track:** Phase 6 of 7 — **Verification** (local + **Vercel preview/prod**; user reports secrets configured on Vercel — **record pass/fail in progress note or checklist**)  
**Status:** `npm run build` passes (2026-04-01); `/hub/chat` **useChat** wiring fixed (`handleSubmit` / `input` / `appendA`). **End-to-end chat not verified in this session.**  
**Last activity:** 2026-04-01 — `$gsd-new-milestone` → v1.1; `MILESTONES.md` created

**Progress — hub table:** [████████░░] Phase 6 closes when smoke checklist is done; Phase 7 = polish backlog (UI **not** “all finished” until you say those items are done or waived)

## Roadmap Phase Status

| Phase | Status |
|-------|--------|
| 1. Preparation (branch, deps) | ✅ Complete |
| 2. Security + API route (9 providers, 21 models) | ✅ Complete |
| 3. Component decomposition | ⏸️ Deferred (monolith accepted for now) |
| 4. shadcn/ui conversion | ✅ Complete |
| 5. Route integration (`/hub/chat`) | ✅ Complete |
| 6. Verification (live testing) | 🔄 In Progress — run smoke on Vercel + local; secrets **reported** on Vercel (confirm in UI) |
| 7. Polish (dots, Iosevka, skills, presets) | ⏸️ Pending |

## Performance Metrics

**Velocity:** Not tracked yet.

**By phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |

*Updated after each plan completion*

## Accumulated Context

### Decisions

- **Hub chat layout:** User-selectable **single vs dual** mode (playground-style), not “dual banned.” Dual = two visible streams when enabled; single = one `useChat` path in the UI. Document input rule (one send → both vs separate) in UI-SPEC or requirements before shipping.
- AI SDK: `@ai-sdk/google` (Vercel AI SDK) chosen over raw `@google/genai` — unified 21-model interface
- Model selector: global (not per-persona) — Kevin's explicit decision
- Component structure: 745-line monolith `page.jsx` — decomposition deferred until working
- All 4 AI SDK v6 breaking bugs fixed in `route.js` (convertToModelMessages, stepCountIs, toUIMessageStreamResponse, googleSearch tool)
- `@ai-sdk/mcp` not yet installed — real MCP connections deferred (Vercel HTTP transport decision pending)

### Pending Todos

5+ todos in `.planning/todos/pending/` include:
- `2026-04-01-philosophy-section-safe-gsap-scroll-typography.md` — optional Philosophy-only GSAP scroll type motion; z-index / reduced-motion safe
- `2026-04-01-document-hub-chat-single-vs-dual-playground-mode.md` — document playground-style single/dual mode + UX contract (wire second `useChat` when dual)
- `2026-04-01-planning-md-only-and-doc-backlog.md` — markdown-only alignment, ulti-chat narrative, AGENTS/PROJECT/STATE follow-ups
- Invoke skill before executing (general)
- Verify stacking cards ScrollTrigger fix (ui)

Hub chat todos (from progress.md):
- Add API keys to `.env.local` (GOOGLE_GENERATIVE_AI_API_KEY, ANTHROPIC_API_KEY)
- Run live test: chat flow, personas, model switching, web search, skills
- Red/green status dots in input area
- Iosevka font (self-host via next/font/local)
- KB decision: quick inject (~50k chars) vs RAG (pgvector)
- Presets: persona + model + injects + skills + MCPs → localStorage

### Kevin's Open Decisions

1. **KB approach**: quick inject (full text ~50k chars into system prompt) vs proper RAG (pgvector)
2. **Presets feature**: specced, not built — save/load persona+model+injects+skills+MCPs to localStorage
3. **MCP real connections**: requires `@ai-sdk/mcp` + decision on which servers have HTTP endpoints

### External audit action items (2026-04-01)

**Full table:** `.planning/v1.1-MILESTONE-AUDIT.md` (Nyquist-style + **gsd-ui-auditor** six-pillar + shadcn).

**Nyquist (condensed):** Record Phase 6 Vercel smoke; reconcile **REQUIREMENTS.md** checkboxes; 01-02 marketing QA; Zod/install reproducibility note; honest MCP stub vs real wiring.

**UI audit (condensed):** Tokenize cyan accent; **aria** on switches / inject controls; **reduced-motion**; **AlertDialog** for destructive deletes; wire **single/dual** playground mode to real UI (or single-only until then); prefer shadcn **Input/Textarea** in modals.

### Blockers/Concerns

- **Phase 6 evidence:** If keys exist only on Vercel, validate on **preview/production URLs**; local `.env.local` optional via `vercel env pull .env.local`.
- **Zod (re-verified 2026-04-01):** Root **`package.json`** declares **`zod@^4.3.6`**. `pnpm` installs **`zod@4.3.6`** for **AI SDK / hub** paths; **some** other packages (e.g. Next internals, drizzle-kit, puppeteer) still pull **`zod@3.25.76`** in parallel — `npm ls zod` may show peer “invalid” noise, but **`npm run build`** succeeds. **Not a Phase 6 blocker** unless runtime `tool()` / schema errors appear; align lockfile only in a dedicated deps task.
- Google search grounding incompatible with custom tools (Google API constraint) — already handled in route.js with conditional logic.

## Session Continuity

**Last session:** 2026-04-01 — planning pass (roadmapper, plan-checker); hub remains Phase 6 (live verify)
**Stopped at:** Hub Phase 6 — API keys + smoke checklist; marketing Phase 1 plan **01-02** still has open QA tasks
**Resume file:** None
**Context source:** `.planning/ROADMAP.md` Progress + Hub table; `01-02-PLAN.md` for shell/motion QA

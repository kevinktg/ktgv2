# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-03-21)

**Core value:** Visitors reliably get a fast, credible brand experience and can read blog content sourced from WordPress without the marketing site depending on WordPress for page shells or routing.

**Current focus:** Feature branch `feature/ulti-chat-integration` — hub chat at `/hub/chat` is built and passing build. Blocked on API keys for live testing (Phase 6 verification).

## Current Position

**Branch:** `feature/ulti-chat-integration` (off main @ `9b46dde`)
**Phase:** Hub Chat — Phase 6 of 7 (Verification — IN PROGRESS)
**Status:** Build passes. Blocked on `.env.local` API keys to test live.
**Last activity:** 2026-03-24 — context restored from peers; planning files updated

**Progress:** [████████░░] 75% (Phases 1–5 complete, Phase 6 in progress, Phase 7 pending)

## Roadmap Phase Status

| Phase | Status |
|-------|--------|
| 1. Preparation (branch, deps) | ✅ Complete |
| 2. Security + API route (9 providers, 21 models) | ✅ Complete |
| 3. Component decomposition | ⏸️ Deferred (monolith accepted for now) |
| 4. shadcn/ui conversion | ✅ Complete |
| 5. Route integration (`/hub/chat`) | ✅ Complete |
| 6. Verification (live testing) | 🔄 In Progress — needs API keys |
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

- AI SDK: `@ai-sdk/google` (Vercel AI SDK) chosen over raw `@google/genai` — unified 21-model interface
- Model selector: global (not per-persona) — Kevin's explicit decision
- Component structure: 745-line monolith `page.jsx` — decomposition deferred until working
- All 4 AI SDK v6 breaking bugs fixed in `route.js` (convertToModelMessages, stepCountIs, toUIMessageStreamResponse, googleSearch tool)
- `@ai-sdk/mcp` not yet installed — real MCP connections deferred (Vercel HTTP transport decision pending)

### Pending Todos

2 original todos in `.planning/todos/pending/`:
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

### Blockers/Concerns

- **Live testing blocked**: no API keys in `.env.local`. Run `vercel env pull .env.local` to pull from dashboard.
- Zod version mismatch: `package.json` says `^4.3.6` but lockfile has `3.25.76`. Do NOT run `npm install` until resolved — could break tool() definitions. Pin to `3.25.76`.
- Google search grounding incompatible with custom tools (Google API constraint) — already handled in route.js with conditional logic.

## Session Continuity

**Last session:** 2026-03-23 — built hub chat (Phases 1–5), all SDK bugs fixed, build passing
**Stopped at:** Ready for live testing — waiting on API keys
**Resume file:** None
**Context source:** Peer instances `dhs1dgze` + `pv76qdyn` (no mem0 saved from session)

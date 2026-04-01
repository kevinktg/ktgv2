# Progress Log - Ulti-Chat Integration

> **2026-04:** Production chat is **`/hub/chat`** + **`/api/hub/chat`**. Entries below from **2026-03-23** describe work **before** the nested app was moved to **`_reference/ulti-chat/`**.

## Session: 2026-03-23

### 22:00 - Session Start
- Kevin showed ulti-chat: AI Studio app (Gemini chat with personas, prompt injects, macros)
- At session start the nested app was still under `src/app/ulti-chat/` (later moved to `_reference/ulti-chat/`)
- Goal: integrate as tool hub route, convert to shadcn, fix security issues

### 22:15 - Codebase Mapping Complete
- 4 parallel mapper agents completed (tech, arch, quality, concerns)
- 7 documents written to `.planning/codebase/` (2508 lines total)
- 3 critical issues flagged: nested project, exposed API key, dep conflicts

### 22:20 - Planning Phase Started
- Created planning files (task_plan.md, findings.md, progress.md)
- Kevin's priorities: chat UI first, shadcn conversion, everything else later
- Peer instances briefed (pv76qdyn in .mcp, enwj6h3d Sonnet in ktgv2)

### 22:30 - Phase 1 Complete
- Branch created: `feature/ulti-chat-integration`
- ulti-chat moved to `_reference/ulti-chat/`, gitignored
- Deps installed: `zod`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
- `@ai-sdk/google` chosen as primary SDK (Vercel AI SDK, not raw @google/genai)

### 23:00 - Phase 2 Complete (API Route)
- `src/app/api/hub/chat/route.js` built — AI Gateway
  - 9 model families, 21 models (Gemini, Claude, GPT, Grok, etc.)
  - Real tools: web search (googleSearch), code execution, DB access
  - All 4 AI SDK breaking bugs fixed: `convertToModelMessages`, `stepCountIs`, `toUIMessageStreamResponse`, `googleSearch` tool shape
- `src/app/api/hub/settings/route.js` built — cookie persistence for settings
- Security: API keys server-side only, never NEXT_PUBLIC_

### 23:30 - Phase 3-5 Complete (UI + Route)
- `src/app/hub/chat/page.jsx` built (~745 lines)
  - shadcn/ui primitives used throughout
  - Personas system with custom creator (name, prompt, icon, color, localStorage)
  - Model selector is GLOBAL (not per-persona) — Kevin's design decision
  - Prompt inject dots (red/green traffic light style) = composable system prompt fragments
  - MCP servers + Skills right sidebar with on/off toggles
  - 21-model selector
  - buildSystemPrompt() → persona.prompt + active inject instructions → useChat body → API → streamText system param
- shadcn components installed: Dialog, Switch, ScrollArea, Select
- Route accessible at `/hub/chat`

### Build status: PASSING (clean build)

---

## Session: 2026-03-24

### Context restored from peers (no mem0 saved)
- Peer `dhs1dgze` (lead instance) confirmed build state above
- Peer `pv76qdyn` (Opus, .mcp hub) confirmed persona system end-to-end verified

### Phase 7 Polish (lead Opus instance)
- [x] Iosevka font installed: Regular + Bold woff2 in public/fonts/, wired as --font-mono in layout.jsx
- [x] Chat page body text uses Iosevka, Syne for headers only
- [x] Right sidebar redesigned: compact checklist (w-52, tight rows, dot+text)
- [x] Floating input card: absolute bottom, gradient fade, #00f0ff glow border
- [x] Cyan glow on all message cards
- [x] Input structure: inject dots (top) → textarea (middle) → attach/drive/share (bottom)
- [x] pb-40 on chat scroll area to prevent content hiding behind floating input

### Phase 7 Polish (peer 3jvz9wlg — active with Kevin)
- [x] Input area border fix (bg-zinc-950 wrapper)
- [x] Persona modal scrollable (max-h-65vh)
- [x] System prompt textarea expanded (rows 10)
- [x] Modal backdrop fix (bg-zinc-950/80 backdrop-blur-sm)
- [x] Native color picker added
- [x] Dev server restarted on port 3004 (Turbopack cache cleared)

### Current state: Phase 7 in progress, Kevin live testing

### Pending
- [ ] Verify Iosevka renders correctly in browser
- [ ] End-to-end chat test with API keys (other provider keys already in .env.local)
- [ ] Real MCP protocol (@ai-sdk/mcp HTTP transport)
- [ ] Real code execution (server-side Python)
- [ ] KB approach decision
- [ ] Presets feature
- [ ] DockNav conflict test on /hub/* routes

---

## Session: 2026-03-25

### Context restored from task_plan.md + findings.md
- Phase 6 in progress (testing unblocked — API keys confirmed in .env.local)
- Opus peer (dhs1dgze) lead on Phase 6 testing + right panel fix
- Sonnet (this instance, 3jvz9wlg) audited page.jsx + route.js — no runtime errors found

### New feature planned: Dual Chat Mode (Phase 8)
- Kevin requested: two side-by-side panes, same prompt fires both, independent model/persona per pane
- Phase 8 added to task_plan.md
- Architecture decision: ChatPane component with forwarded append ref, shared input bar at bottom
- Implementation starting next

### MILESTONE — Phase 7 Polish COMPLETE
- Floating input card: absolute positioned, gradient fade, cyan glow border, inject dots (top) / textarea / actions (bottom)
- Iosevka font: Regular + Bold woff2 in public/fonts/, --font-mono in layout.jsx, chat body uses it
- Compact right sidebar: w-52, checklist style
- Cyan glow on all message cards
- Persona modal: scrollable, system prompt rows=10, native color picker, matte backdrop
- Input box visible: bg-zinc-950 wrapper with border
- Saved to mem0 [2026-03-25]

### Next targets
- Dual chat mode (Phase 8)
- Presets: persona + model + injects + skills + MCPs → localStorage
- Real MCP connections (@ai-sdk/mcp HTTP transport)
- KB integration (quick inject vs pgvector — Kevin's decision pending)
- Vercel deploy

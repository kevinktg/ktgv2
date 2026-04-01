# Task Plan: Integrate Ulti-Chat into ktgv2

## Objective
Integrate the standalone ulti-chat AI Studio app into ktgv2 as `/hub/chat`, converting inline components to shadcn/ui, fixing security issues, and building a multi-model AI gateway.

## Scope
Phase 1-5 complete. Currently at Phase 6 (verification/testing).

---

## Phase 1: Preparation (branch + move + deps) — COMPLETE

### 1.1 Create feature branch
- [x] `git checkout -b feature/ulti-chat-integration`

### 1.2 Move ulti-chat to temp reference location
- [x] Moved `src/app/ulti-chat/` to `_reference/ulti-chat/` (gitignored)

### 1.3 Add missing dependencies
- [x] `@ai-sdk/google` — Vercel AI SDK Google provider (chosen over raw @google/genai)
- [x] `@ai-sdk/anthropic` — for Claude models
- [x] `@ai-sdk/openai` — for GPT/Grok models
- [x] `zod` — schema validation
- [x] shadcn/ui: Dialog, Switch, ScrollArea, Select installed
- [x] `motion` NOT added — GSAP only

---

## Phase 2: Security Fix (API route) — COMPLETE

### 2.1 Server-side API route
- [x] `src/app/api/hub/chat/route.js` — AI Gateway
  - 9 model families, 21 models
  - Tools: web search (googleSearch), code exec, DB access
  - All 4 AI SDK breaking bugs fixed
- [x] `src/app/api/hub/settings/route.js` — cookie-based settings persistence

### 2.2 Security
- [x] No NEXT_PUBLIC_ keys anywhere
- [x] All AI calls server-side only

---

## Phase 3: Component Decomposition — DEFERRED

Decision: rebuilt as ~745-line `page.jsx` monolith (same structure, cleaner). Full decomposition deferred to post-testing phase.

Original plan for `src/components/hub/chat/` sub-components not executed.
File still: `src/app/hub/chat/page.jsx`

---

## Phase 4: shadcn/ui Conversion — COMPLETE

- [x] shadcn Button, Switch, Dialog, ScrollArea, Select used throughout
- [x] `rounded-none` preserved
- [x] `font-[family-name:var(--font-syne)]` preserved
- [x] Lowercase text preserved
- [x] Black bg, #00f0ff accent, zinc palette

---

## Phase 5: Route Integration — COMPLETE

- [x] `src/app/hub/chat/page.jsx` — full chat UI
- [x] Personas system end-to-end verified
- [x] 21-model selector (global, not per-persona)
- [x] Prompt inject system (red/green dots)
- [x] MCP + Skills right sidebar with toggles
- [x] Build passes clean

---

## Phase 6: Verification — IN PROGRESS

### 6.1 Functional checks (BLOCKED — needs API keys)
- [x] Add `GOOGLE_GENERATIVE_AI_API_KEY` to `.env.local`
- [x] Add `ANTHROPIC_API_KEY` to `.env.local` (optional, for Claude models)
- [x] Chat sends messages and receives streaming responses
- [x] Persona selection works (built-in + custom with localStorage)
- [x] Model switching works
- [ ] Prompt injects modify system instruction
- [ ] Skills toggle works (web search grounding)
- [ ] Macros fire correctly
- [ ] Custom personas persist across page reloads

### 6.2 Integration checks
- [ ] `/hub/chat` loads without breaking other routes
- [ ] GeometricBackground, DockNav, CursorDot all work on chat page
- [ ] No console errors
- [ ] `next build` succeeds
- [ ] Mobile responsive

### 6.3 Security checks
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` never in client bundle
- [ ] No NEXT_PUBLIC_ AI keys anywhere
- [ ] API route validates requests

---

## Phase 7: Polish — COMPLETE (2026-03-25)

### 7.1 UX Gaps (from screenshot)
- [x] Red/green status dots — inject dots on top of floating input, MCP/skill dots in right sidebar
- [x] Iosevka font — self-hosted woff2 (Regular + Bold), wired as `--font-mono` in layout.jsx, chat body uses it
- [x] Input bar icons: attach, drive, share on bottom of floating input card
- [x] Floating input card — absolute positioned, gradient fade, `#00f0ff` glow border
- [x] Cyan glow on all message cards — subtle `shadow-[0_0_12px_rgba(0,240,255,0.04)]`
- [x] Right panel compact checklist — w-52, tight rows, dot+text, Syne headers only
- [x] Input card structure: inject dots (top) → textarea (middle) → attach/drive/share (bottom)
- [ ] Iosevka rendering — verify font loads correctly in browser

### 7.2 Make Skills Real
- [x] Code execution: tool() defined in API route, passes to model
- [x] Web search: wired via `google.tools.googleSearch({})` (Google models only, mutually exclusive with custom tools)
- [x] DB access: queries snippets API via tool()
- [ ] Code execution: actual server-side Python execution (currently returns code for display)

### 7.3 Pending Kevin Decisions
- [ ] **KB approach**: quick inject (full text ~50k chars) vs RAG (pgvector)
- [ ] **Presets**: persona + model + injects + skills + MCPs → localStorage (specced, not built)
- [ ] **MCP real connections**: requires @ai-sdk/mcp + HTTP transport decision for Vercel

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route path | `/hub/chat` | Consistent with existing `/hub/snippets` pattern |
| Animation library | GSAP (remove motion) | ktgv2 is GSAP-first |
| API key handling | Server-side API route | NEXT_PUBLIC_ exposes key in client bundle |
| File format | JSX (not TSX) | ktgv2 main app uses JSX |
| State management | useState in page.jsx | Keep simple, match existing patterns |
| Modals | shadcn Dialog | Replace inline fixed-position divs |
| Right sidebar | MCP servers + Skills | Kevin's screenshot annotation |
| Prompt inject display | Red/green dots | Traffic light style — composable system prompt fragments |
| AI SDK | @ai-sdk/google (Vercel AI SDK) | Unified 21-model interface, not raw @google/genai |
| Model selector | Global (not per-persona) | Kevin's explicit decision |
| Component structure | 745-line monolith page.jsx | Decomposition deferred — get working first |
| DockNav conflict | TBD | Test live to determine if conflict exists |

---

---

## Phase 8: Dual Chat Mode — PENDING

Two side-by-side chat panes. Same input fires to both simultaneously. Independent model/persona per pane. Compare outputs.

### 8.1 Mode toggle
- [ ] Add dual/single toggle button to header (icon: split pane or columns icon)
- [ ] `isDualMode` state — false by default
- [ ] Layout switches: single pane flex-1 → two panes flex-1 each

### 8.2 Extract ChatPane component
- [ ] Create `ChatPane` component (can live in page.jsx as inner component or extract to `src/components/hub/chat/ChatPane.jsx`)
- [ ] Each pane owns: `useChat` hook, `selectedModelId`, `selectedPersonaId`, `activeInjects`, `activeSkills`, `activeMcps`
- [ ] Pane header: compact model selector + persona selector per pane
- [ ] Pane message area: ScrollArea with messages
- [ ] No input inside pane — input is shared at parent level

### 8.3 Shared input bar
- [ ] Single textarea + send button at bottom of page (below both panes)
- [ ] On submit: fire `append({ role: 'user', content: input })` on BOTH pane refs simultaneously
- [ ] Use `useImperativeHandle` + `forwardRef` on ChatPane to expose `append` method to parent
- [ ] Clear input after both fires

### 8.4 Layout
- [ ] Dual mode: `flex-row` container, two panes `flex-1 min-w-0` each, divider `border-r border-zinc-800`
- [ ] Each pane scrolls independently
- [ ] Pane label: "pane A" / "pane B" in top-left of each pane header (small, zinc-600)

### 8.5 Inject / skills sync decision
- [ ] Default: injects shared (applied to both panes) — simplest UX
- [ ] Skills + MCP: per-pane (different models have different capabilities)
- [ ] Right sidebar shows per-active-pane context (or global toggle TBD)

### 8.6 Polish (post-MVP)
- [ ] Pane collapse/expand
- [ ] Swap panes
- [ ] Highlight response diff (optional — heavy lift, defer)

---

## Decisions Log — Phase 8

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Injects | Shared | Same modifier applied to both for fair comparison |
| Model/Persona | Per-pane | That's the whole point — compare different configs |
| Input | Shared single bar | One prompt → two models |
| ChatPane extraction | Inner component first | Avoid file bloat until proven needed |

---

## Phase 9: Avatar Creator — PENDING

Let users create a custom avatar for their profile/persona instead of just icon + color.

- [ ] Avatar builder UI — upload image OR generate via AI (Gemini Imagen / FLUX)
- [ ] Crop + frame options (square, circle, hex)
- [ ] Stored in localStorage (MVP) or Vercel Blob (persistent)
- [ ] Avatar appears in chat header, message bubbles, persona selector
- [ ] Replaces the current icon-only persona display

---

## Out of Scope (post-Phase 7)
- Full component decomposition into src/components/hub/chat/
- Nav sections as real routes (prompt-forge, workflow-studio, etc.)
- File attachments (Vercel Blob upload)
- Zustand migration
- Hub landing page redesign
- Real MCP protocol connections (Vercel HTTP transport constraint)

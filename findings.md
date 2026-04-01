# Findings - Ulti-Chat Integration into ktgv2

> **2026-04:** Discoveries below describe the **pre-integration** tree. That app was **moved** to **`_reference/ulti-chat/`**; production chat is **`/hub/chat`**. Treat paths like `src/app/ulti-chat/` as **historical** in this document.

## Session: 2026-03-23

### Discovery 1: Ulti-Chat Structure
- Full standalone Next.js 15 app at `src/app/ulti-chat/` (since moved to `_reference/`)
- Own package.json, next.config.ts, tsconfig.json, postcss.config.mjs
- Single monolithic `app/page.tsx` (~840 lines) — entire UI in one file
- `app/layout.tsx` — minimal, Syne + Inter fonts (identical vars to ktgv2)
- `app/globals.css` — Tailwind v4, bg #050505, scrollbar util, shimmer animation
- `hooks/use-mobile.ts` — useIsMobile() hook
- `lib/utils.ts` — cn() identical to ktgv2's

### Discovery 2: Ulti-Chat Features (all in page.tsx)
- **Personas**: 4 built-in + custom persona creator with icon picker, color picker, localStorage persistence
- **Models**: Gemini 3.1 Pro, Gemini 3 Flash, Gemini 2.5 Flash
- **Prompt Injects**: ELI5, Ultra Concise, Sarcastic, Step-by-Step, Emoji Heavy, Devil's Advocate
- **Skills**: Web Search (Google grounding), Code Execution (simulated), DB Access (simulated)
- **Macros**: Reusable prompt shortcuts with localStorage persistence
- **Nav Links**: 9 sections (chat, prompt-forge, workflow-studio, embed-chain, platforms, google-universe, newsroom, orchestration, content-hub) — only chat is functional
- **15 useState vars** — no Zustand, no context
- **Streaming Gemini** via `ai.models.generateContentStream()` with `for await` loop

### Discovery 3: Inline Components (NOT shadcn)
- `Button` — custom forwardRef, hardcoded black+cyan styles
- `Switch` — custom toggle, not Radix
- `IconPicker` — searchable grid of 30+ Lucide icons
- `EpicChatUI` — monolithic parent, all state

### Discovery 4: Design System Overlap
- Fonts: identical (--font-syne, --font-inter)
- Colors: identical (black bg, #00f0ff accent, zinc palette)
- cn() util: identical
- Lucide React: both use it
- react-markdown + remark-gfm: both have it
- clsx, tailwind-merge, class-variance-authority: all in ktgv2
- Tailwind v4 + @tailwindcss/typography: ktgv2 has it
- Radix primitives: large overlap

### Discovery 5: Unique Dependencies (needs adding to ktgv2)
- `@google/genai` — Gemini SDK, NOT in ktgv2
- `motion` (Framer Motion v12) — NOT in ktgv2, conflicts with GSAP
- `cmdk` — command palette, NOT in ktgv2

### Discovery 6: Critical Issues (all resolved)
1. **SECURITY**: `NEXT_PUBLIC_GEMINI_API_KEY` at line 298 — FIXED: moved to server-side API route
2. **BUILD BREAK**: Nested Next.js project — FIXED: moved to `_reference/`, gitignored
3. **VERSION CONFLICT**: next@15.4.9 vs ktgv2's next@16.1.1 — FIXED: reference only, not built
4. **ANIMATION CONFLICT**: `motion` (Framer) vs ktgv2's GSAP — FIXED: not imported
5. **MONOLITH**: 840-line page.tsx — PARTIALLY: rebuilt as ~745-line page.jsx (decomposition deferred)
6. **MOBILE BUG**: Uses `h-screen` — status: needs verification in new page.jsx

### Discovery 7: ktgv2 Existing Hub
- `/hub` redirects to `/hub/snippets`
- Snippet browser with Vercel Postgres (Drizzle) + Vercel Blob
- API routes at `src/app/api/hub/snippets/`
- Components in `src/components/hub/`
- Natural place for chat: `/hub/chat`

### Discovery 8: ktgv2 Globals (must work with)
- `GeometricBackground` (fixed behind all content)
- `DockNav` (floating icon dock)
- `CursorDot` (must be last in render tree)
- `ClientLayout` wraps everything
- Lenis smooth scroll (global instance)

### Discovery 9: Screenshot Design Intent (Kevin's annotations)
- **Right sidebar**: NOT macros — MCP servers (top section) + Skills (bottom section) with on/off toggles
- **Prompt injects**: Red/green dot indicators (traffic light style) between inject icons and input
- **Input bar**: Attach, voice, equalizer, file export, share icons below textarea
- **Left sidebar**: Nav icons (matches code)
- **Top bar**: Persona selector + model selector (matches code)
- **Brand**: ".ktg" with cyan brain icon top-left, "1x AI" annotation
- Red/green dots = visual status of which MCPs/skills are active per session

---

## Session: 2026-03-23 (Implementation)

### Discovery 10: AI SDK Choice
- **Chosen**: `@ai-sdk/google` (Vercel AI SDK) — NOT raw `@google/genai`
- `@google/genai` kept only for code execution skill (Gemini-native sandbox)
- AI SDK gives unified interface across 21 models (Gemini, Claude, GPT, Grok, etc.)

### Discovery 11: AI SDK Breaking Bugs Fixed
Four bugs in AI SDK + Google provider that required workarounds:
1. `convertToModelMessages` — API changed, required specific import path
2. `stepCountIs` — renamed/removed in latest version
3. `toUIMessageStreamResponse` — signature changed
4. `googleSearch` tool shape — schema changed between versions

### Discovery 12: Persona System Architecture
- `buildSystemPrompt(persona, activeInjects)` → concatenates persona.prompt + inject instructions
- Passed as `system` param to `streamText()` in API route
- Custom personas: name, prompt, icon, color → localStorage persistence
- Model selector is GLOBAL (Kevin's explicit decision — not per-persona)
- KB field exists in persona schema as placeholder (`kb: 'none'`), not implemented

### Discovery 13: Prompt Inject System
- Injects are composable system prompt fragments (ELI5, Concise, Sarcastic, etc.)
- Red dot = inject off, Green dot = inject on (traffic light visual)
- Active injects appended to persona's base system prompt
- Multiple injects can be active simultaneously

### Discovery 14: Pending Decisions (Kevin's)
- **KB approach**: quick inject (full text ~50k chars into system prompt) vs proper RAG (pgvector)
- **Presets**: specced as persona + model + active injects + active skills + active MCPs → localStorage save/load/delete
- **Nav roadmap**: written at `ktgv2/nav-roadmap.md`

### Discovery 15: MCP Integration Constraints
- Real MCP protocol needs `@ai-sdk/mcp` — not yet installed
- Vercel deployment: HTTP transport only (no stdio/local process)
- Current MCP panel: UI toggles exist, real connections are stubs
- Real MCP requires explicit Kevin decision on transport + server hosting

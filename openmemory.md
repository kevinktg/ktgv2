# ktgv2 — openmemory guide

**Repo:** kevinktg/ktgv2 · **Site:** ktg.one

## Overview

Single Next.js 16 App Router app: marketing (`/`, `/blog`, `/expertise`, `/validation`), hub tools (`/hub/snippets`, **`/hub/chat`**), and APIs under **`/api/hub/*`**. Legacy AI Studio copy may exist only as **`_reference/ulti-chat/`** (gitignored) — not routable.

## Planning source of truth (SSOT)

| Question | Where to look |
|----------|----------------|
| Milestone goals, constraints | `.planning/PROJECT.md` |
| Session position, Phase 6–7, blockers | `.planning/STATE.md` |
| Phase list, dual-track marketing vs hub | `.planning/ROADMAP.md` |
| Shipped / current milestone | `.planning/MILESTONES.md` |
| REQ IDs (marketing v1) | `.planning/REQUIREMENTS.md` |
| Architecture drift / WordPress / hub risks | `.planning/codebase/CONCERNS.md` |
| Codex/Claude repo HOWTO | `CLAUDE.md` |
| Agent task limits | `AGENTS.md` |

Agent coding rules also live in `.cursor/rules/` (e.g. openmemory integration).

## Hub routes (production)

| Path | Role |
|------|------|
| `/hub` | Redirect → `/hub/snippets` |
| `/hub/snippets` | Snippet grid (Postgres + Blob) |
| `/hub/snippets/[id]` | Snippet detail |
| **`/hub/chat`** | AI chat UI |
| `POST /api/hub/chat` | Streaming chat (Vercel AI SDK, server keys) |
| `/api/hub/snippets` | Snippet CRUD |
| `/api/hub/settings` | Hub settings |

## Hub UI inventory (code-level)

See existing table in this file (skills/MCP/presets/dual-mode notes) — **E2E not implied**.

---

*Planning SSOT + hub summary: 2026-04-01 reconciliation*

## Hub `/hub/chat` UI (verified in `src/app/hub/chat/page.jsx`)

| You said | In code |
|----------|---------|
| Skills toggle, right sidebar | **Yes** — “connections” panel (`isRightSidebarOpen`): skills rows with green/red dots + toggle. **Also:** same skills on the **left** rail and in **Settings** modal (Switch). |
| MCP toggle, right sidebar | **Yes** — connections panel + **Settings** modal (Switch + red/green status dots). “Add mcp server” in Settings is **UI only** (no handler). MCP list is **local state** sent to API as `activeMcps`; real MCP transport is a separate backend concern. |
| Red/green prompt injects on textbox | **Almost** — modifier **dots sit above** the textarea (not inside it): **cyan + glow = on**, **red = off**. **Green** is used for **on** in the connections panel (skills/MCP rows), not for inject dots. |
| Presaved custom experts | **Yes** — built-in **personas** (`PERSONAS`) + **custom personas** (`localStorage` `hub-chat-personas`) + **presets** (`hub-chat-presets`: persona + model + injects + skills + MCPs). |
| Swap models | **Yes** — header model `Select` + Settings “default model” (same `selectedModelId`). |
| Dual model, side by side | **Not in UI** — `isDualMode`, `selectedPersonaIdB`, `selectedModelIdB`, and a **second `useChat`** (`pane-b`, `messagesB`, `appendB`) exist but **`setIsDualMode` / `messagesB` / `appendB` are unused in JSX**. Only single-pane chat renders today. |

## Key paths

- Hub chat page: `src/app/hub/chat/page.jsx`
- Chat API: `src/app/api/hub/chat/route.js`

---
*UI inventory: 2026-04-01 — code read, not E2E-tested in this note.*

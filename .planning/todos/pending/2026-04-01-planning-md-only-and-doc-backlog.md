---
created: 2026-04-01T12:00:00.000Z
title: Planning discipline — markdown-only alignment + doc backlog
area: planning
files:
  - AGENTS.md
  - CLAUDE.md
  - openmemory.md
  - .planning/STATE.md
  - .planning/PROJECT.md
  - .planning/codebase/CONCERNS.md
  - .planning/codebase/STRUCTURE.md
---

## Problem

1. **Scope mix-up:** Planning / reconciliation work must **only touch `.md` (and `.planning/`)** unless the user explicitly asks to change application code. Do not add comments or refactors under `src/` for “documentation” of behaviour — keep policy in markdown.

2. **Ulti-chat narrative:** The nested app was **moved** from `src/app/ulti-chat/` to **`_reference/ulti-chat/`** (gitignored) as part of **hub chat integration** (`/hub/chat`), not because an agent deleted the project. Planning docs must say **moved / archived for reference**, not imply the tree was wiped without a paper trail.

3. **Doc backlog:** Some alignment edits were incomplete or reverted on `AGENTS.md` / `.planning/STATE.md` / `.planning/PROJECT.md` while `CONCERNS.md`, `STRUCTURE.md`, `openmemory.md`, and `CLAUDE.md` were updated. `/hub/chat` should appear in **AGENTS.md** current tasks; **STATE.md** should add a short **scope / source-of-truth** blurb and **Roadmap evolution** line; **PROJECT.md** should record **WordPress fetch policy** (`no-store` for connection test vs `revalidate: 60` for post reads — describe in prose only, no `src` edits) and refresh **Active** checkboxes (e.g. openmemory seeded, CONCERNS refreshed).

## Solution

- [ ] Add a **Planning** or **Agents** rule line: *hub / marketing alignment = edit markdown only unless user says otherwise.*
- [ ] **AGENTS.md:** Extend current tasks with `/hub/chat` smoke-test + env keys when on `feature/ulti-chat-integration` (or post-merge); one line pointing to `.planning/STATE.md` for hub phases.
- [ ] **STATE.md:** Top “Scope (source of truth)” + **Roadmap evolution** entry for 2026-04-01 (docs reconciled; ulti-chat = `_reference/`, prod = `/hub/chat`).
- [ ] **PROJECT.md:** WordPress caching policy paragraph; tick or drop stale “openmemory empty” / “AGENTS vs revalidate” items as appropriate; bump *Last updated*.
- [ ] Sweep **`.planning/codebase/*.md`** (ARCHITECTURE, INTEGRATIONS, etc.) only if timeboxed — or spawn `$gsd-map-codebase` later — so no file still points at `src/app/ulti-chat/` as current.

## Verification

- Grep `.planning` + root `*.md` for `src/app/ulti-chat` — should be **historical/reference only** or zero.
- No `src/**` changes in commits that claim “planning only”.

---
status: diagnosed
trigger: MUSTDO.mdc vs .cursor/hooks — missing scripts, path case, MCP not gateable in-repo
created: 2026-04-03
updated: 2026-04-03
---

## Hypothesis

- **H1:** Cursor hooks fail or no-op when `run` targets point at files that do not exist → **CONFIRMED** for three `node .cursor/scripts/*.js` paths before fix.
- **H2:** MUSTDO references a rule file with wrong casing vs on-disk name → **CONFIRMED** on case-sensitive filesystems / strict tools.
- **H3:** MCP checklist items (Context7, mem0, in-memoria) cannot be proven by repo automation alone → **CONFIRMED** (by design); hooks/scripts only avoid breakage or remind; agents must call MCP.

## Evidence (paths)

| Path | Finding |
|------|---------|
| `D:/projects/sites/ktgv2/.cursor/hooks/cursor.json` | References `check-memory-before-feature.js`, `memory-ingest.js`, `skill-mcp-preflight.js` in `run` arrays (lines 17, 25, 33, 41). |
| `D:/projects/sites/ktgv2/.cursor/scripts/` | **Present:** `verify-before-handoff.js`, `check-memory-on-init.js`, `planning-preflight.js`. **Absent (before fix):** the three files above. |
| `D:/projects/sites/ktgv2/.cursor/rules/MUSTDO.mdc` | Line 20 previously: `Read ./Verification-hard-gate.mdc`. |
| `D:/projects/sites/ktgv2/.cursor/rules/verification-hard-gate.mdc` | Actual filename is lowercase `verification-hard-gate.mdc`. |

## Root cause

1. **Hook/script drift:** `cursor.json` was committed (or edited) to invoke scripts that were never added to `.cursor/scripts/` (or were removed). Any environment that runs those hooks with `node` would get `MODULE_NOT_FOUND` / exit non-zero for missing files.
2. **Documentation path mismatch:** MUSTDO pointed at a filename that does not match the repository’s actual rule file name, breaking portability to case-sensitive OSes and some tooling.
3. **Expectation gap:** MUSTDO mixes human/agent checklist items (MCP) with things hooks could theoretically enforce; without MCP-side automation, only agent compliance + non-breaking hooks address the gap.

## Recommended fix order

1. **Restore hook targets to valid files** — either remove broken hook entries or add minimal stub scripts (`exit 0` + stderr warning). **Applied:** stubs (preserves hook intent, avoids `node` ENOENT).
2. **Align MUSTDO with on-disk rule name** — `verification-hard-gate.mdc`. **Applied.**
3. **Treat MCP checklist as manual/agent** — document in rules; optional future: real scripts that call APIs if keys exist (out of scope; no new deps requested).

## ROOT CAUSE FOUND

**Summary:** Hooks referenced three non-existent scripts; MUSTDO cited the verification rule with incorrect filename casing. MCP items remain agent-enforced, not hook-enforced.

**Files touched (resolution):**

- Added: `.cursor/scripts/check-memory-before-feature.js`, `memory-ingest.js`, `skill-mcp-preflight.js` (stubs).
- Updated: `.cursor/rules/MUSTDO.mdc` (exact `verification-hard-gate.mdc` path).

---

## Verification

- Run: `node .cursor/scripts/check-memory-before-feature.js && node .cursor/scripts/memory-ingest.js && node .cursor/scripts/skill-mcp-preflight.js` — expect exit code 0 and stderr stub messages.

---

## Verification (2026-04-03) — plan `99-02-PLAN.md`

- **MUSTDO.mdc** delete+rewrite (file had **duplicate frontmatter / merged 嘘契約 into `Read` lines** — Cursor sync glitch). Now: single frontmatter; verification line points to **`.cursor/rules/verification-hard-gate.mdc`**; MCP bullets name **`user-context7`**, **`user-mem0`**, **`user-in-memoria`**.
- **Hook scripts:** all paths in `.cursor/hooks/cursor.json` resolve under `.cursor/scripts/` (stubs + real `planning-preflight`, `check-memory-on-init`, `verify-before-handoff`).
- **UAT:** `99-UAT.md` gains **Evidence classes** — scroll feel = class **C**, not provable by A alone.
- **Plan artifact:** `.planning/phases/99-cursor-one-task/99-02-PLAN.md` (MUSTDO + verification binding for Phase 99).

# ktgv2 Animation & Z-Index Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a deterministic z-index token system and fix broken animation stacking across ktgv2 so layers never bleed, cursor always renders on top, and scroll transitions compose cleanly.

**Architecture:** Define a single source of truth for z-index tiers via CSS custom properties in `globals.css` + `tailwind.config.js` extension. Replace all arbitrary `z-[N]` values with semantic token classes. Both cursor components (GlobalCursor + CursorDot) are confirmed simultaneously active — assign distinct tier tokens to each.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, GSAP + ScrollTrigger, React 19

---

## Orchestration Map

| Agent | Role | CLI |
|---|---|---|
| Claude | Architect — token system, GeometricBackground fix, review | Main session |
| Gemini CLI | Auditor — CSS conflict analysis + GSAP animation audit (parallel) | `gemini -p` via file |
| Codex | Executor — bulk parallel z-index replacements (Tasks 3/5/6 in one dispatch) | `codex exec` |
| Jules | Verifier — background build + lint after all replacements | Async |

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/globals.css` | Modify | Add z-index CSS custom properties + token utility classes |
| `tailwind.config.js` | Modify | Extend `theme.zIndex` with token variables for Tailwind JIT + IntelliSense |
| `src/components/GeometricBackground.jsx` | Modify | Replace inline `zIndex:0` with `z-bg` token class |
| `src/components/Header.jsx` | Modify | `z-[9999]` → `z-nav` |
| `src/components/GlobalCursor.jsx` | Modify | `z-[9998]` → `z-cursor-ring`, `z-[9999]` → `z-cursor-dot` |
| `src/components/CursorDot.jsx` | Modify | `z-[99999]` → `z-cursor-top` |
| `src/components/BlogPreview.jsx` | Modify | Remove `z-[60]` from relative section |
| `src/components/HeroTransition.jsx` | Modify | `z-20` → `z-transition` |
| `src/components/ExpertiseTransition.jsx` | Modify | `z-35` (currently a no-op) → `z-transition` |
| `src/components/ui/navigation-menu.jsx` | Modify | `z-[1]` → `z-content` (lowest content tier) |

---

## Z-Index Token System

```
Layer               Token              Value    Components
─────────────────────────────────────────────────────────
Background          --z-bg             0        GeometricBackground
Page content        --z-content        10       HeroSection, sections, navigation-menu
Transitions         --z-transition     20       HeroTransition, ExpertiseTransition
Overlay panels      --z-overlay        30       Any scroll-pinned panels
Navigation          --z-nav            40       Header
[reserved modal]    --z-modal          200      Future modal/toast/dialog overlays
Cursor ring         --z-cursor-ring    9000     GlobalCursor ring
Cursor dot          --z-cursor-dot     9001     GlobalCursor dot
Cursor canvas       --z-cursor-top     9002     CursorDot (canvas)
```

**Rule:** Nothing exceeds 9002 in normal use. Modals/toasts use `--z-modal: 200`. No arbitrary `z-[N]` values outside this table.

**Rollback:** If visual regression occurs at any task, run `git revert HEAD` or `git stash` to restore previous state before the failing commit.

---

## Task 1: Parallel Audits (Gemini — Two Concurrent Reports)

**Agent: Gemini CLI (dispatch both simultaneously, review before Task 2)**

> Note: Gemini prompts pass file paths, not inlined content, to avoid shell argument length limits on Windows.

- [ ] **Step 1: Write Gemini z-index audit prompt to file**

```bash
cat > /tmp/gemini-zindex-audit.txt << 'EOF'
Audit all z-index usage in a Next.js project. Files are in /d/projects/sites/ktgv2/src/

Find: (1) components sharing the same z-index value, (2) stacking contexts created by transform/opacity/filter/will-change that may break z-index, (3) any animation promoting a layer unexpectedly.

Files to check: src/components/*.jsx, src/app/globals.css

Output a markdown table: Component | File | Current Z | Issue | Recommended Fix
EOF
gemini -p "$(cat /tmp/gemini-zindex-audit.txt)" > /d/projects/sites/ktgv2/docs/superpowers/plans/zindex-audit-report.md
```

- [ ] **Step 2: Write Gemini GSAP animation audit prompt to file**

```bash
cat > /tmp/gemini-gsap-audit.txt << 'EOF'
Analyze GSAP ScrollTrigger animation files for scroll conflicts. Files:
- /d/projects/sites/ktgv2/src/components/HeroTransition.jsx
- /d/projects/sites/ktgv2/src/components/ExpertiseTransition.jsx
- /d/projects/sites/ktgv2/src/components/PageTransition.jsx

Check if: (1) ScrollTrigger instances leak between route navigations, (2) sessionStorage 'hasPlayed' flags correctly reset on back-navigation, (3) clip-path animations compose cleanly with PageTransition opacity fade, (4) scrub:0.8 on both transitions causes timing conflicts on slow scroll.

Output specific code fixes for any issues found.
EOF
gemini -p "$(cat /tmp/gemini-gsap-audit.txt)" > /d/projects/sites/ktgv2/docs/superpowers/plans/gsap-audit-report.md
```

- [ ] **Step 3: Review both reports before proceeding to Task 2**

```bash
cat /d/projects/sites/ktgv2/docs/superpowers/plans/zindex-audit-report.md
cat /d/projects/sites/ktgv2/docs/superpowers/plans/gsap-audit-report.md
```

Adjust the token system above if Gemini surfaces conflicts not already captured.

---

## Task 2: Define Z-Index Token System

**Agent: Claude (main session)**

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Read tailwind.config.js to understand existing theme structure**

```bash
cat /d/projects/sites/ktgv2/tailwind.config.js
```

- [ ] **Step 2: Add CSS custom properties to `:root` block in globals.css**

Inside `:root {}`, after `--radius: 0.375rem;`:

```css
/* Z-INDEX TOKEN SYSTEM
   Single source of truth. Never use arbitrary z-[N] values outside this scale.
*/
--z-bg: 0;
--z-content: 10;
--z-transition: 20;
--z-overlay: 30;
--z-nav: 40;
--z-modal: 200;
--z-cursor-ring: 9000;
--z-cursor-dot: 9001;
--z-cursor-top: 9002;
```

- [ ] **Step 3: Add utility classes in globals.css (outside @layer, after ANIMATIONS block)**

```css
/* Z-INDEX UTILITIES - mapped from token system */
.z-bg            { z-index: var(--z-bg); }
.z-content       { z-index: var(--z-content); }
.z-transition    { z-index: var(--z-transition); }
.z-overlay       { z-index: var(--z-overlay); }
.z-nav           { z-index: var(--z-nav); }
.z-modal         { z-index: var(--z-modal); }
.z-cursor-ring   { z-index: var(--z-cursor-ring); }
.z-cursor-dot    { z-index: var(--z-cursor-dot); }
.z-cursor-top    { z-index: var(--z-cursor-top); }
```

- [ ] **Step 4: Extend tailwind.config.js with zIndex tokens**

In `tailwind.config.js`, inside `theme.extend` add:

```js
zIndex: {
  'bg':           'var(--z-bg)',
  'content':      'var(--z-content)',
  'transition':   'var(--z-transition)',
  'overlay':      'var(--z-overlay)',
  'nav':          'var(--z-nav)',
  'modal':        'var(--z-modal)',
  'cursor-ring':  'var(--z-cursor-ring)',
  'cursor-dot':   'var(--z-cursor-dot)',
  'cursor-top':   'var(--z-cursor-top)',
},
```

- [ ] **Step 5: Verify build**

```bash
cd /d/projects/sites/ktgv2 && npm run build 2>&1 | tail -20
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css tailwind.config.js
git commit -m "feat(z-index): add token system to globals.css + tailwind.config.js"
```

---

## Task 3: Bulk Codex Replacements (Header + Transitions + BlogPreview + navigation-menu)

**Agent: Codex — single dispatch, all independent file edits in parallel**

**Files:**
- `src/components/Header.jsx` — `z-[9999]` → `z-nav`
- `src/components/HeroTransition.jsx` — `z-20` on container div → `z-transition`
- `src/components/ExpertiseTransition.jsx` — `z-35` on container div → `z-transition`
- `src/components/BlogPreview.jsx` — remove `z-[60]` from section element
- `src/components/ui/navigation-menu.jsx` — `z-[1]` → `z-content`

- [ ] **Step 1: Dispatch Codex with all five edits**

```bash
codex exec "Make these exact changes, no others:
1. /d/projects/sites/ktgv2/src/components/Header.jsx: replace class 'z-[9999]' with 'z-nav' on the header element
2. /d/projects/sites/ktgv2/src/components/HeroTransition.jsx: replace class 'z-20' with 'z-transition' on the outermost container div (ref={containerRef})
3. /d/projects/sites/ktgv2/src/components/ExpertiseTransition.jsx: replace class 'z-35' with 'z-transition' on the outermost container div (ref={containerRef})
4. /d/projects/sites/ktgv2/src/components/BlogPreview.jsx: remove 'z-[60]' from the section element's className string
5. /d/projects/sites/ktgv2/src/components/ui/navigation-menu.jsx: replace 'z-[1]' with 'z-content'"
```

- [ ] **Step 2: Verify — check for remaining arbitrary values in changed files**

```bash
grep -n "z-\[" \
  /d/projects/sites/ktgv2/src/components/Header.jsx \
  /d/projects/sites/ktgv2/src/components/HeroTransition.jsx \
  /d/projects/sites/ktgv2/src/components/ExpertiseTransition.jsx \
  /d/projects/sites/ktgv2/src/components/BlogPreview.jsx \
  /d/projects/sites/ktgv2/src/components/ui/navigation-menu.jsx
```
Expected: empty output

- [ ] **Step 3: Build check**

```bash
cd /d/projects/sites/ktgv2 && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.jsx src/components/HeroTransition.jsx src/components/ExpertiseTransition.jsx src/components/BlogPreview.jsx src/components/ui/navigation-menu.jsx
git commit -m "fix(z-index): replace arbitrary z-values with token classes across 5 components"
```

---

## Task 4: Fix Cursor Z-Indexes

**Agent: Claude (main session)**

> Both GlobalCursor and CursorDot are confirmed simultaneously active (GlobalCursor in ClientLayout.jsx, CursorDot in layout.jsx). Both require token replacement. No consolidation needed — they serve different visual roles (CSS cursor vs canvas cursor).

**Files:**
- Modify: `src/components/GlobalCursor.jsx`
- Modify: `src/components/CursorDot.jsx`

- [ ] **Step 1: Read current GlobalCursor to confirm line numbers**

```bash
grep -n "z-\[" /d/projects/sites/ktgv2/src/components/GlobalCursor.jsx
```

- [ ] **Step 2: Replace GlobalCursor z-values**

In `GlobalCursor.jsx`:
- `z-[9999]` on the dot element → `z-cursor-dot`
- `z-[9998]` on the ring element → `z-cursor-ring`

- [ ] **Step 3: Read current CursorDot to confirm line numbers**

```bash
grep -n "z-\[" /d/projects/sites/ktgv2/src/components/CursorDot.jsx
```

- [ ] **Step 4: Replace CursorDot z-value**

In `CursorDot.jsx`:
- `z-[99999]` → `z-cursor-top`

- [ ] **Step 5: Verify no arbitrary z-values remain in cursor components**

```bash
grep -n "z-\[" \
  /d/projects/sites/ktgv2/src/components/GlobalCursor.jsx \
  /d/projects/sites/ktgv2/src/components/CursorDot.jsx
```
Expected: empty output

- [ ] **Step 6: Build check (required before proceeding)**

```bash
cd /d/projects/sites/ktgv2 && npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Visual check — cursor renders above header**

```bash
npm run dev
```
Open browser, hover over header area — cursor dot and ring must be visible on top of nav.

- [ ] **Step 8: Commit**

```bash
git add src/components/GlobalCursor.jsx src/components/CursorDot.jsx
git commit -m "fix(cursor): replace arbitrary z-values with cursor token tier"
```

---

## Task 5: Fix GeometricBackground

**Agent: Claude (main session)**

**Files:**
- Modify: `src/components/GeometricBackground.jsx`

- [ ] **Step 1: Read the component to confirm existing className structure**

```bash
cat /d/projects/sites/ktgv2/src/components/GeometricBackground.jsx | head -30
```

- [ ] **Step 2: Move zIndex from inline style to token class**

Find the outermost `<div>` with `style={{ zIndex: 0, overflow: 'visible', mixBlendMode: 'difference' }}`.

Change to:
- Add `z-bg` to existing className
- Remove `zIndex: 0` from style prop (keep `overflow` and `mixBlendMode`)

Result:
```jsx
<div
  className={`${fixed ? 'fixed' : 'absolute'} inset-0 pointer-events-none bg-transparent z-bg`}
  aria-hidden="true"
  style={{ overflow: 'visible', mixBlendMode: 'difference' }}
>
```

- [ ] **Step 3: Verify background still renders**

```bash
npm run dev
```
Visual: geometric grid and squares visible behind hero section.

- [ ] **Step 4: Commit**

```bash
git add src/components/GeometricBackground.jsx
git commit -m "fix(bg): replace inline zIndex:0 with z-bg token class"
```

---

## Task 6: Apply GSAP Animation Fixes

**Agent: Claude (main session)**

- [ ] **Step 1: Review Gemini GSAP report from Task 1**

```bash
cat /d/projects/sites/ktgv2/docs/superpowers/plans/gsap-audit-report.md
```

- [ ] **Step 2: Implement recommended fixes**

Apply Gemini's specific code fixes to the relevant components. Each fix gets its own commit:

```bash
git commit -m "fix(animation): [description from Gemini report]"
```

If Gemini found no issues, skip to Step 3.

- [ ] **Step 3: Manual scroll test**

```bash
npm run dev
```

Test checklist:
- [ ] Hero → Expertise wipe plays on first scroll
- [ ] Expertise → Validation wipe plays on first scroll
- [ ] Back-navigate to home: transitions skip (sessionStorage working)
- [ ] Refresh page: transitions play again (sessionStorage cleared)
- [ ] Slow scroll: no timing conflicts between both ScrollTrigger instances

---

## Task 7: Jules Background Verification

**Agent: Jules (async — dispatch after Task 5 commit)**

- [ ] **Step 1: Dispatch Jules**

```bash
jules "In /d/projects/sites/ktgv2: (1) run npm run build and report any errors, (2) run npm run lint and report any warnings, (3) grep -r 'z-\[' src/components/ --include='*.jsx' and confirm output is empty. Report all results."
```

- [ ] **Step 2: Review Jules output. Fix any errors in main session.**

---

## Task 8: Final Audit

**Agent: Claude (main session)**

- [ ] **Step 1: Confirm zero arbitrary z-values remain across all components**

```bash
grep -r "z-\[" /d/projects/sites/ktgv2/src/ --include="*.jsx" --include="*.tsx" --include="*.css"
```
Expected: empty output (all replaced with token classes)

- [ ] **Step 2: Confirm all token classes present in globals.css and tailwind.config.js**

```bash
grep "z-cursor-top\|z-cursor-dot\|z-cursor-ring\|z-nav\|z-transition\|z-bg\|z-modal" \
  /d/projects/sites/ktgv2/src/app/globals.css \
  /d/projects/sites/ktgv2/tailwind.config.js
```
Expected: all 9 tokens appear in both files.

- [ ] **Step 3: Production build**

```bash
cd /d/projects/sites/ktgv2 && npm run build && echo "BUILD OK"
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix(ktgv2): complete z-index token system + animation stacking — all tasks complete"
```

---

## Scaffold Sites (Optional — Parallel Execution After ktgv2 Stable)

> Kevin: "Some food you can write a plan for all the SCAF sites as well if you want to orchestrate"

Once ktgv2 is stable, dispatch 5 parallel subagents (one per scaffold) using `dispatching-parallel-agents` skill. Each agent receives: scaffold path (`ktg-scaff01` through `ktg-scaff05`), the z-index token system from this plan as the standard to follow, and instructions to audit + apply the same token pattern.

Create: `docs/superpowers/plans/2026-03-18-scaffold-sites-sync.md` when requested.

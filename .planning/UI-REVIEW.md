# ktgv2 — UI review (GSD-style)

**Audited:** 2026-04-03  
**Repo:** `D:/projects/sites/ktgv2` (Next.js 16, React 19, Tailwind v4, GSAP/Lenis)  
**Baseline:** `.planning/codebase/UI-STACKING-CONTRACT.md`, `.planning/Z-INDEX-SPEC.md`, `src/app/globals.css` `@theme`, plus representative surfaces (`src/app/page.jsx`, `src/app/layout.jsx`, hub chat).  
**Location:** `.planning/UI-REVIEW.md` — **site-wide** UI/stacking/accessibility findings; not scoped to a single GSD phase (marketing shell + hub + global chrome).

**Screenshots:** Captured with Playwright CLI while dev server responded HTTP 200 on `http://localhost:3000`. Desktop capture: `.planning/ui-reviews/audit-desktop.png` (directory is gitignored for binaries via `.planning/ui-reviews/.gitignore`). Mobile/tablet not captured in this pass.

---

## Verdict grid (BLOCK / FLAG / PASS)

| Pillar | Verdict | Score | Evidence (paths) |
|--------|---------|------:|------------------|
| 1. Typography | **FLAG** | 3/4 | `globals.css` `:root` headings + `hub/chat/page.jsx` `text-[9px]` / `text-[10px]` / mono shell |
| 2. Color / contrast | **FLAG** | 3/4 | `globals.css` `--muted-foreground`; hub `#00f0ff` + zinc; MCP red/green dots |
| 3. Spacing / layout | **PASS** | 4/4 | `page.jsx` `relative z-0 isolate`; semantic `z-local-*`, `z-dock`, `z-modal` in components |
| 4. Motion | **FLAG** | 3/4 | `usePrefersReducedMotion` in `HeroImages.jsx`, `PhilosophySection.jsx`; `globals.css` `@media (prefers-reduced-motion: reduce)` for footer/background |
| 5. Accessibility | **FLAG** | 2/4 | `DockNav.jsx` labels; `hub/chat/page.jsx` icon-only send `Button`; `CursorDot.jsx` wrapper lacks `aria-hidden` |
| 6. Brand consistency | **FLAG** | 3/4 | Dock cyan glow + hub `CHAT_*` tokens align; hub is deliberately mono-heavy vs marketing Syne/Inter |

**Overall:** **18/24** (sum of pillar scores). This is **not** a “full pass”: several items are **unverified** in browser (see Self-check).

---

## Priority fixes

### P0 (ship / compliance risk)

1. **Hub chat primary send control** — `src/app/hub/chat/page.jsx` (~696–702): `<Button type="submit">` contains only `<Send />` with no `aria-label`. Screen readers get no accessible name for the main action. **Fix:** `aria-label="Send message"` (or visible text).

2. **Cursor trail container** — `src/components/CursorDot.jsx` (~121–127): Decorative dot stack has no `aria-hidden` on the fixed wrapper (compare `GlobalCursor.jsx` which sets `aria-hidden="true"`). **Fix:** `aria-hidden="true"` on the outer `fixed` container.

### P1 (UX / consistency)

3. **Microcopy scale on hub** — Multiple `text-[9px]` / `text-[10px]` labels (`hub/chat/page.jsx`, e.g. ~401, ~628, ~791). Below typical 12px body minimum for dense UI; verify zoom and contrast. **Fix:** Bump to `text-xs` (12px) where possible or document exception.

4. **MCP/skill status semantics** — Green/red dots (`hub/chat/page.jsx` ~738, ~949) convey state by color alone. **Fix:** add text or `sr-only` status next to each row.

5. **Planning doc drift** — `.planning/phases/01-marketing-shell/01-UI-SPEC-stacking.md` still references raw `z-[45]`, `z-[52]`, Skip `z-[51]` while implementation uses `z-local-high`, `z-dock`, `z-skip`. **Fix:** update checklist to match `UI-STACKING-CONTRACT.md` / `globals.css` so future audits do not mis-rgrep.

### P2 (polish)

6. **Skip intro animation vs reduced motion** — `SkipButton.jsx` always runs GSAP fade-in. Consider gating with `usePrefersReducedMotion` for parity with hero/philosophy.

7. **Hub vs marketing typography** — Hub root `font-[family-name:var(--font-mono)]` (`hub/chat/page.jsx` ~360) is intentional “terminal” voice; ensure marketing pages never inherit this via a shared layout mistake (currently isolated to hub route).

---

## Detailed findings

### 1. Typography (FLAG, 3/4)

- **Strengths:** `globals.css` sets Syne for headings and Inter for body; blog `.blog-post-body` rules isolate WordPress prose from global `p` margins (lines 134–171).  
- **Flags:** Hub uses Iosevka/mono as the page shell while marketing uses Inter — acceptable brand split, but very small custom sizes (`text-[9px]`, `text-[10px]`) risk readability.  
- **Files:** `src/app/globals.css`, `src/app/hub/chat/page.jsx`, `src/app/layout.jsx` (font variables).

### 2. Color / contrast (FLAG, 3/4)

- **Strengths:** Semantic colors via CSS variables; comment documents muted foreground bump for WCAG (`globals.css` ~73–74). Graphite/black palette is coherent.  
- **Flags:** Hub relies on repeated `#00f0ff` / `rgba(0,240,255,…)` — aligned with `DockNav` accent but not tokenized as `primary`; harder to theme. Red/green MCP indicators without non-color cue (see P1).

### 3. Spacing / layout (PASS, 4/4)

- **Strengths:** `UI-STACKING-CONTRACT.md` matches `@theme` in `globals.css` (`--z-local-low` … `--z-popover`). Components use semantic classes: `DockNav.jsx` `z-dock`, `SkipButton.jsx` `z-skip`, `dialog.jsx` `z-modal`, `ExpertiseSection.jsx` / `ValidationSection.jsx` `z-local-high`, `ExpertiseTransition.jsx` `z-local-bridge`. Home `page.jsx` uses `relative z-0 isolate` for ScrollTrigger scope (lines 21–28).  
- **Note:** `.planning/phases/01-marketing-shell/01-UI-SPEC-stacking.md` is **out of date** vs code (numeric checklist vs semantic utilities) — planning hygiene only, not a runtime bug.

### 4. Motion (FLAG, 3/4)

- **Strengths:** `HeroImages.jsx` disables parallax when `usePrefersReducedMotion()` (lines 134–139). `PhilosophySection.jsx` skips heavy ScrollTrigger setup when reduced (lines 177–179). `globals.css` slows footer marquee and background animation under `prefers-reduced-motion` (lines 282–286, 327–334).  
- **Flags:** Not all motion entry points audited (e.g. `SkipButton.jsx` GSAP, `CursorDot.jsx` rAF loop) for reduced-motion policy completeness.

### 5. Accessibility (FLAG, 2/4)

- **Strengths:** `DockNav.jsx`: `aria-label="Main navigation"` and per-link `aria-label={label}` (lines 85, 102–113). `GeometricBackground`, footer ticker use `aria-hidden` where decorative. Dialog close includes `sr-only` “Close” (`dialog.jsx`). Hub MCP/skill `Switch` components often set `aria-label` (`hub/chat/page.jsx` ~749, ~780).  
- **Flags:** Hub send `Button` (see P0). `CursorDot` wrapper (see P0). No “skip to main content” link in `layout.jsx` — **not verified** whether omission is acceptable for this single-page marketing flow vs hub; flag for product decision.

### 6. Brand consistency (FLAG, 3/4)

- **Strengths:** Cyan accent and lowercase Syne labels appear in `DockNav` and hub (`CHAT_ROW_GLOW` etc.), giving a continuous “.ktg” chrome feel.  
- **Flags:** Hub is deliberately denser and more monospace; ensure OG/metadata (`layout.jsx`) still describe hub when those routes are shared publicly.

---

## Registry safety

`components.json` is standard shadcn defaults only; **no** third-party registry rows were declared in the reviewed UI-SPEC fragment (`01-UI-SPEC-stacking.md`). **Registry block source review skipped** (N/A per GSD rule: no third-party registry list to audit).

---

## Files audited (primary)

- `.planning/codebase/UI-STACKING-CONTRACT.md`, `.planning/Z-INDEX-SPEC.md`, `.planning/phases/01-marketing-shell/01-UI-SPEC-stacking.md`
- `src/app/globals.css`, `src/app/layout.jsx`, `src/app/page.jsx`
- `src/components/ClientLayout.jsx`, `DockNav.jsx`, `SkipButton.jsx`, `HeroSection.jsx`, `Footer.jsx`
- `src/components/ExpertiseSection.jsx`, `ExpertiseTransition.jsx`, `ValidationSection.jsx` (via grep + contract cross-check)
- `src/components/GlobalCursor.jsx`, `CursorDot.jsx`, `src/components/ui/dialog.jsx`
- `src/app/hub/chat/page.jsx`
- `src/lib/usePrefersReducedMotion.js`, `src/components/HeroImages.jsx`, `src/components/PhilosophySection.jsx` (motion sampling)

---

## Self-check (what was **not** verified)

- No **Lighthouse** or automated contrast audit; color judgments are heuristic from tokens and code.  
- **Keyboard-only** traversal and focus order (dock vs skip vs modals) not executed this session — contract says to validate; **not done here**.  
- **Mobile/tablet** screenshots not captured; responsive behavior not visually verified.  
- **Select inside Dialog** stacking (`z-popover` vs `z-modal`) not interactively verified on `/hub/chat`.  
- **Full** GSAP/ScrollTrigger surface inventory for `prefers-reduced-motion` — only sampled hero, philosophy, CSS.  
- **Screen reader** testing (NVDA/VoiceOver) not run.

---

**Output path:** `D:\projects\sites\ktgv2\.planning\UI-REVIEW.md`

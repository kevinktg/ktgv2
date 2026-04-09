# UI stacking contract (z-index & layering)

**Status:** normative for `ktgv2` — tokens implemented in `src/app/globals.css` `@theme` (2026-04) · **implementation complete** (semantic `z-dock`, `z-modal`, `z-local-*` in `src/`).  
**Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, Radix UI (Dialog / Select / Tooltip)

**SSOT location:** This file is the single source of truth for layering. **`openmemory.md`** already points here. GSD excerpt: `.planning/text-animations/Z-INDEX-CONTRACT.md` (same rules; do not fork numeric bands).

## 0. Index — utility → value (grep / review)

| Utility | Value | Role |
|---------|------:|------|
| `z-local-low` | 10 | Gradients, hero underlays, philosophy rail |
| `z-local-mid` | 20 | Transition bands, section content rails, hub left rail |
| `z-local-panel` | 40 | Validation slide panel |
| `z-local-high` | 45 | Expertise / validation shutter overlays (below app chrome) |
| `z-header` | 40 | Fixed header chrome |
| `z-skip` | 53 | Skip control — **above `z-dock`** so focus ring is not obscured; below cursors |
| `z-dock` | 52 | `DockNav` |
| `z-cursor-global` | 55 | `GlobalCursor` |
| `z-cursor-dot` | 60 | `CursorDot` (last in `layout.jsx` among in-tree siblings) |
| `z-modal` | 100 | Radix Dialog overlay + content |
| `z-popover` | 110 | Radix Select / Tooltip portaled content |
| `z-0` + `isolate` | — | Home main wrapper (`page.jsx`) — scopes local stacking |

---

## 1. Concepts (official references)

- **Stacking contexts:** An element with a `z-index` other than `auto` (among other properties) creates a new **stacking context**; descendants only compete within that context. See [MDN — Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context) and [MDN — `z-index`](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index).
- **Tailwind theme:** Map semantic names to numeric layers in `@theme` so utilities stay readable; see [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme) (z-index scale / custom properties).
- **ScrollTrigger `pin`:** Pinning wraps content in a container that can affect layout and stacking; treat pinned sections as **local** scopes — avoid assuming a child’s `z-index` compares globally to fixed chrome. See [GSAP ScrollTrigger — `pin`](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) (pin creates wrapper; combine with `pinSpacing` / layout awareness).
- **Radix portals:** `Dialog.Portal`, `Select`, `Tooltip` content typically renders into `document.body`. Those nodes participate in the **root** stacking context unless given an isolated subtree — so their `z-index` must be **above** fixed app chrome (dock, headers). See [Radix UI — Portal](https://www.radix-ui.com/primitives/docs/utilities/portal) (behavior: attach to body).

---

## 2. Layer table (name → numeric z-index → usage)

| Layer name | z-index | Usage |
|------------|--------:|--------|
| `z-base` / page root | `0` | Main scroll flow wrapper (`relative z-0 isolate` on home shell), default stacking. |
| `z-geo` | `0` | `GeometricBackground` — fixed/absolute canvas behind content (`z-index: 0` inline today). |
| `z-local-low` | `1`–`10` | In-section backgrounds, gradients, hero underlays — **local** only. |
| `z-local-mid` | `11`–`30` | Section content rails, images, non-chrome overlays inside a section. |
| `z-local-high` | `31`–`45` | **Shutter / wipe overlays** (Expertise, Validation), expertise transition shell — must stay **below** app chrome. |
| `z-header` | `40` | Fixed header chrome (`Header.jsx`) — optional pointer-events-none; keep below dock if both visible. |
| `z-skip` | `53` | Skip / focus affordances — **above `z-dock` (52)** so the control is not covered when focused; **below** cursors — WCAG 2.4.1; z-index does not change tab order. |
| `z-dock` | `52` | `DockNav` — fixed global navigation. |
| `z-cursor-global` | `55` | `GlobalCursor` — above dock for visibility. |
| `z-cursor-dot` | `60` | `CursorDot` — **last in `layout.jsx`**; top of interactive chrome. |
| `z-modal` | `100` | Dialog overlay + content (`dialog.jsx`). Must trap focus **above** page (WCAG 2.4.3 Focus Order). |
| `z-popover` | `110` | Portaled `Select` content, `Tooltip` — above modal layer when stacking nested UI (e.g. select inside dialog: verify in browser; may need equal or higher within same portal tree). |

**WCAG alignment (focus & modals):**

- **Skip link / visible focus:** `z-skip` (53) is **above** `z-dock` (52) so the skip control is not obscured when focused; validate with keyboard-only traversal (WCAG 2.4.1).
- **Modals:** `z-modal` must exceed `z-dock` and cursors if policy says “dialogs always win”; current codebase uses `100` vs dock `52` — **correct direction**. Radix Dialog manages focus trap; z-index only ensures visual stacking matches focus order.

---

## 3. Two bands: `z-local-*` vs `z-app-*`

| Band | Range | Where used |
|------|-------|------------|
| **Local** (`z-local-*`) | **1–45** | Inside `isolate` sections (hero → expertise wipes). Shutter overlays at **45** are **not** the same semantic tier as “app level 45” — they are **capped** so they never compete with `z-dock` (52). |
| **App** (`z-app-*`) | **40+** (non-overlapping semantics) | Fixed chrome (`40` header), dock (`52`), skip (`53`), cursors (`55`/`60`), overlays (`100`/`110`). |

**Conflict resolved:** Internal `z-[45]` in Expertise/Validation is **local-high**, not “halfway to dock.” Do **not** reuse raw `z-50` for local shutters — prefer `z-local-high` / `z-shutter` token mapped to **45** to avoid mental collision with Tailwind’s default `z-50` (50) vs dock (52).

---

## 4. Tailwind v4 `@theme` pattern

**Goal:** Semantic utilities — `z-dock`, `z-modal`, `z-local-high` — not scattered `z-[52]` / `z-100` in JSX.

In `src/app/globals.css`, extend `@theme` with named z-index custom properties, e.g.:

```css
@theme {
  /* …existing tokens… */

  --z-local-low: 10;
  --z-local-mid: 20;
  --z-local-high: 45;
  --z-header: 40;
  --z-skip: 53;
  --z-dock: 52;
  --z-cursor-global: 55;
  --z-cursor-dot: 60;
  --z-modal: 100;
  --z-popover: 110;
}
```

Tailwind v4 maps `--z-*` to `z-*` utilities (see [Tailwind theme customization](https://tailwindcss.com/docs/theme)). After adding tokens, replace raw numeric classes in components with `z-dock`, `z-modal`, etc.

Keep the existing comment block at the top of `globals.css` in sync with this table when values change.

---

## 5. GSAP ScrollTrigger & stacking

- **`pin` / `pinSpacing`:** Pinning can introduce wrapper elements and new stacking contexts. Do not rely on a child’s `z-index` to sort above **fixed** dock unless that child shares the same root stacking context (usually it does **not** when contexts isolate).
- **Recommendation:** Keep **section-level** z-index minimal (`isolate` + local tokens 1–45). Prefer **transform** and **opacity** for ScrollTrigger tweens instead of raising `z-index` to “win” fights — avoids escalation against the global ladder.
- **Expertise / Validation shutters:** Treat as **local-high** (45), inside the section’s isolated subtree, documented in this contract.

---

## 6. React / Next.js: `layout.jsx` order vs portals

**Root:** `ClientLayout` wraps Lenis and renders `GlobalCursor` first inside the inner wrapper, then siblings from `layout.jsx` (see `ClientLayout.jsx`).

**Current order inside `ClientLayout`** (`src/app/layout.jsx`): `GeometricBackground` → `DockNav` → `PageTransition` (children) → `SpeedInsights` → `CursorDot` last.

**Portals:** Radix `Dialog`, `Select`, `Tooltip` render outside the React tree order into `document.body`. They **do not** inherit z-index from siblings in `layout.jsx`; only their **own** classes (`z-modal`, `z-popover`) matter relative to other `body` children. Therefore:

- Portal layers **must** use **app-band** tokens (`z-modal`, `z-popover`) above fixed chrome (`z-dock` 52).
- `CursorDot` last in layout wins among **in-tree** siblings at `z-cursor-dot` (60). Portaled dialog at `z-modal` (100) still paints **above** cursors because portal nodes attach to `body` with the higher layer — verify modals visually on `/hub/chat` (Settings dialog).

---

## 7. Files that encode the ladder (audit anchors)

| File | Notes |
|------|--------|
| `src/app/globals.css` | `@theme` `--z-*` tokens → `z-local-*`, `z-dock`, `z-modal`, … |
| `src/app/layout.jsx` | Geo → Dock → PageTransition → CursorDot order. |
| `src/components/DockNav.jsx` | `z-dock` |
| `src/components/ui/dialog.jsx` | `z-modal` |
| `src/components/ui/select.jsx` | `z-popover` |
| `src/components/ui/tooltip.jsx` | `z-popover` |
| `src/components/SkipButton.jsx` | `z-skip` |
| `src/components/Header.jsx` | `z-header` |
| `src/components/GlobalCursor.jsx` | `z-cursor-global` |
| `src/components/CursorDot.jsx` | `z-cursor-dot` |
| `src/components/ExpertiseSection.jsx` | shutter `z-local-high` |
| `src/components/ValidationSection.jsx` | same + panel `z-local-panel` |
| `src/app/page.jsx` | `relative z-0 isolate` — preserve for local vs app bands |

---

## Verification (a11y + stacking)

1. Keyboard: Tab from load — skip link receives focus; ring not clipped under dock where possible.
2. Open Dialog (e.g. hub Settings) — overlay covers dock; focus trapped until dismiss (Radix).
3. Select / Tooltip above page — portaled `z-popover` above `z-dock`; Select inside dialog still usable.
4. Scroll home — shutters stay in local band; no expertise/validation layer over dock/cursors.
5. **Grep:** `rg "z-[0-9]{2,}|z-\\[" src` — should be empty except `z-0` / intentional exceptions; prefer semantic tokens.

---

*Normative contract — ktgv2.*

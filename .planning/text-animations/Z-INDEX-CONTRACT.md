# Z-index / stacking — UI design contract (ktgv2)

**Scope:** layering only — not a full UI-SPEC.

**Authoritative SSOT:** `.planning/codebase/UI-STACKING-CONTRACT.md` (normative table, MDN/Tailwind/GSAP/Radix refs, verification). **This file** is the GSD UI-researcher excerpt — keep numeric bands aligned with SSOT; do not fork layers in a second place.

**Tokens:** `src/app/globals.css` `@theme` (`--z-local-low` … `--z-popover`).

**Stack:** Next.js 16 App Router, Tailwind v4, GSAP + ScrollTrigger, Lenis, Radix (Dialog, Select, Tooltip).

---

## (A) Semantic layer table

Back → front. **Page-local** stacks only compete inside `isolate` shells (e.g. `src/app/page.jsx`); **app** layers apply to fixed chrome and `document.body` portals.

| Tier name | z-index range | Example components / notes |
|-----------|----------------|------------------------------|
| **Base / geo** | `0` | `GeometricBackground` (`fixed`, behind scroll content); page root / main flow (`relative z-0` where used). |
| **Page-local — low** | `1`–`20` (`z-local-low` / `z-local-mid`) | Hero underlays (`HeroSection`, `HeroImages`), gradient fades (`HeroTransition`, `ExpertiseTransition`), `PhilosophySection` content rail (`z-local-low`). |
| **Page-local — high / panel** | `21`–`45` (`z-local-mid` … `z-local-high`, `z-local-panel`) | Section content rails (`ExpertiseSection` `z-local-mid`), **shutter / wipe overlays** (`ExpertiseSection`, `ValidationSection` `z-local-high`), panel surfaces (`ValidationSection` `z-local-panel`). **Capped at 45** — must not reach fixed-chrome band. |
| **Fixed chrome** | `40`–`70` | `Header.jsx` (`z-header` 40); **`SkipButton.jsx`** (`z-skip` 51) — must sit above main scroll content; `DockNav.jsx` (`z-dock` 52); `GlobalCursor.jsx` (`z-cursor-global` 55, inside `ClientLayout`); `CursorDot.jsx` (`z-cursor-dot` 60) — **last sibling** in `layout.jsx` for in-tree stacking. |
| **Overlays / portals** | `100+` | Radix **Dialog** (`src/components/ui/dialog.jsx` → `z-modal` 100): overlay + content, focus trap, above dock; **Select** / **Tooltip** (`select.jsx`, `tooltip.jsx` → `z-popover` 110): portaled content above nested UI when needed. |

**Numeric shorthand (this repo):** `0–30` *conceptually* page-local (implemented as tokens 10/20/40/45); **`40–70`** fixed chrome + cursors; **`100+`** overlays.

---

## (B) Tailwind v4 `@theme` variable names

**Implemented in this repo** (`src/app/globals.css`):

| Token | Value | Utility |
|-------|------|---------|
| `--z-local-low` | 10 | `z-local-low` |
| `--z-local-mid` | 20 | `z-local-mid` |
| `--z-local-panel` | 40 | `z-local-panel` |
| `--z-local-high` | 45 | `z-local-high` |
| `--z-header` | 40 | `z-header` |
| `--z-skip` | 51 | `z-skip` |
| `--z-dock` | 52 | `z-dock` |
| `--z-cursor-global` | 55 | `z-cursor-global` |
| `--z-cursor-dot` | 60 | `z-cursor-dot` |
| `--z-modal` | 100 | `z-modal` |
| `--z-popover` | 110 | `z-popover` |

**Optional alias style** (if you prefer `--z-index-*` spelling in design docs — map 1:1 to the same values, do not duplicate bands):

`--z-index-base: 0` · `--z-index-local-low: 10` · `--z-index-local-mid: 20` · `--z-index-local-high: 45` · `--z-index-header: 40` · `--z-index-skip: 51` · `--z-index-dock: 52` · `--z-index-cursor-global: 55` · `--z-index-cursor-dot: 60` · `--z-index-modal: 100` · `--z-index-popover: 110`

---

## Accessibility (stacking vs focus)

- **Skip control:** `SkipButton.jsx` uses `z-skip` (51) so the link stays **focusable above** main document content and typical scroll layers; keyboard users must reach it before long fixed chrome obscures focus rings.
- **Modals:** Dialog uses `z-modal` (100) **above** `z-dock` (52); Radix traps focus inside the dialog — z-index must match the **visual** top layer so focus order and perceived order align for sighted users.
- **Select / Tooltip:** Portaled popovers at `z-popover` (110) so dropdowns and tooltips can appear **above** dialog surfaces when nested; verify hub/chat and any dialog that contains `Select`.
- **DOM order vs visual order:** Changing **only** `z-index` does **not** change tab order or screen-reader reading order. **Allowed:** paint order for backgrounds, shutters, chrome, and portaled overlays. **Risky / breaks SR expectations:** moving interactive controls out of DOM order and “fixing” with z-index — keep focusable elements in a logical DOM sequence; use z-index for **visual** layering within the same accessibility tree, not to reorder unrelated regions.

---

## GSAP ScrollTrigger

- Pinned/scrubbed sections (`pin`, `pinSpacing`) create **wrappers and stacking contexts** — a child’s `z-index` only sorts **inside** that context; it does not reliably compete with **fixed** `z-dock` / cursors unless architected at the same root.
- **Rule:** Keep **section-local** z-index **low** (`z-local-*`, effectively **1–45** in this project) and **never** escalate local layers to compete with **fixed chrome (40+)** except deliberate full-viewport overlays that use **app** tokens.
- **`pin` / `pinSpacing`:** Pinning can change layout flow; combining with high local z-index fights dock — prefer **transform/opacity** tweens and **isolate** on the home shell (`page.jsx`) so shutters stay in the **local-high** band without chasing global z-index.

---

## Next.js: `layout.jsx` and portals

- **Render order** (`src/app/layout.jsx`): `ClientLayout` → **`GeometricBackground`** → **`DockNav`** → **`PageTransition`** (children) → `SpeedInsights` → **`CursorDot` last** (comment in file: stay on top of in-tree stacking).
- **`ClientLayout`** (`src/components/ClientLayout.jsx`): wraps `ReactLenis`; **`GlobalCursor`** is the **first** child inside the inner `div`, then layout children (geo, dock, page, cursor dot). Stack is governed by **tokens** (`z-cursor-global` 55 &lt; `z-cursor-dot` 60), not DOM order alone.
- **Portals:** Radix renders Dialog / Select / Tooltip into **`document.body`** — they **do not** inherit z-index from `layout.jsx` siblings. **`z-modal` must exceed `z-dock`** so dialogs always cover the dock; `z-popover` ≥ modal content when popovers must appear on top.

---

## (C) Do not

- **No** arbitrary `z-[9999]` / `z-9999` — use semantic tokens from `@theme`.
- **No** section roots (hero, expertise, validation, philosophy) at z-index that **fights** fixed footer/header/dock bands — keep section effects in **`z-local-*`**.
- **No** raw `z-50` for shutters — collides mentally with Tailwind defaults vs `z-dock` (52); use **`z-local-high`** (45).
- **No** raising ScrollTrigger layers to “win” over dock — fix animation scope (`isolate`, transforms) instead.
- **No** assuming portal z-index inherits from `PageTransition` or `ClientLayout` — set **`z-modal` / `z-popover`** on portal nodes explicitly.

---

## (D) Verification checklist (5 lines)

1. Keyboard: Tab from load — **skip link** visible/focused above page content, not under dock.  
2. Open any **Dialog** — overlay and panel cover **DockNav** and cursors; focus stays trapped until dismiss.  
3. Open **Select** or **Tooltip** inside a dialog — popover appears **above** dialog content, still focusable.  
4. Scroll home through **Expertise / Validation** shutters — wipes stay **below** dock/cursors; no section overlay covers chrome.  
5. Grep `src/` for raw `z-\[` / `z-100` / `z-110` — prefer **`z-local-*`**, **`z-dock`**, **`z-modal`**, **`z-popover`** per `globals.css`.

---

*ktgv2 — z-index contract excerpt for text-animations / implementation agents.*

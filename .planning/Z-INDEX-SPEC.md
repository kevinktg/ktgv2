# Z-INDEX-SPEC — ktgv2 (Next.js 16)

**Status:** draft  
**Normative detail:** `.planning/codebase/UI-STACKING-CONTRACT.md`  
**Implementation:** `src/app/globals.css` `@theme` (`--z-local-low` … `--z-popover`)

Concise layering contract for implementers: **stacking contexts**, **GSAP ScrollTrigger `pin`** (new wrapper/context — local `z-index` does not sort against fixed chrome at the document root), **Radix portals** (`Dialog` / `Select` / `Tooltip` → `document.body` — no z-index inheritance from `layout.jsx`).

---

## Numbered layer table

Back → front. Use **semantic utilities only** (`z-local-*`, `z-dock`, `z-modal`, …), not ad-hoc integers.

| # | Layer name | Numeric band (utility) | Usage rule |
|---|------------|-------------------------|------------|
| **1** | Geometric background | `0` | `GeometricBackground` stays **behind** scroll content; fixed/absolute at base; never promoted above the page shell. |
| **2** | Page content & ScrollTrigger pin scope | `0` (`z-0` + `isolate` on home shell) | Main flow and pinned sections live here; **`pin` creates wrappers / stacking contexts** — treat as **local** scopes; child `z-index` competes **inside** the pin subtree, not globally vs dock. |
| **3** | In-section gradients vs shutters / panels | `10`–`45` (`z-local-low`, `z-local-mid`, `z-local-panel`, `z-local-high`) | Gradients and underlays use **low/mid**; shutters, wipes, and heavy overlays use **`z-local-high` (45)** or **`z-local-panel` (40)** as documented per section — **capped below fixed-chrome band** (next rows). |
| **4** | Fixed chrome (header, dock) | `40` (`z-header`), `52` (`z-dock`) | `Header` and `DockNav` are **app**-level fixed layers; dock **above** header numerically; do not push section effects into this band. |
| **5** | Skip & focus affordances | `53` (`z-skip`) | **Above `z-dock`** so focused skip is not obscured (WCAG 2.4.1); **below** cursors (`55`/`60`). |
| **6** | Cursor layers | `55` (`z-cursor-global`), `60` (`z-cursor-dot`) | Global cursor below dot; **`CursorDot` last** in `layout.jsx` among in-tree siblings; both **below** portaled modal/popover. |
| **7** | Radix portal stack (body) | `100` (`z-modal`), `110` (`z-popover`) | **Dialog** at `z-modal`; **Select** / **Tooltip** at `z-popover` when nested. Portals **must** exceed app chrome; they do **not** inherit z-index from React tree order. |

---

## Accessibility (stacking vs behaviour)

- **Modal above dock:** `z-modal` (100) > `z-dock` (52) so the dialog **paints** as the top interactive surface; **Radix Dialog** provides **focus trap** and **restore focus** — z-index only aligns **visual** order with **focus order** for sighted users.
- **Popover inside modal:** Keep `z-popover` (110) so portaled dropdowns/tooltips can appear **above** dialog content; verify keyboard focus still moves correctly in hub/chat Settings and similar.
- **Tab order:** Changing `z-index` does **not** change DOM tab order; do not “fix” broken order with z-index alone.

---

## Do not

- **No** magic values such as `z-[9999]`, `z-9999`, or unexplained `z-[n]` — use `@theme` tokens.
- **No** raising ScrollTrigger-driven layers to “beat” the dock — use **`isolate`**, **transform/opacity** tweens, and **local** tokens (≤45) instead.
- **No** raw `z-50` for shutters — collides with mental model vs `z-dock` (52); use **`z-local-high`**.
- **No** assuming portaled nodes pick up z-index from `PageTransition` / `ClientLayout` — set **`z-modal` / `z-popover`** on the portal content/overlay classes explicitly.

---

*Planning fragment — keep in sync with `UI-STACKING-CONTRACT.md` and `globals.css`.*

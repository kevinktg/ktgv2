# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- React components: `PascalCase.jsx` under `src/components/` (e.g., `HeroSection.jsx`, `ClientLayout.jsx`).
- App Router routes: `page.jsx`, `layout.jsx`, `template.jsx`, `not-found.jsx` in `src/app/`; dynamic segments use bracket folders (e.g., `src/app/blog/[slug]/page.jsx`).
- Utilities: `camelCase.js` (e.g., `src/lib/wordpress.js`, `src/lib/utils.js`).
- UI primitives: `kebab-case` filenames matching shadcn-style (e.g., `src/components/ui/navigation-menu.jsx`).

**Functions:**
- `camelCase` for functions and hooks (`fetchWithTimeout`, `getPosts`).
- Event handlers: `handle*` where used (e.g., `handleScroll` in `src/components/HeroSection.jsx`).

**Variables:**
- `camelCase` for locals and props; `UPPER_SNAKE` for module-level constants (e.g., `WORDPRESS_URL`, `REQUEST_TIMEOUT` in `src/lib/wordpress.js`).

**Types:**
- JavaScript only (`.jsx` / `.js`); JSDoc recommended for public helpers per `AGENTS.md`.
- No TypeScript interfaces in source today.

## Code Style

**Formatting:**
- No committed Prettier config (`.prettierrc` not present); match existing files: 2-space indent, double quotes common in components.
- Target line length: under 100 characters per `AGENTS.md`.

**Linting:**
- Command: `npm run lint` → `next lint` (`package.json`).
- `eslint` ^9 is a devDependency; **no** `eslint.config.*` or `.eslintrc*` in repo—rules come from Next.js ESLint integration when you run `next lint`.
- Add a flat config only if you need project-specific rules; until then, follow `AGENTS.md` and patterns below.

## Import Organization

**Order (prescriptive, per `AGENTS.md`):**
1. React / `react/*`
2. Next.js (`next/image`, etc.)
3. Third-party (`gsap`, `@gsap/react`, UI libs)
4. Local: `@/…` alias then relative (`./SplitText`)

**Path aliases:**
- `@/*` → `src/*` via `jsconfig.json` (`compilerOptions.paths`).

**Exports:**
- Named exports for shared components: `export const HeroSection = …` in `src/components/HeroSection.jsx`.
- Default exports for App Router pages: `export default function Page()` in `src/app/**/page.jsx`.

## Error Handling

**Strategy:** Graceful degradation for CMS/network; log with `console.error`, return safe fallbacks (empty arrays, boolean false).

**Patterns (match `src/lib/wordpress.js`):**
- Wrap `fetch` in `try/catch`; on failure log context (status, URL snippet) and return `[]` or `false` rather than throwing to the UI layer.
- Use `fetchWithTimeout` + `AbortController` for bounded waits; treat `AbortError` distinctly when needed.
- On non-OK responses, attempt fallbacks when documented (e.g., retry without `_embed` on 403).
- Parse helpers: validate shapes (e.g., `Array.isArray(data)`) before use.

**UI:**
- Guard renders with null/undefined checks; avoid crashing on missing WordPress fields.

**Logging:**
- Prefer `console.error` for failures; `AGENTS.md` says avoid `console.log` in production-facing noise—use errors for diagnosable paths.

## Comments

**When to comment:**
- Section markers for animation blocks (e.g., `// --- 1. INITIAL ANIMATE IN ---`) per `AGENTS.md`.
- Explain non-obvious behavior (session intro skip, Lenis vs native scroll) where logic is dense.

**TODO/FIXME:** Use sparingly; link issues when adding debt.

## Component & Animation Conventions

**Client components:** `"use client";` at top when using hooks, GSAP, or browser APIs (`src/components/HeroSection.jsx`).

**Refs:** `forwardRef` for components that expose DOM refs; combine with inner `useRef` when needed.

**GSAP:** `useGSAP` from `@gsap/react` with `{ scope: containerRef }`; register `ScrollTrigger`; animate transform/opacity only; cleanup via hook—see `AGENTS.md` examples.

**Styling:** Tailwind CSS v4 utilities; shared tokens/custom layers in `src/app/globals.css`.

## Module Design

**Barrel files:** Some folders use `index.js` re-exports (e.g., `src/components/shadcn-studio/card/index.js`)—keep consistent within each feature folder.

**State:** `useState` / `useRef` / `useEffect` for local concerns; `AGENTS.md` documents props drilling—note `zustand` is listed in `package.json` but not imported under `src/` (verify before introducing global stores).

---

*Convention analysis: 2026-03-21*
*Update when patterns change*

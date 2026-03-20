# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- JavaScript (JSX) — Application code under `src/` (`.jsx` components and pages), Next.js App Router routes in `src/app/`, shared utilities in `src/lib/` and `src/components/`.

**Secondary:**
- CSS — Global styles and Tailwind v4 theme in `src/app/globals.css` (`@import "tailwindcss"`, `@theme`, `@layer`).
- JSON — Configuration (`package.json`, `jsconfig.json`, `vercel.json`).

## Runtime

**Environment:**
- Node.js — CI uses Node 20 (`.github/workflows/deploy.yml`). No `engines` field in `package.json` and no `.nvmrc`; align local Node with CI (20.x) for parity.

**Package Manager:**
- npm — Primary workflow: `package-lock.json` present; GitHub Actions runs `npm ci` (`.github/workflows/deploy.yml`).
- `pnpm-lock.yaml` is also present at the repo root; treat as duplicate/secondary unless the team standardizes on pnpm (avoid mixing `npm ci` and `pnpm` without a decision).

## Frameworks

**Core:**
- Next.js `^16.1.1` — App Router, `next build` / `next dev` (`package.json` scripts).
- React `19.2.0` / `react-dom` `19.2.0` — UI layer.

**Testing:**
- Not configured — No Jest/Vitest/Playwright in `package.json`; `AGENTS.md` documents manual testing only.

**Build/Dev:**
- Tailwind CSS `^4.1.18` with `@tailwindcss/postcss` — PostCSS pipeline in `postcss.config.mjs`.
- `@tailwindcss/typography` (dev) — Typography plugin for prose-style content.
- ESLint `^9` (dev) — Invoked via `npm run lint` (`next lint`). No committed `.eslintrc*` or `eslint.config.*` at repo root; Next.js supplies defaults unless extended later.

## Key Dependencies

**Critical:**
- `next`, `react`, `react-dom` — Core framework and rendering.
- `gsap`, `@gsap/react` — Timeline and scroll-driven animation; used with ScrollTrigger patterns in components (see `src/components/`).
- `lenis` — Smooth scrolling; integrated with GSAP in `src/libs/lenis.jsx` and wrapped in `src/components/ClientLayout.jsx`.
- `@react-three/fiber`, `@react-three/drei`, `three` — WebGL/Three.js hero content (e.g. `src/components/HeroImages.jsx`).
- `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` — UI primitives and styling helpers under `src/components/ui/`.

**Infrastructure / platform:**
- `@vercel/speed-insights` — Vercel Speed Insights component in `src/app/layout.jsx`.

**Declared but not referenced in `src/` (verify before relying on):**
- `ai`, `@ai-sdk/openai` — Vercel AI SDK packages in `package.json`; no imports under `src/` at analysis time (historical chat API may have been removed; see git status for `src/app/api/chat/route.js`).
- `zustand` — Listed in `package.json`; no `zustand` imports found under `src/`.

**Tooling (dev):**
- `puppeteer` — Used by `scripts/scroll-screenshot.js` for local scroll/screenshot automation (not production runtime).

## Configuration

**Environment:**
- Public configuration via `NEXT_*` variables (see `INTEGRATIONS.md`). Do not commit `.env` files; values belong in Vercel dashboard or local `.env.local` (gitignored if added).

**Build:**
- `next.config.js` — `outputFileTracingRoot` to lock tracing to this package root; `images.remotePatterns` for `ktg.one` and WordPress/media host; `turbopack.root`; `experimental.optimizeCss`; `reactStrictMode`.
- `postcss.config.mjs` — Tailwind PostCSS plugin only.
- `jsconfig.json` — Path alias `@/*` → `./src/*`.

## Platform Requirements

**Development:**
- Node.js 20.x recommended (matches CI).
- `npm install` for local dev; Vercel production install uses `npm install --legacy-peer-deps` per `vercel.json` (resolve peer dependency conflicts the same way locally if builds diverge).

**Production:**
- Vercel — Next.js framework preset (`vercel.json`), region `iad1`, deploy script `npm run deploy` (`package.json`).

---

*Stack analysis: 2026-03-21*

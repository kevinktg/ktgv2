# Technology Stack

**Analysis Date:** 2026-03-23

> **2026-04 routing truth:** **One** deployable Next.js app. **`src/app/ulti-chat/`** removed. Integrated hub chat uses **root** dependencies (`ai`, `@ai-sdk/*`) in **`src/app/hub/chat/`** (JSX) + **`src/app/api/hub/chat/route.js`**. Rows below that mention a separate “ulti-chat” version refer to **`_reference/ulti-chat/`** (historical / local-only) unless stated otherwise.

## Languages

**Primary:**
- JavaScript (JSX) — Main app (`src/app/`, `src/components/`, `src/lib/`) uses `.js` and `.jsx` files, not TypeScript
- TypeScript — **only** if still present under **`_reference/ulti-chat/`** (not part of App Router builds)

**Secondary:**
- None (CSS handled via Tailwind)

## Runtime

**Environment:**
- Node.js (version not explicitly pinned in `.nvmrc`, inferred from Next.js 16 compatibility: 18+)

**Package Manager:**
- npm (uses `npm install --legacy-peer-deps` per Vercel build config in `vercel.json`)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.1 (main app) — Full-stack React framework with App Router, Server/Client Components
- Next.js 15.4.9 (ulti-chat sub-app) — Standalone instance deployed separately
- React 19.2.0 (main app) — Component library
- React 19.2.1 (ulti-chat) — Slightly newer patch

**Styling & UI:**
- Tailwind CSS 4.1.18 (main app) — Utility-first CSS framework with PostCSS
- Tailwind CSS 4.1.11 (ulti-chat) — Slightly older version
- @tailwindcss/postcss 4.1.18 (main app)
- @tailwindcss/postcss 4.1.11 (ulti-chat)
- @tailwindcss/typography 0.5.19 (both apps) — Prose component styling
- Autoprefixer 10.4.21 (ulti-chat) — CSS vendor prefixing

**Animation:**
- GSAP 3.13.0 (main app) — JavaScript animation library
- @gsap/react 2.1.2 (main app) — React hooks for GSAP
- Motion 12.23.24 (ulti-chat) — Modern animation library for React

**Scroll:**
- Lenis 1.3.15 (main app) — Smooth scrolling library (instantiated in `src/lib/lenis.jsx`)

**3D Graphics:**
- Three.js 0.182.0 (main app) — 3D JavaScript library
- @react-three/fiber 9.5.0 (main app) — React renderer for Three.js
- @react-three/drei 10.7.7 (main app) — Useful helpers for react-three/fiber
- Simplex-noise 4.0.3 (main app) — Noise generation for procedural backgrounds

**UI Components:**
- shadcn/ui primitives (Radix UI components, main app):
  - @radix-ui/react-accordion 1.2.12
  - @radix-ui/react-label 2.1.8
  - @radix-ui/react-navigation-menu 1.2.14
  - @radix-ui/react-separator 1.1.8
  - @radix-ui/react-slot 1.2.4
  - @radix-ui/react-tooltip 1.2.8
- Radix UI components (ulti-chat):
  - @radix-ui/react-avatar 1.1.11
  - @radix-ui/react-dialog 1.1.15
  - @radix-ui/react-scroll-area 1.2.10
  - @radix-ui/react-separator 1.1.8
  - @radix-ui/react-slot 1.2.4
  - @radix-ui/react-switch 1.2.6
  - @radix-ui/react-tooltip 1.2.8
- cmdk 1.1.1 (ulti-chat) — Command/search menu component
- Lucide-react 0.487.0 (main app) / 0.577.0 (ulti-chat) — Icon library

**Markdown & Content:**
- react-markdown 10.1.0 (both apps) — Markdown rendering
- remark-gfm 4.0.1 (both apps) — GitHub Flavored Markdown support

**Utilities:**
- clsx 2.1.1 (both apps) — Conditional class name utility
- tailwind-merge 3.4.0 (main app) / 3.3.1 (ulti-chat) — Merge Tailwind classes
- class-variance-authority 0.7.1 (both apps) — Component style variants

**Testing:**
- Not configured (no test framework detected)

**Build/Dev:**
- Turbopack (Next.js 16 bundler, configured in `next.config.js`)
- SWC (JavaScript compiler, used by Next.js 16):
  - @swc/core 1.15.8 (dev)
  - @swc/cli 0.7.9 (dev)
  - @swc/helpers 0.5.18

**Linting:**
- ESLint 9 (main app) / 9.39.1 (ulti-chat)
- eslint-config-next 16.0.8 (ulti-chat)

## Key Dependencies

**Critical:**
- `@vercel/blob` 2.0.0 — Cloud file storage (stores snippet markdown files)
- `@vercel/postgres` 0.10.0 — Managed PostgreSQL database
- `postgres` 3.4.8 — PostgreSQL client (used by Drizzle ORM)
- `drizzle-orm` 0.45.1 — TypeScript ORM for type-safe database queries
- `drizzle-kit` 0.31.8 — Migration tooling for Drizzle

**AI & APIs:**
- `@google/genai` — dependency may remain for non–hub-chat usage; **hub chat** uses **Vercel AI SDK** (`ai`, `@ai-sdk/google`, `@ai-sdk/anthropic`, `@ai-sdk/openai` per root `package.json`)
- `@ai-sdk/*` + `ai` (main app) — streaming chat, tools, **`/api/hub/chat`**

**Infrastructure:**
- `zustand` 4.5.7 (main app) — Lightweight state management
- Vercel Speed Insights (`@vercel/speed-insights` 1.0.2) — Performance monitoring

## Configuration

**Environment:**
- `.env.local` — Development environment variables (`.env.example` not found in main app root)
- `POSTGRES_URL` — Vercel Postgres connection string
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob read/write token
- `NEXT_PUBLIC_WORDPRESS_URL` — External WordPress blog URL (optional, defaults to `https://lawngreen-mallard-558077.hostingersite.com`)

**`_reference/ulti-chat` (if kept locally):** May document its own env vars — **not** the Vercel hub contract.

**Build:**
- `next.config.js` (main app) — Optimizations: Turbopack, image optimization, output file tracing
- `drizzle.config.js` — Database schema location and PostgreSQL dialect
- `jsconfig.json` — Path alias `@/*` maps to `./src/*`
- `vercel.json` — Deployment config for main app: Node.js region, npm legacy peer deps flag

**Post-CSS:**
- `postcss.config.mjs` (root) — PostCSS configuration for Tailwind

## Platform Requirements

**Development:**
- Node.js 18+ (inferred from Next.js 16 support)
- npm 8+ (for `--legacy-peer-deps` flag)

**Production:**
- Vercel deployment (main app) — Primary host for `ktg.one` (**includes hub chat**)
- **Optional legacy:** A standalone ulti-chat deploy (e.g. Cloud Run) is **out of scope** for this repo’s App Router — see `_reference/` if it exists
- Vercel Postgres — Managed PostgreSQL database
- Vercel Blob — File storage service
- External WordPress instance at `lawngreen-mallard-558077.hostingersite.com` — Blog data source

---

*Stack analysis: 2026-03-23*

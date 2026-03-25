# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # Start dev server (Next.js 16 with Turbopack)
pnpm build         # Production build
pnpm lint          # ESLint via next lint
pnpm deploy        # Deploy to Vercel production
pnpm extract-snippets  # Extract DOCS content into Vercel Blob + Postgres
```

No test suite is configured. Use `pnpm dev` and browser to verify changes.

## Architecture

**Stack:** Next.js 16, React 19, JSX (not TSX — main app is `.jsx`), Tailwind CSS v4, GSAP + ScrollTrigger, Lenis smooth scroll, Drizzle ORM + Vercel Postgres, Vercel Blob, shadcn/ui primitives.

**Entry point:** `src/app/layout.jsx` — the root layout wraps everything in `<ClientLayout>` and mounts four globals that persist across all pages:
- `GeometricBackground` (fixed, behind all content)
- `DockNav` (floating icon dock nav)
- `CursorDot` — must remain **last** in the render tree to stay above all stacking contexts
- Fonts: Syne (`--font-syne`) for branding/headings, Inter (`--font-inter`) for body

**Pages:**
- `/` — Homepage: HeroSection, ExpertiseSection, PhilosophySection, ContactCTA
- `/blog`, `/blog/[slug]` — Blog backed by external WordPress instance (`lawngreen-mallard-558077.hostingersite.com`); fetched via `src/lib/wordpress.js`
- `/expertise` — Expertise detail page
- `/validation` — Validation/credentials section
- `/hub` — Redirects to `/hub/snippets`; tool hub entry point
- `/hub/snippets` — Snippet browser; client component that fetches from `/api/hub/snippets`

**Hub data layer:**
- Snippet metadata stored in Vercel Postgres via Drizzle ORM (`src/lib/db/schema.js` — single `snippets` table)
- Snippet content stored in Vercel Blob (URL referenced in `blob_url` column)
- API routes at `src/app/api/hub/snippets/` (list + `[id]` CRUD)
- `scripts/extract-snippets.js` populates the DB from local DOCS files

**Component layout:**
- `src/components/` — Page section components + global UI (`DockNav`, `CursorDot`, `GeometricBackground`, `ClientLayout`)
- `src/components/hub/` — Hub-specific components (`SnippetCard`, `SnippetViewer`)
- `src/components/ui/` — shadcn/ui primitives (accordion, badge, button, card, etc.)
- `src/components/shadcn-studio/` — Extended shadcn variants
- `src/lib/` — `db/` (Drizzle schema + client), `snippets/storage.js` (Vercel Blob), `wordpress.js` (WP REST client), `utils.js`, `lenis.jsx`

**ulti-chat** (`src/app/ulti-chat/`) — A standalone Next.js 15 AI chat app (Google Gemini via `@google/genai`) built in AI Studio. It has its own `package.json`, `next.config.ts`, and app router. It lives inside the main repo but is **not yet integrated** — do not import from it or modify it without explicit instruction.

## Key Conventions

- **Fonts in CSS/JSX:** Always use `font-[family-name:var(--font-syne)]` for Syne, not `font-syne` directly.
- **Color scheme:** Black background (`bg-black`), white text, cyan `#00f0ff` accent for interactive/AI elements.
- **GSAP animations:** Use `@gsap/react` hooks (`useGSAP`). All ScrollTrigger instances must be cleaned up on unmount. Prefer `will-change: transform` on animated elements.
- **Lenis:** Instantiated globally in `src/lib/lenis.jsx`; use the exported context/hook to access the instance — do not create new Lenis instances per component.
- **"use client" boundary:** Layout globals are server components; anything using GSAP, scroll, or browser APIs needs `"use client"`.
- **Lowercase styling:** UI text is styled lowercase via Tailwind — this is intentional brand convention, not a bug.

## OpenMemory (mem0) Protocol

The `.cursor/rules/openmemory.mdc` rule requires mem0 searches **before and during** any code implementation task (`project_id: kevinktg/ktgv2`). For any code change:
1. Search mem0 for relevant patterns/preferences before starting
2. Search at checkpoints (new file, new function, architecture decision)
3. Store implementation memory on completion

This applies to code tasks only — skip for discussion or information retrieval.

## Environment

Required env vars (`.env.local`):
- `POSTGRES_URL` — Vercel Postgres connection string
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token
- AI SDK keys as needed for hub features

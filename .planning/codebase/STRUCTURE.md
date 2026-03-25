# Codebase Structure

**Analysis Date:** 2026-03-23

## Directory Layout

```
ktgv2/
├── src/
│   ├── app/                          # Next.js 16 App Router (main site)
│   │   ├── layout.jsx                # Root server layout (fonts, globals, metadata)
│   │   ├── page.jsx                  # Homepage (hero + sections)
│   │   ├── template.jsx              # Page transition wrapper
│   │   ├── globals.css               # Tailwind directives + CSS variables
│   │   ├── api/
│   │   │   └── hub/
│   │   │       └── snippets/
│   │   │           ├── route.js      # GET/POST snippets
│   │   │           └── [id]/
│   │   │               └── route.js  # GET/PUT/DELETE single snippet
│   │   ├── blog/
│   │   │   ├── page.jsx              # Blog index (fetches WordPress)
│   │   │   ├── [slug]/
│   │   │   │   └── page.jsx          # Blog detail page
│   │   │   ├── not-found.jsx         # Blog 404
│   │   │   └── (static posts cached)
│   │   ├── expertise/
│   │   │   └── page.jsx              # Expertise detail page
│   │   ├── hub/
│   │   │   ├── page.jsx              # Hub index (redirects to /hub/snippets)
│   │   │   ├── README.md             # Hub documentation
│   │   │   └── snippets/
│   │   │       ├── page.jsx          # Snippet browser (grid view)
│   │   │       └── [id]/
│   │   │           └── page.jsx      # Snippet detail (markdown view)
│   │   ├── validation/
│   │   │   └── page.jsx              # Credentials/validation section
│   │   ├── components/               # Page-scoped components (UI primitives)
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── switch.tsx
│   │   │       └── (shadcn primitives)
│   │   └── ulti-chat/                # ⚠️ ISOLATED: Standalone Next.js 15 project
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx          # Gemini AI chat interface
│   │       │   └── globals.css
│   │       ├── hooks/
│   │       │   └── use-mobile.ts
│   │       ├── lib/
│   │       │   └── utils.ts
│   │       ├── package.json          # Separate dependency manifest
│   │       ├── tsconfig.json         # TypeScript config (ulti-chat only)
│   │       ├── next.config.ts
│   │       ├── metadata.json
│   │       ├── components.json
│   │       ├── .eslintrc.json
│   │       └── (has own build system)
│   ├── components/                   # Global, reusable components
│   │   ├── ClientLayout.jsx          # Lenis + GlobalCursor wrapper
│   │   ├── GeometricBackground.jsx   # Fixed bg with animated gradient
│   │   ├── CursorDot.jsx             # Custom cursor overlay (MUST be last in tree)
│   │   ├── DockNav.jsx               # Floating icon navigation
│   │   ├── GlobalCursor.jsx          # Cursor event listener
│   │   │
│   │   ├── HeroSection.jsx           # Hero with intro animation
│   │   ├── HeroTransition.jsx        # Wipe transition effect
│   │   ├── HeroImages.jsx            # Three.js particle effects (lazy loaded)
│   │   ├── ExpertiseSection.jsx      # Expertise cards section
│   │   ├── ExpertiseTransition.jsx   # Wipe transition
│   │   ├── ValidationSection.jsx     # Horizontal scroll section
│   │   ├── PhilosophySection.jsx     # Parallax quotes
│   │   ├── ContactCTA.jsx            # Contact form
│   │   ├── Footer.jsx                # Footer links
│   │   ├── BlogPreview.jsx           # WordPress post preview card
│   │   ├── ToolsSection.jsx          # AI tools showcase
│   │   ├── PageTransition.jsx        # Route transition effect
│   │   ├── ScrollTransition.jsx      # Scroll-triggered transition
│   │   ├── SkipButton.jsx            # Intro skip button
│   │   ├── SplitText.jsx             # Text animation utility
│   │   ├── Header.jsx                # Page header
│   │   │
│   │   ├── hub/
│   │   │   ├── SnippetCard.jsx       # Snippet card in grid
│   │   │   └── SnippetViewer.jsx     # Snippet markdown viewer
│   │   ├── ui/                       # shadcn/ui primitives (Radix + Tailwind)
│   │   │   ├── accordion.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── matter-button.jsx
│   │   │   ├── navigation-menu.jsx
│   │   │   ├── separator.jsx
│   │   │   ├── skeleton.jsx
│   │   │   ├── textarea.jsx
│   │   │   └── tooltip.jsx
│   │   └── shadcn-studio/            # Extended shadcn variants
│   │       ├── button/
│   │       │   └── button-48.jsx
│   │       └── card/
│   │           └── card-16.jsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.js              # Drizzle ORM client (Vercel Postgres)
│   │   │   └── schema.js             # Drizzle schema (snippets table)
│   │   ├── snippets/
│   │   │   ├── queries.js            # Drizzle queries (getAllSnippets, getSnippetById, searchSnippets, createSnippet)
│   │   │   └── storage.js            # Vercel Blob operations (getSnippetContent, uploadSnippet)
│   │   ├── wordpress.js              # WordPress REST client (fetch posts)
│   │   ├── utils.js                  # Utility functions (cn, clsx, etc.)
│   │   └── usePrefersReducedMotion.js # Motion preference hook
│   ├── libs/
│   │   └── lenis.jsx                 # Lenis scroll instance + context (note: 'libs' not 'lib')
│   └── (no app validation folder — validation content is a page)
├── public/
│   ├── assets/
│   │   ├── ktg.svg                   # Logo
│   │   ├── og-image.jpg              # OpenGraph preview
│   │   ├── top-hero.webp             # Hero image
│   │   ├── bottom-hero.webp          # Hero image
│   │   ├── chat.webp                 # AI chat screenshot
│   │   ├── (model logos: claude, gemini, grok, deepseek, etc.)
│   │   ├── (shapes: shape1.svg, shape2.svg, etc.)
│   │   ├── teamllm.mp4               # Video asset
│   │   └── archive/                  # Legacy image assets
│   └── robots.txt
├── scripts/
│   ├── extract-snippets.js           # CLI: Populate Postgres from DOCS
│   └── scroll-screenshot.js          # Utility script
├── .planning/
│   ├── codebase/                     # Architecture docs (this directory)
│   │   ├── ARCHITECTURE.md
│   │   └── STRUCTURE.md
│   ├── phases/                       # Implementation phase plans
│   ├── research/                     # Research notes
│   └── todos/
├── package.json                      # Root dependencies (Next.js 16, React 19, etc.)
├── next.config.js                    # Next.js config (image remoting, turbopack, build optimization)
├── jsconfig.json                     # Path aliases (@/* → ./src/*)
├── .env.local                        # Secrets (POSTGRES_URL, BLOB_READ_WRITE_TOKEN, AI SDK keys)
├── tailwind.config.js                # Tailwind CSS v4 config
├── .eslintrc.js                      # ESLint config
├── .cursor/
│   └── rules/                        # Cursor IDE rules (openmemory.mdc, etc.)
├── .vscode/                          # VS Code settings
├── .vercel/                          # Vercel deployment config
├── .github/
│   └── workflows/                    # CI/CD pipelines
└── docs/                             # Documentation (analysis, plans, superpowers)
```

## Directory Purposes

### `src/app/` — Next.js App Router (Main Site)

**Purpose:** All routable pages and API endpoints

**Contains:**
- **layout.jsx**: Root layout that wraps entire app; loads fonts; mounts global components
- **page.jsx**: Homepage with hero + expertise + validation + philosophy + contact sections
- **template.jsx**: Page transition effects (wraps all route changes)
- **globals.css**: Tailwind directives, CSS variable definitions (`--font-syne`, `--font-inter`, color tokens)
- **api/hub/snippets/**: CRUD endpoints for snippet management (backed by Drizzle + Blob)
- **blog/**: Blog pages fetching from WordPress REST API
- **expertise/, validation/, hub/**: Static/semi-dynamic pages
- **ulti-chat/**: ⚠️ Isolated Next.js 15 project (do not import from main app)

### `src/components/` — Global Components

**Purpose:** Reusable components shared across pages

**Contains:**
- **Layout components**: `ClientLayout` (Lenis wrapper), `GlobalCursor`, `CursorDot`, `DockNav`
- **Background**: `GeometricBackground` (fixed, animated, cursor-reactive)
- **Page sections**: `HeroSection`, `ExpertiseSection`, `ValidationSection`, `PhilosophySection`, `ContactCTA`, `Footer`
- **Transitions**: `HeroTransition`, `ExpertiseTransition`, `PageTransition`, `ScrollTransition`
- **Hub**: `SnippetCard`, `SnippetViewer`
- **UI primitives**: `ui/` (shadcn exports), `shadcn-studio/` (extended variants)

**Key files:**
- `CursorDot.jsx`: Must be **last** child of `<ClientLayout>` to stay on top of all z-index stacking contexts
- `HeroImages.jsx`: Lazy loaded; uses Three.js for particle/3D effects

### `src/lib/` — Business Logic & Data Access

**Purpose:** Queries, external API clients, utilities

**Contains:**
- **db/**: Drizzle ORM client and schema for Vercel Postgres (snippets table)
- **snippets/**: Query and storage layers (getAllSnippets, createSnippet, uploadSnippet)
- **wordpress.js**: WordPress REST client for fetching blog posts
- **utils.js**: Helper utilities (classNameMerge via clsx, type guards, etc.)
- **usePrefersReducedMotion.js**: Hook for respecting motion preferences

### `src/libs/` — Global Context/Providers

**Purpose:** Singletons and context providers (note: named `libs` not `lib`)

**Contains:**
- **lenis.jsx**: Exports Lenis scroll instance and context hook; imported into `ClientLayout`

### `public/` — Static Assets

**Purpose:** Images, videos, SVGs (served by CDN)

**Contains:**
- **assets/**: Logos, hero images, model icons, background shapes, videos
- **robots.txt**: SEO

### `scripts/` — Utility Scripts

**Purpose:** CLI commands for operations outside normal app flow

**Contains:**
- **extract-snippets.js**: One-time script to extract DOCS files into Postgres + Blob
- **scroll-screenshot.js**: Browser automation for screenshots

## Key File Locations

### Entry Points

- `src/app/layout.jsx` — Root server layout (loads fonts, mounts globals)
- `src/app/page.jsx` — Homepage
- `src/components/ClientLayout.jsx` — Client-side wrapper (Lenis + cursor)

### Configuration

- `next.config.js` — Next.js build config (image remoting, turbopack, optimization)
- `jsconfig.json` — Path aliases (`@/*` → `./src/*`)
- `package.json` — Dependencies and build scripts
- `.env.local` — Secrets (POSTGRES_URL, BLOB_TOKEN, API keys)
- `tailwind.config.js` — Tailwind CSS configuration

### Core Logic

- `src/lib/db/schema.js` — Drizzle schema definition (snippets table)
- `src/lib/snippets/queries.js` — Database queries (Drizzle)
- `src/lib/snippets/storage.js` — Vercel Blob operations
- `src/lib/wordpress.js` — WordPress REST API client

### Testing

**Not configured.** No Jest, Vitest, or test suite. Verification is manual via `npm run dev` and browser.

## Naming Conventions

### Files

- **Page routes**: `page.jsx` (lowercase)
- **Layout components**: `ComponentName.jsx` (PascalCase)
- **Utility files**: `snake-case.js` (e.g., `wordpress.js`, `usePrefersReducedMotion.js`)
- **API routes**: `route.js` (lowercase)
- **Styles**: `globals.css`, component-scoped styles via Tailwind or `module.css` (none present; all Tailwind)
- **shadcn primitives**: `component-name.jsx` (kebab-case in filename, exported as PascalCase)

### Directories

- **Feature grouping**: `[feature]/` (e.g., `hub/`, `blog/`)
- **Route segments**: `[bracket]/` for dynamic routes (e.g., `[slug]/`)
- **Utility**: `lib/`, `libs/`, `components/`, `scripts/`

### Functions & Components

- **React components**: PascalCase (e.g., `HeroSection`, `SnippetCard`)
- **Hooks**: `use*` (e.g., `usePrefersReducedMotion`)
- **Utilities**: camelCase (e.g., `getAllSnippets`, `uploadSnippet`)

### CSS & Styling

- **Tailwind**: Use full class names; no abbreviations
- **Font variables**: `--font-syne`, `--font-inter`
- **Colors**: Use CSS variables or hardcoded hex (`#00f0ff`)
- **Text**: Lowercase styling via Tailwind (brand convention)

## Where to Add New Code

### New Route/Page

**Location pattern:** `src/app/[path]/page.jsx`

Example: Adding a new "Services" page at `/services`:
```
src/app/services/page.jsx          # Main page
src/components/ServicesSection.jsx # Section component (optional)
```

**Checklist:**
- Use JSX (not TSX) in the main app
- Import global fonts via `--font-syne` and `--font-inter`
- Wrap in `"use client"` if using hooks, GSAP, or browser APIs
- Organize sections in `src/components/`

### New Component

**Location pattern:** `src/components/ComponentName.jsx` (global) or `src/app/[feature]/components/` (feature-scoped)

Example: Adding a modal to the hub:
```
src/components/hub/SnippetModal.jsx
```

**Checklist:**
- Use JSX syntax
- Default export: `export default function ComponentName(props) { ... }`
- Import Tailwind classes and shadcn primitives
- Use `cn()` utility from `@/lib/utils` to merge classNames

### New API Route

**Location pattern:** `src/app/api/[path]/route.js`

Example: Adding a new `/api/blog/posts` endpoint:
```
src/app/api/blog/posts/route.js
```

**Checklist:**
- Export named functions: `export async function GET()`, `export async function POST()`, etc.
- Use `NextResponse` for responses
- Delegate logic to `src/lib/` (queries, transformations)
- Handle errors with try/catch; log to console

### New Database Query

**Location pattern:** `src/lib/[feature]/queries.js`

Example: Adding a query for user subscriptions:
```
src/lib/subscriptions/queries.js

export async function getUserSubscription(userId) {
  return await db.select().from(subscriptions).where(eq(subscriptions.user_id, userId));
}
```

**Checklist:**
- Use Drizzle ORM syntax
- Document parameter types in JSDoc comment
- Return raw query results or null
- API route handles transformation and response

### New External API Integration

**Location pattern:** `src/lib/[service-name].js`

Example: Adding a Slack webhook client:
```
src/lib/slack.js

export async function sendSlackMessage(channel, message) {
  // Implementation
}
```

**Checklist:**
- Wrap in a single file or `src/lib/[service]/` directory
- Use environment variables for credentials
- Handle errors and retries

### Styling: New Tailwind Component

**Do not create component CSS files.** Use Tailwind utilities in JSX:

```jsx
// ✅ Correct
<button className="px-4 py-2 bg-[#00f0ff] text-black rounded hover:bg-[#00f0ff]/80">
  Click me
</button>

// ❌ Don't do this:
// Create a .module.css file or custom CSS
```

For complex, reusable styles, extend `tailwind.config.js` with custom `theme.extend` utilities.

## Special Directories

### `.planning/codebase/` — Architecture Documentation

**Purpose:** Documentation for Claude agents executing future phases

**Committed:** Yes

**Generated:** No (manually written)

**Contents:**
- ARCHITECTURE.md — Pattern, layers, data flow, abstractions
- STRUCTURE.md — This file; directory layout, naming conventions, where to add code

### `.next/` — Build Output

**Purpose:** Next.js compiled output and cache

**Committed:** No (in .gitignore)

**Generated:** Yes (by `npm run build` or `npm run dev`)

### `node_modules/` — Dependencies

**Purpose:** Installed npm packages

**Committed:** No (in .gitignore)

**Generated:** Yes (by `npm install`)

### `.env.local` — Secrets

**Purpose:** Environment variables (POSTGRES_URL, BLOB_TOKEN, API keys)

**Committed:** No (in .gitignore)

**Generated:** No (created manually in development)

### `.planning/phases/`, `.planning/todos/` — Phase Planning

**Purpose:** Implementation plans and task tracking

**Committed:** Yes

**Generated:** By GSD orchestrator during planning phase

### `.worktrees/` — Git Worktrees

**Purpose:** Temporary git branches for isolated work

**Committed:** No (in .gitignore)

**Generated:** By git commands

## Import Path Conventions

**All imports use the `@/` alias** (defined in `jsconfig.json`):

```javascript
// ✅ Correct
import { HeroSection } from "@/components/HeroSection";
import { getAllSnippets } from "@/lib/snippets/queries";
import { cn } from "@/lib/utils";

// ❌ Don't do this:
import { HeroSection } from "../components/HeroSection";
import { getAllSnippets } from "../../../lib/snippets/queries";
```

## Critical Render Order

The main app's render tree **must** follow this order (defined in `src/app/layout.jsx`):

```jsx
<ClientLayout>
  {/* 1. Geometric background - lowest z-index */}
  <GeometricBackground fixed />

  {/* 2. Navigation */}
  <DockNav />

  {/* 3. Page content */}
  {children}

  {/* 4. Speed insights */}
  <SpeedInsights />

  {/* 5. CursorDot - MUST be LAST to stay on top */}
  <CursorDot />
</ClientLayout>
```

Changing this order will break z-index stacking and cursor overlay visibility.

---

*Structure analysis: 2026-03-23*

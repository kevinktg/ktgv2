# Architecture

**Analysis Date:** 2026-03-23 · **2026-04:** `src/app/ulti-chat/` **removed** from the App Router. Hub AI chat is **`src/app/hub/chat/page.jsx`** + **`src/app/api/hub/chat/route.js`** inside the **same** Next.js 16 app.

## Pattern Overview

**Overall:** Next.js 16 App Router monolith (marketing + blog + hub tools + integrated hub chat)

**Key Characteristics:**
- Primary app: Next.js 16 App Router with React 19, server components + selective client boundaries
- **Hub chat:** Integrated route **`/hub/chat`**; streaming API **`/api/hub/chat`** (Vercel AI SDK) — not a nested Next project
- Data persistence: Vercel Postgres (Drizzle ORM) + Vercel Blob for large content
- Animation layer: GSAP 3 + ScrollTrigger for advanced animations, Lenis for smooth scrolling
- Styling: Tailwind CSS v4 + shadcn/ui primitives + custom brand components
- Rendering: Geometric background fixed behind all content; floating dock nav; custom cursor overlay

## Layers

**Presentation Layer:**
- Purpose: Render pages, sections, and UI primitives to users
- Location: `src/components/`, `src/app/`
- Contains: JSX section components (HeroSection, ExpertiseSection, etc.), shadcn/ui buttons/cards/inputs, custom brand UI
- Depends on: Lib layer (utilities, hooks), GSAP, Lenis
- Used by: Next.js router, layout system

**Page/Route Layer:**
- Purpose: Handle Next.js App Router entry points and request handling
- Location: `src/app/` (layout.jsx, page.jsx, [slug]/page.jsx, api/**/route.js)
- Contains: Server components defining pages, API route handlers
- Depends on: Lib layer (DB queries, external API clients), presentation layer
- Used by: Next.js runtime

**Business Logic / Data Layer:**
- Purpose: Query databases, fetch external data, manage state transformation
- Location: `src/lib/` (db/, snippets/, wordpress.js, lenis.jsx)
- Contains: Drizzle queries, Vercel Blob operations, WordPress REST client, scroll utilities
- Depends on: External APIs (Vercel Postgres, Vercel Blob, WordPress)
- Used by: Page components, API routes, presentation layer

**Infrastructure Layer:**
- Purpose: Configure runtime, define schemas, manage external service connections
- Location: `src/lib/db/schema.js`, `next.config.js`, `package.json`, `.env.local`
- Contains: Database schema, image remoting config, build optimization
- Depends on: Next.js, Node.js
- Used by: All layers

**UI Primitives Layer:**
- Purpose: Reusable, low-level button/card/input components
- Location: `src/components/ui/` (shadcn exports), `src/components/shadcn-studio/`
- Contains: Radix UI + Tailwind wrapped primitives
- Depends on: Tailwind, Radix UI, clsx
- Used by: All components

## Data Flow

**Homepage Render:**
1. Browser requests `/` → Next.js router resolves to `src/app/page.jsx`
2. Server renders layout: `src/app/layout.jsx` wraps in `<ClientLayout>`
3. Layout mounts four persistent globals: `GeometricBackground`, `DockNav`, child pages, `CursorDot`
4. Page renders sections: `HeroSection` → `HeroTransition` → `ExpertiseSection` → `ExpertiseTransition` → `ValidationSection` → `PhilosophySection` → `ContactCTA` → `Footer`
5. Each section imports components, fonts (`--font-syne`, `--font-inter`), and GSAP animations
6. Client-side: Lenis hydrates for smooth scroll; GSAP/ScrollTrigger setup fires on mount; CursorDot tracks mouse
7. On first visit: HeroSection plays intro animation, sets `sessionStorage.intro-completed`
8. On return visits: Skip to main content automatically

**Snippet Hub Data Flow:**
1. User navigates to `/hub/snippets` → router resolves to `src/app/hub/snippets/page.jsx`
2. Client component fetches: `GET /api/hub/snippets`
3. API route `src/app/api/hub/snippets/route.js` calls `getAllSnippets()` from `src/lib/snippets/queries.js`
4. Query layer calls Drizzle ORM: `db.select().from(snippets).orderBy(desc(snippets.created_at))`
5. Drizzle resolves to Vercel Postgres; returns array of snippet metadata (id, title, description, blob_url, tags, etc.)
6. Page receives snippet records; client component fetches content preview for each via `getSnippetContent(blob_url)`
7. `getSnippetContent()` in `src/lib/snippets/storage.js` fetches from Vercel Blob URL
8. Page renders grid of `<SnippetCard>` components with content preview
9. User clicks snippet → routes to `/hub/snippets/[id]`
10. Detail page fetches via `getSnippetById(id)` → renders full content via `react-markdown`

**Blog Data Flow:**
1. User navigates to `/blog` or `/blog/[slug]`
2. Page component fetches from external WordPress instance: `lawngreen-mallard-558077.hostingersite.com`
3. `src/lib/wordpress.js` wraps REST client; formats posts
4. Posts rendered as cards on index; single post rendered on detail page
5. No local database involvement; WordPress is source of truth for blog content

**State Management:**
- **Client state:** React hooks (useState, useRef) in client components; minimal global state
- **Server state:** Drizzle ORM queries; Vercel Postgres is source of truth for snippets
- **Session state:** `sessionStorage` for intro skip flag; `window.lenis` for scroll instance access
- **Animation state:** GSAP timeline objects; ScrollTrigger instances cached and cleaned on unmount
- **UI state:** DockNav nav state (open/closed); CursorDot mouse position (window-level listener)

## Key Abstractions

**Global Layout Wrapper (`ClientLayout`):**
- Purpose: Wraps entire app in Lenis scroll provider and initializes global cursor listener
- Examples: `src/components/ClientLayout.jsx`
- Pattern: Client component that injects Lenis context and GlobalCursor listener for all children

**Geometric Background:**
- Purpose: Fixed background layer with animated gradient blob and cursor reactivity
- Examples: `src/components/GeometricBackground.jsx`
- Pattern: `fixed` positioned container; uses Three.js for 3D particle effects or Canvas API; sits below all content via z-index

**Cursor Overlay (`CursorDot`):**
- Purpose: Custom cursor rendering; must be **last** in render tree to stay above all stacking contexts
- Examples: `src/components/CursorDot.jsx`
- Pattern: Absolute positioned element tracking mouse; enforces render order by being last child of `<ClientLayout>`

**Dock Navigation (`DockNav`):**
- Purpose: Floating icon navigation visible on all pages
- Examples: `src/components/DockNav.jsx`
- Pattern: Fixed positioned container; links to routes (/, /expertise, /hub, /validation, etc.); dismissible on mobile

**Snippet Repository:**
- Purpose: Centralized access to snippet metadata and content
- Examples: `src/lib/snippets/queries.js`, `src/lib/snippets/storage.js`
- Pattern: Query layer decouples API routes from Drizzle; Storage layer decouples routes from Vercel Blob

**WordPress Bridge:**
- Purpose: Fetch and format blog posts from external WordPress instance
- Examples: `src/lib/wordpress.js`
- Pattern: Single REST client; handles URL construction, error handling; imports into blog page components

**Scroll Utilities:**
- Purpose: Initialize and export Lenis scroll instance for cross-component access
- Examples: `src/libs/lenis.jsx` (note: named `libs` not `lib`)
- Pattern: Exported singleton context hook; components access via `useContext()` or direct `window.lenis`

## Entry Points

**Root Server Layout:**
- Location: `src/app/layout.jsx`
- Triggers: Every page request in the app
- Responsibilities: Load fonts (Syne, Inter); register metadata/viewport; wrap children in `<ClientLayout>`; mount globals (GeometricBackground, DockNav, CursorDot); inject SpeedInsights

**Homepage:**
- Location: `src/app/page.jsx`
- Triggers: Request to `/`
- Responsibilities: Compose hero, expertise, validation, philosophy, contact, footer sections; disable intro skip on page-level

**Blog Index & Detail:**
- Location: `src/app/blog/page.jsx`, `src/app/blog/[slug]/page.jsx`
- Triggers: `/blog`, `/blog/[slug]` routes
- Responsibilities: Fetch posts from WordPress; render grid or detail view; handle not-found case

**Hub Index, Snippets & Chat:**
- Location: `src/app/hub/page.jsx`, `src/app/hub/snippets/page.jsx`, `src/app/hub/snippets/[id]/page.jsx`, **`src/app/hub/chat/page.jsx`**
- Triggers: `/hub`, `/hub/snippets`, `/hub/snippets/[id]`, **`/hub/chat`**
- Responsibilities: Redirect or render snippet browser; fetch from Postgres; render detail with markdown; **chat UI** for hub

**API: Snippet CRUD + Chat + Settings:**
- Location: `src/app/api/hub/snippets/route.js`, `src/app/api/hub/snippets/[id]/route.js`, **`src/app/api/hub/chat/route.js`**, **`src/app/api/hub/settings/route.js`**
- Triggers: `GET/POST /api/hub/snippets`, `GET/PUT/DELETE /api/hub/snippets/[id]`, **`POST /api/hub/chat`**, settings route as implemented
- Responsibilities: Delegate to query layer or AI SDK; handle errors; return JSON/stream

**Expertise, Validation, Contact Pages:**
- Location: `src/app/expertise/page.jsx`, `src/app/validation/page.jsx`
- Triggers: `/expertise`, `/validation` routes
- Responsibilities: Render static or semi-dynamic content sections

## Error Handling

**Strategy:** Fail gracefully; log to console; fall back to defaults

**Patterns:**
- **API errors:** API routes catch and return 500 with error message; client logs error and falls back to empty state or retry
- **Blob fetch failures:** `getSnippetContent()` catches blob fetch errors; returns empty string; component renders with empty preview
- **WordPress fetch failures:** Blog page catches and logs; renders "No posts available" message
- **GSAP cleanup:** ScrollTrigger instances have `onKill` handlers; unmount listeners prevent memory leaks
- **Not Found:** Blog has explicit not-found handler at `src/app/blog/not-found.jsx`

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.error()`, `console.log()` in catch blocks; no centralized logging library
- Example: `src/app/api/hub/snippets/route.js` logs fetch errors and creation errors

**Validation:**
- Approach: Schema validation in API routes (check required fields); Drizzle schema defines column constraints (notNull, etc.)
- Example: `src/app/api/hub/snippets/route.js` checks for `title`, `content`, `source_file` before creating

**Authentication:**
- Approach: No authentication layer implemented; all routes public
- Note: AI SDK keys stored in `.env.local` (never exposed to client; used only in server routes/actions)

**Styling & Theme:**
- Approach: Tailwind CSS v4 with custom colors; CSS variables for fonts; no theme provider (not theme-aware)
- Conventions: `bg-black`, `text-white`, `#00f0ff` accent for interactive elements; lowercase text via Tailwind utility
- Font variables: `--font-syne` for branding, `--font-inter` for body; used via `font-[family-name:var(--font-syne)]`

---

## RESOLVED: Former nested `ulti-chat` tree

**Historical issue (pre-2026-04):** `src/app/ulti-chat/` was a standalone Next.js project embedded in the tree — not routable as part of the main app.

**Current state:** That path was **removed** from the App Router. Chat is **integrated** as **`/hub/chat`**. Any leftover AI Studio copy is **optional** under **`_reference/ulti-chat/`** (often gitignored) for local reference — **do not** import into `src/`.

**Remaining discipline:** Server-only provider keys; hub streaming logic in **`src/app/api/hub/chat/route.js`**.

---

*Architecture analysis: 2026-03-23 · nested-app section reconciled 2026-04-01*

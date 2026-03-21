# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Next.js App Router with Section-Based Page Layout + GSAP Animation Orchestration

**Key Characteristics:**
- Server-rendered pages with progressive client-side enhancements (hybrid SSR/Client)
- Modular section components that manage their own animations and state
- Scroll-driven animations using GSAP ScrollTrigger + Lenis for smooth scrolling
- Global cursor and background effects using Three.js and canvas-based geometry
- WordPress integration for dynamic content (blog posts)

## Layers

**Server Layer (App Router):**
- Purpose: Handle page rendering, SSR data fetching, metadata generation
- Location: `src/app/` (layout.jsx, page.jsx, blog routing)
- Contains: Page routes, layouts, metadata, ISR configuration
- Depends on: WordPress API client (`src/lib/wordpress.js`)
- Used by: Browser requests, Next.js routing

**Client Layer (Components):**
- Purpose: Interactive UI, animations, event handling
- Location: `src/components/` (marked with "use client")
- Contains: Page sections (Hero, Expertise, Validation, Philosophy, Blog), UI primitives, animated elements
- Depends on: GSAP, Lenis, Three.js, Radix UI primitives
- Used by: Server components via composition, layout wrapping

**Utilities & Libraries:**
- Purpose: Reusable functions, hooks, data clients
- Location: `src/lib/` (utils, wordpress, usePrefersReducedMotion), `src/libs/` (lenis wrapper)
- Contains: API clients, custom hooks, helper functions
- Depends on: External APIs (WordPress), browser APIs (matchMedia)
- Used by: Components and pages throughout the app

**Styling Layer:**
- Purpose: Theme configuration, CSS animations, Tailwind utilities
- Location: `src/app/globals.css`, `tailwind.config.js`
- Contains: CSS variables, animations, responsive breakpoints, design tokens
- Depends on: Tailwind CSS, Tailwind plugins
- Used by: All components via className attributes

## Data Flow

**Page Load (Home):**

1. **Server renders layout** → loads global fonts (Syne, Inter), applies metadata, sets up viewport
2. **Server fetches data** → `getPosts()` from WordPress API with timeout + fallback handling
3. **Server renders page** → passes blog data to `BlogPreview`, wraps with sections
4. **Client hydrates layout** → `ClientLayout` activates Lenis (smooth scroll) and GlobalCursor
5. **Client mounts sections** → each component's `useGSAP` hook sets up ScrollTrigger animations
6. **Scroll interaction** → GSAP ScrollTrigger listens to Lenis scroll, fires stagger animations
7. **Session tracking** → sessionStorage flags prevent re-animating on return visits

**Blog Post Fetch (Server Side):**

1. Page mounts → `getPosts(page, perPage)` called with `next: { revalidate: 60 }` (ISR)
2. Fetch with timeout controller (10s) to prevent hanging
3. On error → fallback attempt without `_embed` parameter
4. Return parsed JSON array or empty array on timeout/404
5. `BlogPreview` component receives array and renders grid

**User Interaction (Scroll):**

1. Lenis intercepts scroll events → smooth easing applied
2. Lenis sync'd with GSAP ticker → `gsap.ticker.add()` called every frame
3. ScrollTrigger updates → reads scroll position from Lenis proxy
4. Animations fire → character stagger, horizontal scroll, shutter animations
5. sessionStorage updated → tracks which animations have played this session

**State Management:**

- **Session-based animation state:** `sessionStorage` flags (intro-completed, expertise-revealed, validation-animated)
- **Component-local state:** `useState` for hasPlayed, refRefs for GSAP targets
- **Global window state:** `window.lenis` exposed for skip button access
- **CSS variable state:** Theme colors, font variables via hsl(var(--name))
- **No persistent client-side store:** Zustand listed in package.json but not actively used

## Key Abstractions

**Section Component Pattern:**

- Purpose: Encapsulate animation logic + layout for each page region
- Examples: `HeroSection`, `ValidationSection`, `PhilosophySection`, `ExpertiseSection`
- Pattern:
  - "use client" directive
  - `useGSAP()` hook for animation setup
  - `useRef()` for DOM targets
  - Conditional animation based on `hasPlayed` sessionStorage flag
  - ScrollTrigger + GSAP for complex animations

**SplitText:**

- Purpose: Wrap text in character/word spans for GSAP character stagger animations
- Location: `src/components/SplitText.jsx`
- Pattern: Maps input string → words array → characters spans with `.split-char` class
- Usage: `<SplitText>{text}</SplitText>` wraps text for character-by-character animation

**GeometricBackground:**

- Purpose: Persistent layered background with moving squares, grid, wireframes
- Location: `src/components/GeometricBackground.jsx`
- Pattern:
  - Memoized to prevent re-renders
  - Uses CSS animations (`@keyframes animate-square`)
  - Fixed or absolute positioning (fixed on layout, absolute on sections)
  - mix-blend-mode: difference for visual effect
  - 12 animated squares (reduced from 21 for performance)

**Lenis Scroll Bridge:**

- Purpose: Sync smooth scroll (Lenis) with GSAP timeline updates
- Location: `src/libs/lenis.jsx`
- Pattern:
  - Wraps ReactLenis component
  - `gsap.ticker.add(update)` connects Lenis to GSAP frame loop
  - `ScrollTrigger.scrollerProxy()` configures ScrollTrigger to read from Lenis
  - Exposes `window.lenis` for programmatic scroll control
  - Disables lagSmoothing to prevent desync

**UI Component Library:**

- Purpose: Reusable atomic components (button, card, badge, etc.)
- Location: `src/components/ui/` (Radix UI + shadcn styled)
- Pattern: Compound components with className merging (`cn()` utility)
- Uses: `clsx` + `tailwind-merge` for conditional class composition

## Entry Points

**Layout Root:**

- Location: `src/app/layout.jsx`
- Triggers: Server-side on every request
- Responsibilities:
  - Google Fonts loading (Syne, Inter)
  - Global metadata (title, description, OG tags)
  - Viewport configuration
  - Speed Insights integration
  - Root `html/body` setup
  - ClientLayout wrapper (Lenis + GlobalCursor)
  - GeometricBackground + CursorDot rendered globally

**Home Page:**

- Location: `src/app/page.jsx`
- Triggers: Route `/`
- Responsibilities:
  - Fetch blog posts from WordPress
  - Compose sections in order (Hero → Expertise → Validation → Philosophy → Blog → Footer)
  - Handle blog fetch errors gracefully
  - Set ISR revalidation (60s)

**Blog Listing:**

- Location: `src/app/blog/page.jsx`
- Triggers: Route `/blog`
- Responsibilities: Fetch and display blog posts grid

**Blog Dynamic Route:**

- Location: `src/app/blog/[slug]/page.jsx`
- Triggers: Route `/blog/:slug`
- Responsibilities: Fetch single post, render article layout

**Validation Page:**

- Location: `src/app/validation/page.jsx`
- Triggers: Route `/validation`
- Responsibilities: Render validation section with audit mock data

**Expertise Page:**

- Location: `src/app/expertise/page.jsx`
- Triggers: Route `/expertise`
- Responsibilities: Render expertise section standalone

## Error Handling

**Strategy:** Graceful degradation - errors logged but don't crash the app

**Patterns:**

- **WordPress API timeouts:** 10-second fetch timeout with AbortController, fallback to empty array
- **API 403 errors:** Automatic retry without `_embed` parameter for stricter CORS
- **Hydration mismatches:** `suppressHydrationWarning` on body/root, session state checks in `useEffect`
- **Missing refs:** useGSAP early return if refs not ready, re-runs on state change
- **Animation failures:** Conditional rendering skips animations on reduced-motion preference
- **Three.js loading:** Lazy-loaded HeroImages component with Suspense fallback

## Cross-Cutting Concerns

**Logging:**

- Strategy: `console.error()` and `console.warn()` for API issues, animation problems
- Pattern: Error messages include context (URL, status, message)
- Used in: `src/lib/wordpress.js` (fetch errors), ScrollTrigger warnings, resize observer issues

**Validation:**

- Strategy: Response shape validation before rendering
- Pattern: Check `Array.isArray()` before passing to map, null checks for nested data
- Used in: WordPress post responses, featured image extraction, date formatting

**Authentication:**

- Strategy: Public API access only (WordPress REST API, no auth required)
- Pattern: Headers include User-Agent and Referer for compatibility
- Used in: `src/lib/wordpress.js`

**Motion Preferences:**

- Strategy: Respect `prefers-reduced-motion` media query
- Pattern: `usePrefersReducedMotion()` hook reads user preference, sections check before animating
- Used in: `PhilosophySection`, CSS animations with `@media (prefers-reduced-motion: reduce)`
- Implementation: Character stagger disabled, square animations slowed, scroll tweens paused

**Performance Optimization:**

- Memoization: `GeometricBackground`, `Header`, UI components
- Lazy loading: `HeroImages` with Suspense
- Code splitting: Next.js automatic route-based splitting
- Image optimization: Remotepatterns configured, formats (avif, webp), deviceSizes defined
- Animation optimization: `force3D: true` on tweens, `will-change` conditional, `contain: strict` on animated elements
- CSS containment: Layout/paint containment on background squares to prevent reflow

---

*Architecture analysis: 2026-03-21*

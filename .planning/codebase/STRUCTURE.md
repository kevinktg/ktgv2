# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
ktgv2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.jsx                # Root layout (fonts, metadata, global wrappers)
│   │   ├── page.jsx                  # Home page (sections orchestration)
│   │   ├── globals.css               # Global styles, animations, theme variables
│   │   ├── blog/
│   │   │   ├── page.jsx              # Blog listing page
│   │   │   ├── [slug]/
│   │   │   │   └── page.jsx          # Individual blog post
│   │   │   └── not-found.jsx         # Blog 404 handler
│   │   ├── expertise/
│   │   │   └── page.jsx              # Expertise section standalone
│   │   ├── validation/
│   │   │   └── page.jsx              # Validation section standalone
│   │   ├── api/                      # Server API routes (currently unused)
│   │   ├── template.jsx              # Page transition wrapper
│   │   └── sitemap.js                # XML sitemap generation
│   │
│   ├── components/                   # React components (mixed SSR + client)
│   │   ├── shadcn-studio/            # Pre-built shadcn component library
│   │   │   ├── button/
│   │   │   └── card/
│   │   ├── ui/                       # Styled Radix UI primitives
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── separator.jsx
│   │   │   ├── navigation-menu.jsx
│   │   │   ├── matter-button.jsx
│   │   │   └── skeleton.jsx
│   │   │
│   │   ├── Layout Components
│   │   │   ├── ClientLayout.jsx      # Client-side wrapper (Lenis + GlobalCursor)
│   │   │   ├── Header.jsx            # Fixed navigation header
│   │   │   └── Footer.jsx            # Footer with links
│   │   │
│   │   ├── Section Components (Animated Pages)
│   │   │   ├── HeroSection.jsx       # Hero with image reveal + skip button
│   │   │   ├── HeroTransition.jsx    # Wipe animation Hero → Expertise
│   │   │   ├── ExpertiseSection.jsx  # Skills grid + stat counters
│   │   │   ├── ExpertiseTransition.jsx # Wipe animation Expertise → Validation
│   │   │   ├── ValidationSection.jsx # Horizontal scroll cards + shutter animation
│   │   │   ├── PhilosophySection.jsx # Parallax quotes + character stagger
│   │   │   ├── BlogPreview.jsx       # Blog grid with featured images
│   │   │   └── ScrollTransition.jsx  # Scroll-triggered wipe animations
│   │   │
│   │   ├── Animation/Effects Components
│   │   │   ├── HeroImages.jsx        # Three.js canvas + blob reveal
│   │   │   ├── GeometricBackground.jsx # Moving squares + grid + wireframes
│   │   │   ├── GlobalCursor.jsx      # Custom cursor dot tracking
│   │   │   ├── CursorDot.jsx         # Global cursor (top of stacking context)
│   │   │   └── SplitText.jsx         # Character splitting for stagger
│   │   │
│   │   └── Utility Components
│   │       ├── SkipButton.jsx        # Hero skip to main content
│   │       ├── PageTransition.jsx    # Page-level transition effect
│   │
│   ├── lib/                          # Utilities and data clients
│   │   ├── utils.js                  # Class name merging (cn utility)
│   │   ├── wordpress.js              # WordPress REST API client
│   │   └── usePrefersReducedMotion.js # Motion preference hook
│   │
│   └── libs/                         # Third-party library wrappers
│       └── lenis.jsx                 # Lenis scroll sync with GSAP
│
├── public/
│   └── assets/                       # Images, SVGs, static media
│       ├── top-hero.webp
│       ├── bottom-hero.webp
│       ├── ktg.svg
│       ├── og-image.jpg
│       └── [other media files]
│
├── package.json                      # Dependencies (Next.js, GSAP, Lenis, Three.js)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS theme + plugins
├── components.json                   # shadcn CLI config
└── context.json                      # Project context config
```

## Directory Purposes

**src/app/**

- Purpose: Next.js App Router pages and layouts
- Contains: Route definitions, server components, metadata, styling
- Key files: `layout.jsx` (root), `page.jsx` (home), `globals.css` (theme)

**src/components/**

- Purpose: Reusable React components
- Contains: Page sections, UI primitives, animation components, utilities
- Key files: Section components (Hero, Expertise, Validation, Philosophy, Blog)

**src/lib/**

- Purpose: Shared utilities and data clients
- Contains: API wrappers, custom hooks, helper functions
- Key files: `wordpress.js` (blog data), `usePrefersReducedMotion.js` (accessibility)

**src/libs/**

- Purpose: Third-party library integration wrappers
- Contains: Lenis + GSAP ScrollTrigger bridge
- Key files: `lenis.jsx` (scroll sync configuration)

**public/assets/**

- Purpose: Static media files
- Contains: WebP/JPG images, SVGs, static resources
- Generated/committed: Yes (included in repo)

## Key File Locations

**Entry Points:**

- `src/app/layout.jsx`: Root layout, fonts, metadata, global wrappers
- `src/app/page.jsx`: Home page, section orchestration, blog fetch
- `src/app/blog/page.jsx`: Blog listing route
- `src/app/blog/[slug]/page.jsx`: Dynamic blog post route

**Configuration:**

- `next.config.js`: Next.js build settings, image optimization, turbopack config
- `tailwind.config.js`: Tailwind theme, color palette, font families
- `package.json`: Dependencies, scripts (dev, build, lint)
- `src/app/globals.css`: CSS variables, animations, responsive breakpoints

**Core Logic:**

- `src/lib/wordpress.js`: WordPress REST API client with timeout + error handling
- `src/libs/lenis.jsx`: Lenis ↔ GSAP ScrollTrigger synchronization
- `src/components/SplitText.jsx`: Character-level text splitting for stagger animations
- `src/components/GeometricBackground.jsx`: Persistent animated background

**Testing:**

- No dedicated test directory found
- No jest/vitest config detected

## Naming Conventions

**Files:**

- **Page routes:** lowercase with underscores (e.g., `[slug]`, `not-found.jsx`)
- **Components:** PascalCase (e.g., `HeroSection.jsx`, `ValidationSection.jsx`)
- **Utilities/hooks:** camelCase (e.g., `usePrefersReducedMotion.js`, `wordpress.js`)
- **Styles:** globals.css (global), component.module.css (not used, inline Tailwind)
- **Assets:** lowercase with hyphens (e.g., `top-hero.webp`, `og-image.jpg`)

**Directories:**

- **Components:** PascalCase grouping (e.g., `src/components/ui/`, `shadcn-studio/`)
- **Routes:** lowercase (e.g., `blog/`, `api/`, `validation/`)
- **Utilities:** lowercase plural (e.g., `lib/`, `libs/`)

**Classes/Exports:**

- **React components:** PascalCase (e.g., `export function HeroSection()`)
- **Hooks:** camelCase with 'use' prefix (e.g., `usePrefersReducedMotion()`)
- **Functions:** camelCase (e.g., `getPosts()`, `formatDate()`)
- **CSS classes:** kebab-case (e.g., `.split-char`, `.stat-counter`, `.digital-text`)

**Animation/Data Classes:**

- Character stagger targets: `.split-char`, `.split-word`
- Section-specific: `.expertise-group`, `.stat-counter`, `.stat-label`, `.digital-text`
- Cursor zones: `data-cursor-zone="hero"` (dataset attributes, not CSS classes)

## Where to Add New Code

**New Feature (e.g., new page section):**

- Primary code: `src/components/[SectionName]Section.jsx` (follow Section pattern)
  - Include "use client" directive
  - Use `useGSAP()` for animations
  - Check `usePrefersReducedMotion()` for accessibility
  - Use sessionStorage flags to prevent re-animation
- Tests: Create alongside if tests are added (not currently in place)
- Styling: Use Tailwind classes inline, extend colors in `tailwind.config.js` if needed
- Add section to `src/app/page.jsx` composition

**New Component/Module:**

- **UI component:** `src/components/ui/[name].jsx` (atomic, reusable)
  - Use Radix UI as base if possible
  - Export function as default or named
  - Use `cn()` utility for class merging
- **Page route:** `src/app/[route]/page.jsx`
  - If server-side data fetch needed, use `async` component
  - If client-side only, add "use client" directive
  - Set metadata/viewport as needed
- **Animation component:** `src/components/[Name]Animation.jsx`
  - Use `useGSAP()` hook
  - Use `useRef()` for GSAP targets
  - Clean up animations in cleanup function

**Utilities:**

- **Data client:** `src/lib/[service].js` (export async functions)
  - Include timeout handling
  - Include error handling with console logs
  - Return empty object/array on error
- **Custom hook:** `src/lib/use[Name].js` or `src/lib/use-[name].js`
  - Return state/refs as needed
  - Handle SSR edge cases (typeof window checks)
- **Helper function:** `src/lib/utils.js` or new `src/lib/[domain].js`
  - Pure functions where possible
  - Export as named exports

**Styling:**

- **Global styles:** Add to `src/app/globals.css`
- **Theme variables:** Update `src/app/globals.css` :root section + `tailwind.config.js`
- **Component styles:** Inline Tailwind classes (no external CSS files)
- **Animations:** Define `@keyframes` in `globals.css`, reference via animation: class

## Special Directories

**public/assets/**

- Purpose: Static media files served directly
- Generated: No (manually added)
- Committed: Yes
- Access: `/assets/[filename]` in code

**src/app/api/**

- Purpose: Server API routes (Next.js API routes)
- Generated: No
- Committed: Yes (empty, not currently used)
- Note: Use `src/lib/` for data clients instead

**.next/**

- Purpose: Build output and cached compilation
- Generated: Yes (by `next build`)
- Committed: No (.gitignored)

**.git/, .github/**

- Purpose: Version control and CI/CD
- Generated: Yes (git internals)
- Committed: Yes (workflows, config)

## Import Path Aliases

Configured in `jsconfig.json` or `next.config.js`:

- `@/`: Points to `src/` root
- `@/components`: `src/components/`
- `@/lib`: `src/lib/`
- `@/libs`: `src/libs/`
- `@/app`: `src/app/`

Usage: `import { HeroSection } from "@/components/HeroSection"`

---

*Structure analysis: 2026-03-21*

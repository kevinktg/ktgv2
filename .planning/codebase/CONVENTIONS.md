# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- Components: PascalCase with `.jsx` extension (e.g., `HeroSection.jsx`, `ValidationSection.jsx`)
- Utilities/hooks: camelCase with `.js` extension (e.g., `usePrefersReducedMotion.js`, `utils.js`)
- Pages: lowercase with `.jsx` extension (e.g., `page.jsx`, `layout.jsx`)
- UI components: PascalCase grouped in `src/components/ui/` (e.g., `button.jsx`, `card.jsx`)

**Functions:**
- React components: PascalCase, exported as named exports (e.g., `export function HeroSection()`)
- Helper functions: camelCase (e.g., `fetchWithTimeout()`, `getReducedMotion()`)
- Custom hooks: camelCase with `use` prefix (e.g., `usePrefersReducedMotion()`)
- Utility functions: camelCase descriptive names (e.g., `cn()`, `getFeaturedImage()`)

**Variables:**
- State variables: camelCase (e.g., `hasPlayed`, `isMobile`, `isReady`)
- References/refs: camelCase with `Ref` suffix (e.g., `sectionRef`, `textRef`, `quoteRefs`)
- Constants: UPPER_SNAKE_CASE for module-level constants (e.g., `GRAPHITE_END_VIEWPORT_PAD`, `REQUEST_TIMEOUT`, `PARALLAX_TOP`)
- Data objects: descriptive camelCase or as provided by props (e.g., `philosophyData`, `auditData`, `blogPosts`)

**Types:**
- No TypeScript: codebase uses JSX without TypeScript
- JSDoc comments for type hints when needed (e.g., `/** @type {import('next').NextConfig} */`)

## Code Style

**Formatting:**
- No explicit formatter configured (no `.prettierrc` or ESLint config detected)
- Appears to follow Next.js default conventions
- Spacing: 2-space indentation (observed in all files)
- Trailing semicolons: used consistently
- Quotes: double quotes for strings, single quotes avoided

**Linting:**
- ESLint v9 installed but no configuration file present
- Relies on `next lint` command from package.json
- Next.js provides default linting rules

**Code organization:**
- Imports grouped logically: React/Next imports first, then third-party libraries, then local imports
- Path aliases used throughout: `@/` points to `src/` directory
- "use client" directive at top of client components (e.g., `HeroImages.jsx`, `ValidationSection.jsx`)
- Server-side functions/data fetching at top level (e.g., `app/page.jsx` uses `async` function, `getPosts()`)

## Import Organization

**Order:**
1. React and Next.js imports (e.g., `import { useRef, forwardRef } from "react"`)
2. Third-party libraries (e.g., `import gsap from "gsap"`, `import Link from "next/link"`)
3. Local components (e.g., `import { SkipButton } from "@/components/SkipButton"`)
4. Local utilities/hooks (e.g., `import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion"`)

**Path Aliases:**
- `@/` maps to `src/` directory
- Used consistently for all local imports
- Examples: `@/components/`, `@/lib/`, `@/app/`

**Barrel Files:**
- Index files used in `ui/` and `shadcn-studio/` directories
- Export components/subcomponents from central location
- Example: `src/components/shadcn-studio/button/index.js` exports button variants

## Error Handling

**Patterns:**
- **Try-catch with fallback**: Used in server-side data fetching (e.g., `wordpress.js`)
  ```javascript
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error: ${response.status}`);
      // Fallback logic or return empty/default
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error message:', error);
    return null; // or [] or default value
  }
  ```

- **Graceful degradation**: External API failures don't crash the app
  - WordPress integration in `src/lib/wordpress.js` returns empty array on failure
  - `getPosts()` returns `[]` if API unavailable
  - `getPostBySlug()` returns `null` if post not found

- **Timeout handling**: Fetch requests use abort controller for timeout
  ```javascript
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  ```

- **Ref safety checks**: Guard against null refs before using
  ```javascript
  if (!sectionRef.current) return;
  if (!horizontalScrollRef.current || !shutterRef.current) return;
  ```

- **Type safety in DOM access**: Check element existence before accessing properties
  ```javascript
  if (shutterRef.current?.children) {
    gsap.set(shutterRef.current.children, {...});
  }
  ```

## Logging

**Framework:** `console` native methods (no external logging library)

**Patterns:**
- `console.error()` for failures (e.g., API errors, timeouts)
- `console.warn()` for non-critical issues (e.g., fallback behavior)
- `console.log()` avoided in production code (no examples found)
- Error context included: error message + context (URL, response status)

**Examples from `wordpress.js`:**
```javascript
console.error('WordPress connection test timed out');
console.error(`WordPress API error: ${response.status} - ${response.statusText}`);
console.error(`URL: ${url}`);
console.warn('Attempting fetch without _embed parameter...');
```

## Comments

**When to Comment:**
- Algorithm explanation or non-obvious logic (e.g., GSAP animation phases)
- Configuration decisions (e.g., "OPTIMIZATION: Use swap for font loading")
- References to external patterns (e.g., "Graphite.com-style scrolling")
- Warning about browser/environment limitations
- Workaround explanations (e.g., sessionStorage hydration mismatch)

**JSDoc/Comments:**
- Block comments used for sections (e.g., `// PHASE 1: THE SWOOP`)
- Inline comments for specific lines when context is non-obvious
- Component comments explain purpose and constraints
- Configuration comments explain why decisions were made

**Examples:**
```javascript
// OPTIMIZATION: Check sessionStorage only on client side to prevent hydration mismatch
// PHASE 1: THE SWOOP (White -> Black) - Run immediately on mount
// Register ScrollTrigger safely (avoiding SSR errors)
// Wait for all refs to be ready
```

## Function Design

**Size:** Functions kept focused and single-purpose
- Animation setup isolated in `useGSAP()` hooks
- Data fetching in separate utility functions
- Component rendering logic separated from animation setup
- Typical function length: 20-100 lines for component logic, 10-30 for utilities

**Parameters:**
- Destructuring used for component props
- Default parameters for optional values
- Props fallback to defaults within component when not passed
- Example:
  ```javascript
  export function SplitText({
    children,
    className = "",
    wordClass = "split-word",
    charClass = "split-char",
  }) { ... }
  ```

**Return Values:**
- React components: return JSX/null
- Data fetchers: return data or empty array/null on failure
- Hooks: return state, callbacks, or computed values
- Utilities: return computed values or transformed data

## Module Design

**Exports:**
- Named exports preferred for components and functions
- Default exports used for page routes
- Example:
  ```javascript
  export function HeroSection() { ... }
  export function PhilosophySection() { ... }
  ```

**Barrel Files:**
- Used in `ui/` directory for component consolidation
- Provide single import point for related components
- Example: `src/components/ui/index.js` exports all UI primitives

**Component Structure:**
- State management (useState) at top
- Effects/animations (useGSAP, useEffect) in middle
- Render JSX at bottom
- Helper components defined above main export

## React Patterns

**Client vs Server:**
- "use client" directive for interactive components requiring hooks
- Server components default for data fetching (app/page.jsx)
- Lazy loading used for heavy components (e.g., HeroImages)
  ```javascript
  const HeroImages = lazy(() => import("@/components/HeroImages").then(mod => ({ default: mod.HeroImages })));
  ```

**Props:**
- Functional components with destructured props
- Forward refs used when parent access needed
  ```javascript
  export const HeroSection = forwardRef((props, ref) => {
    const internalRef = ref || useRef(null);
  });
  ```

**Suppression:**
- `suppressHydrationWarning` used to suppress hydration mismatches (intended usage)
- Applied to sections where client-only state doesn't affect markup

---

*Convention analysis: 2026-03-21*

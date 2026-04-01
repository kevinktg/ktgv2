# Coding Conventions

**Analysis Date:** 2026-03-23 · **2026-04:** **`src/app/ulti-chat/`** is **not** in the App Router. **Production** code is one architecture: **Main App** + integrated **`src/app/hub/chat/page.jsx`** (**JSX**). A gitignored **`_reference/ulti-chat/`** folder may still hold **TypeScript** AI Studio patterns for historical comparison — do not treat it as a second routable product.

## Overview

**Primary (all shipped routes including `/hub/chat`):**

1. **Main App** (`src/app/` + `src/components/`): Next.js 16, React 19, **JSX**, GSAP (marketing), Tailwind v4, Vercel AI SDK on the server for hub chat

**Historical / reference only:**

2. **Legacy ulti-chat** (`_reference/ulti-chat/` if present): was Next 15 + **TSX** + different animation stack — useful for diffing old prompts/UI **only**; never import into `src/`

---

## File Naming Conventions

### Main App (JSX)

**Components:**
- Format: PascalCase `.jsx`
- Examples: `HeroSection.jsx`, `ExpertiseSection.jsx`, `DockNav.jsx`, `ContactCTA.jsx`
- Location: `src/components/` or `src/components/{category}/`
- Single export per file (default function)

**Pages:**
- Format: kebab-case when segment, PascalCase function
- Examples: `src/app/page.jsx`, `src/app/blog/[slug]/page.jsx`, `src/app/hub/snippets/[id]/page.jsx`

**Hooks:**
- Format: camelCase `.js`
- Example: `src/lib/lenis.jsx` (custom Lenis context)

**Utilities:**
- Format: camelCase `.js`
- Examples: `src/lib/utils.js`, `src/lib/wordpress.js`, `src/lib/snippets/storage.js`

**API Routes:**
- Format: kebab-case directory + `route.js`
- Examples: `src/app/api/hub/snippets/route.js`, `src/app/api/hub/snippets/[id]/route.js`

**Database:**
- Format: camelCase `.js`
- Examples: `src/lib/db/schema.js`, `src/lib/db/client.js`

### Legacy ulti-chat reference (TypeScript) — `_reference/` only

**Components:**
- Format: PascalCase `.tsx`
- Currently only one main page: `app/page.tsx` with inline component definitions (no separate component files)
- Uses `React.forwardRef` for component refs where needed

**Hooks:**
- Format: camelCase `.ts`
- Example: `hooks/use-mobile.ts`

**Utilities:**
- Format: camelCase `.ts`
- Example: `lib/utils.ts`

**Layouts & Pages:**
- Format: kebab-case directory + `.tsx` file
- Examples: `app/layout.tsx`, `app/page.tsx`

---

## Naming Patterns

### Variables & Functions

**Main App:**
```javascript
// camelCase for all variables and functions
const DOT_COUNT = 12 // CONSTANTS in SCREAMING_SNAKE_CASE
const LAG_FACTOR = 0.2 // Configuration constants
const mouse = { x: 0, y: 0 } // Object state
const render = () => { } // Function declaration
const onMouseMove = (e) => { } // Event handlers: on{Event}
const handleSubmit = () => { } // Form handlers: handle{Action}
const isActive = pathname === "/" // Boolean flags: is/has{Condition}
const dotsRef = useRef([]) // Refs: {name}Ref
const containerRef = useRef(null)
const { isPlaying, duration } = metadata // Destructure at top of scope
```

**ulti-chat:**
- Same patterns as main app, but with TypeScript interfaces:
```typescript
interface PersonaConfig {
  id: string
  name: string
  prompt: string
  isCustom: boolean
}

const PERSONAS: PersonaConfig[] = [ ... ]
```

### Component Props

**Main App:**
```javascript
// Props destructured in function signature
export function SnippetCard({ snippet, content }) {
  // No prop validation (use runtime checks if needed)
}

// Props with children
export function Layout({ children }) {
  return <div>{children}</div>
}
```

**ulti-chat:**
```typescript
// Props with type annotations
export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
}) {
  // ...
}
```

### Styling & Classes

**Naming Approach:**
- Use Tailwind utility classes directly, no custom class names
- Class names use full classNames, no abbreviations
- Pattern: `"bg-black text-white hover:bg-white/10 transition-colors"`

**Important:** Text is intentionally lowercase via CSS:
```css
h1, h2, h3, h4, h5, h6 {
  text-transform: lowercase; /* Brand convention, not a bug */
}
```

**Color Scheme (Main App):**
- Background: `bg-black` / `bg-[#000000]`
- Text: `text-white` / `text-white/40` (opacity modifier)
- Accent: `#00f0ff` (cyan) for interactive/AI elements → `bg-[#00f0ff]`, `text-[#00f0ff]`
- Secondary: `bg-emerald-500/90` for CTAs
- Use opacity: `white/10`, `white/20`, `white/40`, `white/60` for layering

**Font Specification:**
- Syne (branding): Use `font-[family-name:var(--font-syne)]` NOT `font-syne`
- Inter (body): Use `font-[family-name:var(--font-inter)]` or default (Inter is body)
- Example:
```jsx
<h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold lowercase">
  Heading
</h1>
```

### Type Names (ulti-chat only)

```typescript
// Interfaces for data models
interface PersonaConfig { }
interface Message { }

// Types for unions/generics
type MessageRole = 'user' | 'assistant'
type PersonaId = 'default' | 'coder' | 'creative' | 'analyst'
```

---

## Import Organization

### Main App

**Order (preferred):**
1. Next.js imports (`next/`, `next/font/google`, `next/navigation`)
2. React imports (`react`, `react-dom`)
3. External libraries (GSAP, Three, UI libraries)
4. Local imports (`@/`, relative paths)

**Example:**
```javascript
import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### Path Aliases

**Main App:**
- `@/*` → `./src/*`
- Always use `@/` for imports within src (never relative `../../../`)

**ulti-chat:**
- `@/*` → `./*` (relative to ulti-chat root, not src)
- Imports like: `import { cn } from '@/lib/utils'` resolve to `./lib/utils.ts`

### "use client" Directive

**Main App:**
- Required for components using:
  - GSAP (`useGSAP` hook)
  - Browser APIs (event listeners, window, document)
  - React hooks (useState, useRef, useEffect)
  - Scroll effects or animations
- Place at top of file:
```javascript
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'

export function CursorDot() {
  // ...
}
```

**Servers Components (default, no "use client"):**
- Root layout (`src/app/layout.jsx`)
- Page files unless they need client interactivity
- API routes (they're inherently server-side)

---

## Code Style

### Formatting

**Tool:** No automatic formatter configured (Prettier not in devDependencies)
- Consistent spacing enforced by Next.js ESLint (eslint ^9)
- **Style:** 2-space indentation (inferred from examples)

**Linting:**
- Main app: `next lint` (Next.js ESLint config)
- ulti-chat: `eslint .` (extends "next")

**Line Length:**
- No strict limit, but keep readable (~100 chars for JSX attributes)

### Semicolons

- **Not required** — consistently omitted throughout codebase
- Example: `const value = 42` not `const value = 42;`

### Quotes

- **Double quotes** for JSX attributes: `className="bg-black"`
- **Single quotes** for JS strings: `'use client'`, `const str = 'hello'`
- Exception: JSDoc strings use double quotes

### Trailing Commas

- Used in multi-line objects/arrays:
```javascript
const config = {
  name: 'value',
  enabled: true,
}

const arr = [
  'item1',
  'item2',
]
```

---

## Error Handling

### Pattern: Try-Catch with Fallback

**Synchronous API calls (main app):**
```javascript
const fetchSnippets = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/hub/snippets')
    if (response.ok) {
      const data = await response.json()
      setSnippets(data)
    }
  } catch (error) {
    console.error('Error fetching snippets:', error)
  } finally {
    setLoading(false)
  }
}
```

**Key patterns:**
- Always use try-catch for async operations
- Check `response.ok` before parsing JSON
- Catch errors with descriptive console.error
- Use finally block for cleanup (loading state, etc.)
- Return fallback data on error, don't throw to user

**Server-side (API routes):**
```javascript
export async function GET() {
  try {
    const snippets = await getAllSnippets()
    return NextResponse.json(snippets)
  } catch (error) {
    console.error('Error fetching snippets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snippets' },
      { status: 500 }
    )
  }
}
```

**Validation on POST:**
```javascript
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, content } = body

    // Validate required fields BEFORE processing
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      )
    }

    // Proceed with business logic
    const result = await createSnippet({ title, description, content })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating snippet:', error)
    return NextResponse.json(
      { error: 'Failed to create snippet' },
      { status: 500 }
    )
  }
}
```

### Error Handling in Components

**Silently fall back on errors (non-critical):**
```javascript
const withContent = await Promise.all(
  snippets.map(async (snippet) => {
    try {
      const content = await getSnippetContent(snippet.blob_url)
      return { ...snippet, content }
    } catch (error) {
      // Silently return empty content, don't throw
      return { ...snippet, content: '' }
    }
  })
)
```

**Never:**
- Throw uncaught errors in event handlers
- Use `console.log` for errors (use `console.error`)
- Ignore async errors in useEffect

---

## Logging

**Framework:** `console.*` (no logging library)

**Patterns:**
```javascript
// Errors (always include context)
console.error('Error fetching snippets:', error)
console.error('Component render failed:', { component: 'HeroSection', error })

// Development info (rare, prefer not to commit)
console.log('Debug info:', variable)

// Never use console for production features
```

### When to Log

- **DO:** Errors, edge cases, unexpected conditions
- **DON'T:** Normal flow, variable values (use debugger), component renders

---

## Comments

### When to Comment

- Explain WHY, not WHAT (code shows what it does)
- Mark OPTIMIZATION sections: `// OPTIMIZATION: [description]`
- Mark FIX sections: `// FIX: [problem solved]`
- Mark CRITICAL/IMPORTANT: `// CRITICAL: [reason]`

**Examples from codebase:**
```javascript
// OPTIMIZATION: Use 'swap' to ensure branding fonts load even on slower connections
const syne = Syne({
  display: 'swap',
  // ...
})

// OPTIMIZATION: Reduced from 21 to 12 elements for ~50% GPU memory reduction
const SQUARE_COUNT = 12

// CRITICAL: CursorDot must be last in render tree to stay on top of all stacking contexts
<CursorDot />

// FIX: Changed from hsl(var(--background)) to transparent
background-color: transparent !important
```

### JSDoc/TSDoc

**Main App:** Rare, used only for utility functions

```javascript
/**
 * Upload a snippet markdown file to Vercel Blob
 * @param {string} filename - Name of the file
 * @param {string} content - Markdown content
 * @returns {Promise<{url: string}>} Blob URL
 */
export async function uploadSnippet(filename, content) {
  // ...
}
```

**ulti-chat:** Not enforced, but TypeScript types serve as documentation

---

## Function Design

### Size Guidelines

- Keep functions under 50 lines when possible
- Extract complex inline logic to helper functions
- One responsibility per function

### Parameters

- Destructure props in React components:
```javascript
export function SnippetCard({ snippet, content }) { }
```

- Pass objects for multiple related parameters (don't repeat)
- Limit to 3-4 parameters; use config object for more

### Return Values

- Return data, not JSX from utility functions
- Components always return JSX/ReactNode
- Async functions return Promise<Type>

### Async Patterns

**Prefer Promise chains for simple cases:**
```javascript
useEffect(() => {
  fetchSnippets()
}, [])

const fetchSnippets = async () => {
  try {
    // ...
  } catch (error) {
    // ...
  }
}
```

**Avoid unnecessary async/await nesting:**
```javascript
// ✓ Good
const data = await fetch(url).then(r => r.json())

// ✗ Avoid
const data = await (async () => {
  return await fetch(url).then(r => r.json())
})()
```

---

## Module Design

### Exports

**Named exports for utilities:**
```javascript
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export async function uploadSnippet(filename, content) {
  // ...
}
```

**Default exports for components:**
```javascript
export default function Home() {
  return <div>Home</div>
}

// OR named export (both used in codebase)
export function ContactCTA() {
  return <section>...</section>
}
```

### Barrel Files

**Used minimally.** Example:
- `src/components/ui/` has shadcn components exported directly (one per file)
- No re-export index files observed in main app

### Singleton Patterns

**Global instances (use Context for access):**
- Lenis scroll instance: `src/lib/lenis.jsx` exports context/hook
- Do NOT create multiple instances per component

---

## GSAP-Specific Conventions (Main App)

**Always use `useGSAP` hook for animations:**
```javascript
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function CursorDot() {
  const containerRef = useRef(null)

  useGSAP(() => {
    gsap.set(containerRef.current, { opacity: 1 })
  }, { scope: containerRef })
}
```

**Cleanup rules:**
- GSAP animations are cleaned up automatically by `useGSAP` hook
- Always specify `scope` when animating refs within a specific container
- Kill animations explicitly if needed: `gsap.killTweensOf(target)`

**Performance:**
```javascript
// Use will-change for animated elements (handled via CSS)
// Extract inline styles to constants to prevent recreation
const TECH_GRID_STYLE = {
  backgroundImage: `...`,
  backgroundSize: '40px 40px',
  contain: 'layout style paint',
}

// Memoize components that don't need frequent updates
export const GeometricBackground = memo(function GeometricBackground({ fixed }) {
  // ...
})
```

---

## Component Memoization

**Use React.memo for:**
- Components that receive the same props frequently
- Visual/background components that don't change
- Example: `GeometricBackground`, global UI components

```javascript
export const GeometricBackground = memo(function GeometricBackground({ fixed = false }) {
  return <div>...</div>
})
```

**Avoid memo for:**
- Components with many dynamic props
- Components that always re-render (page sections)
- Premature optimization

---

## Historical: main app vs legacy `_reference/ulti-chat`

| Aspect | Main App (shipped) | `_reference/ulti-chat` (optional local copy) |
|--------|-------------------|-----------------------------------------------|
| **Language** | JSX | TSX (if reference kept) |
| **Next.js** | 16 App Router | Was 15 nested tree — **not** in `src/app/` anymore |
| **Chat route** | `/hub/chat` | N/A (reference only) |

**Rule:** All new work lives under **`src/`** Main App conventions. Do not copy TSX patterns from reference into production paths without an explicit porting task.

---

*Convention analysis: 2026-03-23 · reconciled 2026-04-01*

# Testing Patterns

**Analysis Date:** 2026-03-23

## Summary

**No automated testing is configured in this codebase.**

- No test runner (Jest, Vitest, etc.) in dependencies
- No test files (`.test.js`, `.spec.js`, `.test.tsx`) in the source
- Verification is done manually via `pnpm dev` and browser testing
- This applies to both main app and ulti-chat

---

## Current Testing Approach

### Manual Testing (Browser-Based)

All testing is done by running the dev server and verifying in the browser:

```bash
pnpm dev  # Starts Next.js dev server
# Navigate to http://localhost:3000
# Manually verify pages, interactions, animations
```

### What Gets Tested Manually

**Critical paths:**
- Page routing (`/`, `/blog`, `/blog/[slug]`, `/hub/snippets`, `/hub/snippets/[id]`, `/validation`, `/expertise`)
- API endpoints (`/api/hub/snippets`, `/api/hub/snippets/[id]`)
- Database queries (snippet list, individual snippet fetch)
- GSAP animations (scroll triggers, cursor effects, transitions)
- Form submissions (contact form via mailto)

**Visual verification:**
- Responsive design (desktop, tablet, mobile)
- Tailwind CSS colors and spacing
- Typography (Syne for headings, Inter for body)
- Animations smooth and performant
- No layout shifts or hydration mismatches

**Browser tools used:**
- DevTools Console (catch errors/warnings)
- Network tab (verify API calls, image loading)
- Performance tab (watch animations)
- Responsive mode (test breakpoints)

### No Automated Tests in CI/CD

- Vercel deploys without test verification
- Build errors caught during `pnpm build`
- No pre-commit hooks enforcing tests

---

## Testing Structure (If Added)

If testing were to be implemented, this is the recommended structure:

### Test File Organization

**Location: Co-located with source**

```
src/
├── components/
│   ├── HeroSection.jsx
│   ├── HeroSection.test.jsx          ← Test file
│   ├── DockNav.jsx
│   ├── DockNav.test.jsx
│   └── hub/
│       ├── SnippetCard.jsx
│       └── SnippetCard.test.jsx
├── app/
│   ├── page.jsx
│   ├── page.test.jsx
│   ├── api/
│   │   └── hub/
│   │       └── snippets/
│   │           ├── route.js
│   │           └── route.test.js
├── lib/
│   ├── utils.js
│   ├── utils.test.js
│   ├── snippets/
│   │   ├── storage.js
│   │   └── storage.test.js
```

### Recommended Test Framework

**Choose one (based on Next.js 16 compatibility):**
1. **Jest** (traditional, works well with Next.js)
2. **Vitest** (faster, modern, also works with Next.js)

**Recommended: Vitest** for this stack (Next.js 16 + React 19)

### Sample Jest/Vitest Config

```javascript
// vitest.config.js (if added)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'node_modules'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## Testing Patterns (Recommended Approach)

### Unit Tests: Utility Functions

**Pattern: Test pure functions**

```javascript
// src/lib/utils.test.js
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('combines conditional classes', () => {
    const result = cn('text-white', { 'bg-black': true })
    expect(result).toBe('text-white bg-black')
  })

  it('handles undefined values', () => {
    expect(cn('text-white', undefined, 'bg-black')).toBe('text-white bg-black')
  })
})
```

### Unit Tests: Storage/Database Functions

**Pattern: Mock external API calls**

```javascript
// src/lib/snippets/storage.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadSnippet, getSnippetContent } from './storage'

describe('uploadSnippet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error if BLOB_READ_WRITE_TOKEN is missing', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    await expect(uploadSnippet('test.md', 'content')).rejects.toThrow(
      'BLOB_READ_WRITE_TOKEN environment variable is not set'
    )
  })

  it('uploads snippet to Vercel Blob', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
    // Mock would go here
    // Would verify filename format: "snippets/test.md"
  })
})

describe('getSnippetContent', () => {
  it('fetches and returns snippet content', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Snippet content'),
      })
    )

    const content = await getSnippetContent('https://blob.example.com/snippet.md')
    expect(content).toBe('# Snippet content')
  })

  it('throws error if fetch fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      })
    )

    await expect(
      getSnippetContent('https://blob.example.com/missing.md')
    ).rejects.toThrow('Failed to fetch snippet: Not Found')
  })
})
```

### Component Tests: Rendering

**Pattern: Test component props and rendering**

```javascript
// src/components/SnippetCard.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SnippetCard } from './SnippetCard'

describe('SnippetCard', () => {
  const mockSnippet = {
    id: '123',
    title: 'My Snippet',
    snippet_type: 'gate',
    tags: ['tag1', 'tag2', 'tag3'],
  }

  it('renders snippet title', () => {
    render(<SnippetCard snippet={mockSnippet} content="Test content" />)
    expect(screen.getByText('My Snippet')).toBeInTheDocument()
  })

  it('displays snippet type badge', () => {
    render(<SnippetCard snippet={mockSnippet} content="Test content" />)
    expect(screen.getByText('gate')).toBeInTheDocument()
  })

  it('shows first 2 tags and "+more" indicator for 3+ tags', () => {
    render(<SnippetCard snippet={mockSnippet} content="Test content" />)
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('truncates content to 150 characters', () => {
    const longContent = 'a'.repeat(200)
    render(<SnippetCard snippet={mockSnippet} content={longContent} />)
    const preview = screen.getByText(/a+\.\.\./)
    expect(preview.textContent.length).toBeLessThanOrEqual(153)
  })

  it('renders link to snippet detail', () => {
    render(<SnippetCard snippet={mockSnippet} content="Test content" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/hub/snippets/123')
  })
})
```

### Component Tests: User Interactions

**Pattern: Test event handlers and state changes**

```javascript
// src/components/DockNav.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DockNav } from './DockNav'

describe('DockNav', () => {
  it('renders all navigation items', () => {
    render(<DockNav />)
    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(screen.getByLabelText('Insights')).toBeInTheDocument()
    expect(screen.getByLabelText('Hub')).toBeInTheDocument()
    expect(screen.getByLabelText('Contact')).toBeInTheDocument()
  })

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()
    render(<DockNav />)

    const homeLink = screen.getByLabelText('Home')
    await user.hover(homeLink)

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('marks current route as active', () => {
    // Would need Next.js router mock
    render(<DockNav />)
    // Test that active link has correct className
  })
})
```

### API Route Tests

**Pattern: Test request/response handling**

```javascript
// src/app/api/hub/snippets/route.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import * as queries from '@/lib/snippets/queries'
import * as storage from '@/lib/snippets/storage'

describe('GET /api/hub/snippets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns list of snippets', async () => {
    const mockSnippets = [
      { id: '1', title: 'Snippet 1' },
      { id: '2', title: 'Snippet 2' },
    ]
    vi.spyOn(queries, 'getAllSnippets').mockResolvedValue(mockSnippets)

    const response = await GET()
    const data = await response.json()

    expect(data).toEqual(mockSnippets)
    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    vi.spyOn(queries, 'getAllSnippets').mockRejectedValue(
      new Error('DB connection failed')
    )

    const response = await GET()

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch snippets')
  })
})

describe('POST /api/hub/snippets', () => {
  it('returns 400 if required fields missing', async () => {
    const request = new Request('http://localhost/api/hub/snippets', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }), // missing content, source_file
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Missing required fields')
  })

  it('creates snippet with valid data', async () => {
    const mockBlob = { url: 'https://blob.example.com/test.md' }
    const mockSnippet = { id: '123', title: 'Test', blob_url: mockBlob.url }

    vi.spyOn(storage, 'uploadSnippet').mockResolvedValue(mockBlob)
    vi.spyOn(queries, 'createSnippet').mockResolvedValue(mockSnippet)

    const request = new Request('http://localhost/api/hub/snippets', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Snippet',
        description: 'A test',
        content: 'Test content',
        source_file: 'test.md',
        tags: ['test'],
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBe('123')
  })
})
```

### GSAP Animation Tests

**Pattern: Test animation setup and triggers**

```javascript
// src/components/CursorDot.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import gsap from 'gsap'
import { CursorDot } from './CursorDot'

describe('CursorDot', () => {
  beforeEach(() => {
    vi.spyOn(gsap, 'set')
  })

  it('initializes dots with correct GSAP properties', () => {
    render(<CursorDot />)

    // Verify gsap.set was called with expected properties
    expect(gsap.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
      })
    )
  })

  it('animates dots on mouse move', async () => {
    render(<CursorDot />)

    // Simulate mouse movement
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
    })
    window.dispatchEvent(event)

    // Would verify animation was triggered
  })
})
```

### Page Component Tests

**Pattern: Test page structure and layout**

```javascript
// src/app/page.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders all major sections', () => {
    render(<Home />)

    // Check that main sections exist
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('has correct page structure', () => {
    const { container } = render(<Home />)

    // Verify z-index and layout structure
    const mainContent = container.querySelector('#main-content')
    expect(mainContent).toBeInTheDocument()
  })
})
```

---

## Mocking Strategy

### What to Mock

**Always mock:**
- External APIs (`fetch`, API calls)
- Database queries (when testing components)
- File system operations (Vercel Blob)
- Environment variables
- Next.js router/navigation (in component tests)

**What NOT to mock:**
- Utility functions like `cn()` — test them directly
- React hooks (unless testing hook logic specifically)
- CSS/Tailwind classes

### Mock Setup

```javascript
// vitest.setup.js (if added)
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
```

---

## Test Data / Fixtures

**Location:** `__fixtures__/` directory (if added)

```
src/
├── __fixtures__/
│   ├── snippets.json
│   └── personas.json
└── components/
```

**Example fixture:**
```javascript
// src/__fixtures__/snippets.json
{
  "snippets": [
    {
      "id": "123",
      "title": "Success Criteria Lock",
      "description": "Framework for defining success",
      "blob_url": "https://blob.example.com/test.md",
      "tags": ["framework", "planning"],
      "snippet_type": "gate"
    }
  ]
}
```

**Usage in tests:**
```javascript
import snippetsFixture from '@/__fixtures__/snippets.json'

it('renders snippets from fixture', () => {
  const { snippet } = snippetsFixture.snippets[0]
  render(<SnippetCard snippet={snippet} content="" />)
})
```

---

## Coverage Goals (If Tests Added)

**Recommended minimums:**
- Utilities: 100% (pure functions)
- API routes: 80% (error handling + main paths)
- Components: 70% (rendering + critical interactions)
- Pages: 50% (structure verification)

**Coverage gaps (current):**
- No coverage on GSAP animations (difficult to test, mostly visual)
- No coverage on scroll-based effects
- No E2E tests for full user journeys

---

## CI/CD Integration (If Tests Added)

**GitHub Actions example:**

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run test:coverage
```

---

## Running Tests (Once Implemented)

```bash
# Run all tests
npm run test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm run test -- SnippetCard

# Run tests matching pattern
npm run test -- --grep "API routes"
```

---

## Known Testing Challenges

1. **GSAP/Animation Testing:** Difficult to verify animation timing and smoothness automatically. Requires visual inspection or specialized tools.

2. **Scroll-Triggered Animations:** ScrollTrigger requires DOM measurements; mocking scroll events is complex.

3. **Next.js Integration:** Some Next.js features (Image optimization, font loading, metadata) are hard to unit test effectively.

4. **ulti-chat Isolation:** Testing ulti-chat requires mocking the Google GenAI API; no example tests provided in codebase.

---

*Testing analysis: 2026-03-23*

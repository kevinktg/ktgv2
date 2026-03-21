# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Runner:**
- Not detected - no test framework configured
- No Jest, Vitest, Cypress, or Playwright configurations found
- No test scripts in `package.json`
- Empty `tests/` directory exists but is unused

**Assertion Library:**
- Not applicable (no testing framework installed)

**Run Commands:**
```bash
npm run lint              # ESLint (static analysis only, no tests)
npm run dev              # Local development
npm run build            # Production build
npm run start            # Start production server
```

## Test File Organization

**Current Status:**
- Zero test files in source code
- Directory `tests/` exists but is empty
- No `*.test.*` or `*.spec.*` files in `src/`

**Recommended Location (if testing were implemented):**
- Co-located pattern: `src/components/HeroSection.test.jsx` alongside `HeroSection.jsx`
- Or: `tests/` directory with mirror structure of `src/`

## Current Testing Approach

**No Automated Testing:**
The codebase currently relies on:
- Manual testing during development (`npm run dev`)
- Browser-based visual inspection
- Static code analysis via ESLint

**Quality Assurance Mechanisms:**
1. **Build-time checks:**
   - Next.js build validation
   - TypeScript-like JSDoc hints for IDE/editor support
   - ESLint static analysis (default Next.js rules)

2. **Runtime safeguards:**
   - Error handling with try-catch blocks
   - Graceful fallbacks for API failures
   - Ref safety checks before DOM manipulation
   - Type guards for optional values

3. **Browser DevTools:**
   - Console error monitoring
   - Performance profiling (React DevTools, Chrome DevTools)
   - Network request inspection

## Testing Gaps & Recommendations

**Critical Components Without Tests:**
- `src/components/HeroImages.jsx` - Complex Three.js/shader logic
  - Test: Texture loading, parallax effect calculation
  - Test: Mobile vs desktop rendering paths

- `src/components/ValidationSection.jsx` - ScrollTrigger animations
  - Test: Horizontal scroll calculation
  - Test: Animation state management (hasPlayed flag)
  - Test: ResizeObserver cleanup

- `src/lib/wordpress.js` - External API integration
  - Test: Network timeout handling
  - Test: Fallback behavior (403 response)
  - Test: Error recovery paths

- `src/components/ExpertiseSection.jsx` - Complex GSAP timeline
  - Test: Stat counter animation
  - Test: Scroll trigger pinning logic
  - Test: Session storage integration

**Recommended Test Strategy:**

1. **Unit Tests (Jest/Vitest):**
   ```javascript
   // Example: Test utility functions
   describe('wordpress.js', () => {
     test('getPosts returns empty array on timeout', async () => {
       // Mock fetch to timeout
       // Verify returns []
     });

     test('formatDate handles invalid input', () => {
       expect(formatDate('invalid')).toBe('');
       expect(formatDate(null)).toBe('');
     });
   });
   ```

2. **Component Tests (React Testing Library):**
   ```javascript
   // Example: Test component props and state
   describe('SplitText', () => {
     test('renders characters in spans', () => {
       render(<SplitText>hello</SplitText>);
       const chars = screen.getAllByText(/h|e|l|l|o/);
       expect(chars).toHaveLength(5);
     });

     test('returns null for empty string', () => {
       const { container } = render(<SplitText>   </SplitText>);
       expect(container.firstChild).toBeNull();
     });
   });
   ```

3. **Integration Tests (Cypress/Playwright):**
   ```javascript
   // Example: Test scroll animations
   describe('ValidationSection scroll', () => {
     test('horizontal scroll triggers on scroll', () => {
       cy.visit('/');
       cy.get('[ref=horizontalScrollRef]')
         .scrollIntoView()
         .should('be.visible');
       // Verify animation triggered
     });
   });
   ```

4. **API Integration Tests:**
   ```javascript
   // Example: Test WordPress connection
   test('getPosts falls back gracefully when API unavailable', async () => {
     // Mock fetch to reject
     const posts = await getPosts();
     expect(posts).toEqual([]);
   });
   ```

## Current Code Patterns (Non-Testing)

**Error Handling as Quality Gate:**
- All async operations wrapped in try-catch
- API failures return empty/null rather than throwing
- Network timeouts explicitly handled

**Safety Checks:**
- Ref existence checked before access: `if (!ref.current) return`
- Optional chaining used: `shutterRef.current?.children`
- Type guards for parsed values: `parseFloat()` with validation

**Session State Management:**
- `sessionStorage` used to track animation state (prevent re-runs)
- Prevents performance issues from repeated animations
- Pattern: `sessionStorage.getItem('animation-key') === 'true'`

**Accessibility Patterns:**
- `aria-hidden="true"` for decorative elements
- `alt` text for images (Next.js Image component enforces)
- Skip buttons for animation-heavy content

## Browser Compatibility Testing

**Manual Testing Approach:**
- Reduced motion support: `usePrefersReducedMotion()` hook respects system preferences
- Mobile detection: `window.innerWidth < 768`
- Responsive behavior: CSS media queries + JavaScript breakpoint detection
- Browser feature detection: `typeof ResizeObserver !== "undefined"`

**Performance Testing:**
- Vercel Speed Insights integrated (`@vercel/speed-insights/next`)
- Web Vitals monitored in production
- Image optimization configured: AVIF/WebP formats

## What Would Be Needed to Add Testing

**Setup Required:**
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "jest-mock-extended": "^3.0.0",
    "cypress": "^13.0.0"
  }
}
```

**Config Files Needed:**
- `jest.config.js` - Test runner configuration
- `.jest/setup.js` - Test environment setup
- `cypress.config.js` - E2E test configuration (optional)

**File Structure:**
```
src/
├── components/
│   ├── HeroSection.jsx
│   └── HeroSection.test.jsx       # NEW
├── lib/
│   ├── wordpress.js
│   └── wordpress.test.js          # NEW
└── __tests__/
    ├── integration/               # NEW
    └── e2e/                       # NEW (if using Cypress)
```

---

*Testing analysis: 2026-03-21*

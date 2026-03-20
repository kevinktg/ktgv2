# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Runner:**
- Not detected—no `jest`, `vitest`, `playwright`, or `cypress` test scripts in `package.json`.
- `AGENTS.md` states explicitly: no automated test framework; manual testing required.

**Assertion Library:**
- Not applicable until a runner is added.

**Run Commands:**
```bash
npm run lint          # Static analysis via Next.js ESLint (not unit tests)
npm run build         # Production compile — primary automated gate today
npm run dev           # Local manual / visual QA
```

## Test File Organization

**Location:**
- No `*.test.*` or `*.spec.*` files under `src/`.
- `tests/` at repo root contains **documentation-only** markdown (`tests/QUICK_VISUAL_TEST_GUIDE.md`, `tests/UI_FIXES_TEST_STRATEGY.md`)—manual checklists, not executable tests.

**Naming:**
- When introducing automated tests, prefer colocated `*.test.jsx` next to source or `__tests__/` per team choice; no established pattern in repo yet.

**Structure:**
```
ktgv2/
├── src/                 # Application code (no test files today)
├── tests/               # Manual QA markdown guides only
├── verify_philosophy.js # Ad-hoc Puppeteer script (repo root)
└── scripts/
    └── scroll-screenshot.js
```

## Ad-Hoc / Script-Based Checks

**Puppeteer:**
- `puppeteer` is a devDependency; used by `verify_philosophy.js` and `scripts/scroll-screenshot.js` for browser automation and screenshots—not wired to `npm test`.
- Run manually: `node verify_philosophy.js` or `node scripts/scroll-screenshot.js` (see file headers for usage).

**Manual visual QA:**
- Follow `tests/QUICK_VISUAL_TEST_GUIDE.md` for scroll transitions, FPS checks, and section-by-section validation.

## Test Structure

**Suite organization:** Not applicable—no `describe`/`it` suites in codebase.

**Patterns for future tests:**
- If adding Vitest/Jest: prefer `describe('ComponentOrModule', () => { … })`, mock `fetch` for `src/lib/wordpress.js`, and keep GSAP-heavy components behind shallow renders or animation mocks.

## Mocking

**Framework:** Not configured.

**Guidance for future work:** Mock WordPress `fetch` responses and Next.js request APIs at module boundaries; avoid deep-mocking GSAP—assert side effects or split animation hooks for testability.

## Fixtures and Factories

**Test data:** No shared factories. WordPress-shaped objects could be copied from API samples when tests are added.

## Coverage

**Requirements:** None enforced; no coverage tooling in `package.json`.

**CI:** Does not run coverage or lint today—see below.

## Test Types

**Unit tests:** Not present.

**Integration tests:** Not present.

**E2E tests:** Not present; Puppeteer scripts are optional developer tools, not a CI suite.

## CI / Automation (`.github/workflows/deploy.yml`)

**What runs on push/PR to `main`:**
- `actions/checkout@v3`
- Node 20 via `actions/setup-node@v3`
- `npm ci`
- `npm run build`

**Gaps:** No `npm run lint` step; no test job. Treat `npm run build` as the enforced automated check matching current workflow.

**Deployment:** `vercel.json` sets `installCommand` to `npm install --legacy-peer-deps`; align local/CI installs with that when debugging peer-dep issues.

## Common Patterns (Future)

**Async testing (when framework exists):**
```javascript
it('returns empty array when API fails', async () => {
  // mock fetch → reject or non-ok
  const result = await getPosts();
  expect(result).toEqual([]);
});
```

**Error testing:** Assert `console.error` is used or return values match `wordpress.js` contracts rather than thrown exceptions for public helpers.

---

*Testing analysis: 2026-03-21*
*Update when test patterns change*

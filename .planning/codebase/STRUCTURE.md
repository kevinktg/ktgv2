# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
ktgv2/
├── src/
│   ├── app/                    # Next.js App Router: routes, layout, global CSS, sitemap
│   │   ├── layout.jsx
│   │   ├── page.jsx            # Home (/)
│   │   ├── template.jsx        # Route transition wrapper
│   │   ├── globals.css
│   │   ├── sitemap.js
│   │   ├── blog/
│   │   │   ├── page.jsx        # /blog
│   │   │   ├── not-found.jsx
│   │   │   └── [slug]/
│   │   │       └── page.jsx    # /blog/:slug
│   │   ├── expertise/
│   │   │   └── page.jsx
│   │   └── validation/
│   │       └── page.jsx
│   ├── components/             # React UI: sections, layout, ui/, shadcn-studio/
│   ├── lib/                    # wordpress.js, utils.js (cn)
│   └── libs/                   # lenis.jsx (Lenis + GSAP bridge)
├── next.config.js
├── tailwind.config.js
├── postcss.config.mjs
├── package.json
├── scripts/                    # Ad-hoc tooling (e.g. scroll screenshots)
├── docs/                       # Project documentation
├── ktg/ ktg2/ ktg3/            # Experimental / duplicate outputs (not primary app tree)
└── .planning/                  # GSD planning artifacts (e.g. codebase/)
```

## Directory Purposes

**`src/app/`:**
- Purpose: File-system routing, root layout, global styles, SEO metadata exports, sitemap
- Contains: `layout.jsx`, `page.jsx`, nested `page.jsx` per segment, `sitemap.js`, `globals.css`
- Key files: `src/app/layout.jsx`, `src/app/page.jsx`, `src/app/blog/[slug]/page.jsx`, `src/app/sitemap.js`

**`src/components/`:**
- Purpose: All React components except route files
- Contains: Page sections, `ClientLayout.jsx`, animation wrappers, `ui/` (shadcn-style primitives), `shadcn-studio/` variants
- Key files: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/BlogPreview.jsx`, `src/components/GeometricBackground.jsx`

**`src/lib/`:**
- Purpose: Shared non-UI modules
- Contains: `wordpress.js` (REST client), `utils.js` (`cn`)
- Key files: `src/lib/wordpress.js`, `src/lib/utils.js`

**`src/libs/`:**
- Purpose: Third-party integration wrappers (Lenis + GSAP)
- Contains: `lenis.jsx`
- Key files: `src/libs/lenis.jsx`

**Root config:**
- Purpose: Build and framework configuration
- Key files: `next.config.js`, `tailwind.config.js`, `postcss.config.mjs`, `package.json`

## Key File Locations

**Entry Points:**
- `package.json` — `npm run dev` / `build` / `start` invokes Next.js
- `src/app/layout.jsx` — HTML shell and global providers
- `src/app/page.jsx` — Home route

**Configuration:**
- `next.config.js` — `outputFileTracingRoot`, `images.remotePatterns`, Turbopack root, experimental flags
- `tailwind.config.js` — Tailwind v4 project config
- Environment: `NEXT_PUBLIC_WORDPRESS_URL`, `NEXT_PUBLIC_SITE_URL` (see `src/lib/wordpress.js`, `src/app/blog/page.jsx`, `src/app/sitemap.js`) — do not commit secrets

**Core Logic:**
- `src/lib/wordpress.js` — WordPress data fetching and helpers
- `src/libs/lenis.jsx` — Scroll engine integration

**Testing:**
- No `*.test.*` or `*.spec.*` under `src/` at time of analysis; `package.json` has no test script

**API routes:**
- No `src/app/api/` routes present in primary tree (deleted or absent)

## Naming Conventions

**Files:**
- Route modules: `page.jsx` (Next App Router convention)
- Layout: `layout.jsx`
- Components: `PascalCase.jsx` (e.g. `HeroSection.jsx`, `BlogPreview.jsx`)
- Utilities: `camelCase.js` (e.g. `wordpress.js`, `utils.js`)
- Sitemap: `sitemap.js` (Next convention)

**Directories:**
- App routes: lowercase folder names; dynamic segments as `[slug]`
- `ui/` — lowercase, shared primitives
- `components/` — flat plus `ui/` and `shadcn-studio/` subfolders

**Special Patterns:**
- `@/` alias maps to `src/` (used throughout imports)
- Default export for `page.jsx` / `layout.jsx` route modules; named exports common for `metadata`, `revalidate`, `generateStaticParams`

## Where to Add New Code

**New marketing page (static or mostly static):**
- Route: `src/app/<segment>/page.jsx`
- Shared sections: `src/components/<SectionName>.jsx`
- Metadata: export `metadata` or `generateMetadata` from the same `page.jsx`

**New WordPress-driven surface:**
- HTTP + caching: extend `src/lib/wordpress.js` with new REST helpers
- Consume from Server Components in `src/app/.../page.jsx`
- Add URLs to `src/app/sitemap.js` if the route should be indexed

**New interactive widget:**
- Implementation: `src/components/<Name>.jsx` with `"use client"` at top if using hooks, GSAP, or browser APIs
- Keep data fetching in parent Server Components when possible; pass props down

**New shared style helper:**
- `src/lib/utils.js` or a new `src/lib/<topic>.js` if not class-name related

**Utilities:**
- Shared helpers: `src/lib/`
- Scroll/GSAP bridges: `src/libs/` (follow `lenis.jsx` pattern)

## Special Directories

**`ktg/`, `ktg2/`, `ktg3/`:**
- Purpose: Alternate or exported trees (e.g. `mnt/user-data/outputs/`), not the canonical Next app under `src/app/`
- Generated: No
- Committed: Per-repo policy; treat as experimental duplicates unless promoted into `src/`

**`scripts/`:**
- Purpose: Node scripts for screenshots or verification (e.g. `scripts/scroll-screenshot.js`)
- Committed: Yes

---

*Structure analysis: 2026-03-21*

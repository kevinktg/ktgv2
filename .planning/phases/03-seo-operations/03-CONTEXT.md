# Phase 3: SEO & operations — Context

**Gathered:** 2026-04-03  
**Status:** Ready for execution (plans 03-01, 03-02)  
**Roadmap:** `.planning/ROADMAP.md` § Phase 3  
**Requirements:** `.planning/REQUIREMENTS.md` — SEO-01, SEO-02, SEO-03, OPS-01, OPS-02

<domain>

## Phase boundary

- **In scope:** `metadata` / `generateMetadata` completeness for marketing + blog; Open Graph / Twitter **absolute** image URLs; **sitemap** generation for static + blog URLs; build/CI parity (**pnpm**); confirm **Speed Insights** (or documented equivalent).
- **Out of scope:** Hub `/hub/chat` SEO polish (post-merge phase 4+ unless explicitly pulled in); changing WordPress host; new marketing copy.

</domain>

<decisions>

## Locked from codebase review (2026-04-03)

- Root `src/app/layout.jsx` exports `metadata` with `metadataBase: new URL('https://ktg.one')` and `openGraph.images` using path `/assets/og-image.jpg` — resolves absolute via `metadataBase` (Next.js behaviour).
- `src/app/blog/[slug]/page.jsx` implements `generateMetadata` with `openGraph` / `twitter` and builds `featuredImage` — **verify** WordPress-sourced URLs are always absolute (if WP returns relative paths, normalize with `siteUrl`).
- `src/app/blog/page.jsx` has static `metadata` + partial `openGraph`; may need `twitter` + image parity with root/blog post patterns.
- **No** `sitemap.js` / `sitemap.ts` under `src/app/` today — **SEO-03** requires adding App Router sitemap.
- `SpeedInsights` imported from `@vercel/speed-insights/next` in root layout — **OPS-02** likely satisfied; verify env/prod only behaviour per Vercel docs.

## Tooling

- Package manager: **pnpm** (not `npm`) for all documented commands — align ROADMAP success criteria text in a docs pass if needed (OPS-01).

</decisions>

<canonical_refs>

## Canonical references (read before implement)

- `.planning/REQUIREMENTS.md` (SEO-*, OPS-*)
- `.planning/codebase/STACK.md` or `CLAUDE.md` (Next 16, metadata patterns)
- `src/app/layout.jsx`
- `src/app/blog/page.jsx`, `src/app/blog/[slug]/page.jsx`
- `src/lib/wordpress.js` — `getPosts`, `getPostBySlug`, `getFeaturedImage`
- `next.config.js` — `images.remotePatterns` for OG/feature sources

</canonical_refs>

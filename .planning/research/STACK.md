# Stack Research

**Domain:** Next.js App Router marketing/portfolio site + headless WordPress blog (KTG One / ktgv2)  
**Researched:** 2026-03-21  
**Confidence:** **HIGH** for Next.js/React/Tailwind/GSAP integration patterns (verified via Context7 + official doc paths); **MEDIUM** for WordPress-side options (REST vs GraphQL tradeoffs—community + architecture reasoning; not a single “official stack” for WP+Next).

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | **16.x** (lockfile may resolve e.g. `^16.1.1` → latest 16.1.x) | App Router, RSC, `metadata` / `generateMetadata`, image optimization, Vercel-native deploy | De facto standard for React marketing sites on Vercel; App Router + Server Components match “server-first pages, client islands” from `PROJECT.md`. Use pinned minors in CI for reproducibility. |
| **React** | **19.2.x** (match `react` / `react-dom` pins) | UI runtime aligned with Next 16 | Next 16 targets current React; keep `react` and `react-dom` on the **same** version to avoid subtle mismatch bugs. |
| **Tailwind CSS** | **4.x** (e.g. `tailwindcss` + `@tailwindcss/postcss` **^4.1.x**) | Utility styling + design tokens in CSS | Project already on v4 (`PROJECT.md`); v4 is the active line—stay on `@import "tailwindcss"` / PostCSS pipeline already in repo, not Tailwind v3 config churn. |
| **WordPress (CMS)** | **Hosted WP** with **REST API** (`/wp-json/wp/v2/*`) | Editorial content, media, categories | Fits “read-only from app” constraint; `_embed` for featured images is standard REST usage—already in `src/lib/wordpress.js`. No CMS swap in v1 per `PROJECT.md`. |
| **GSAP** | **3.13.x** (`gsap`) | Timeline + ScrollTrigger motion | Industry default for scroll storytelling; matches brand/perf rules (transform/opacity, ScrollTrigger) in `AGENTS.md`. |
| **@gsap/react** | **2.1.x** | `useGSAP` + scoped `gsap.context()` cleanup | Official integration: automatic teardown on unmount/update; use `{ scope: containerRef }` for selector safety (verified `/greensock/react` docs). |
| **Lenis** | **1.3.x** (`lenis`) | Smooth scroll | Common pairing with GSAP; keep scroll driver (Lenis `raf` / GSAP ticker sync) **explicit and single-sourced** to avoid fight between native scroll and ScrollTrigger. |
| **Vercel** | **Current platform** | Hosting, Edge/CDN, Speed Insights | Stated deploy target; `vercel.json` already sets `framework`, `regions`, `installCommand`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **next/image** | bundled with Next | Responsive images from WP hostnames | Always for WP media; **required** `images.remotePatterns` entries for each WP/media host (`next.config.js` pattern). |
| **@vercel/speed-insights** | **^1.2.x** | Real user performance signals | Keep on production marketing site; low overhead. |
| **@tailwindcss/typography** | **^0.5.x** (dev) | Prose for long-form HTML from WP | Use for `dangerouslySetInnerHTML` blog bodies—pair with **sanitization** policy (see pitfalls). |
| **clsx** + **tailwind-merge** + **cva** | per `package.json` | Conditional classes / variants | Use for component APIs; avoids string concat bugs with Tailwind. |
| **Radix UI primitives** | per `package.json` | Accessible menus, separators, etc. | When building chrome/navigation beyond raw HTML—keeps focus/ARIA baseline. |
| **lucide-react** | per lockfile | Icons | Lightweight SVG icons; prefer tree-shaken imports. |
| **Zustand** | **^4.x** | Client global state | **Only if** you need cross-island client state; avoid for server-fetched blog data (keep in RSC + props). |
| **three** / **@react-three/fiber** / **drei** | per `package.json` | 3D sections | **If** 3D remains a product requirement; otherwise candidate for removal to shrink bundle (aligns with dependency cleanup in `PROJECT.md`). |
| **AI SDK** (`ai`, `@ai-sdk/openai`) | per `package.json` | LLM features | Re-evaluate if `/api/chat` or similar is gone—unused AI deps add weight and audit surface. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **ESLint** (`eslint` ^9) | Lint | Run `npm run lint` before ship; align rules with Next’s flat config when upgrading. |
| **npm + package-lock** | Install / CI | `vercel.json` uses `npm install --legacy-peer-deps`—**keep** until peer conflicts (often Three/R3F/React) are resolved; document why in maintenance notes. |
| **Puppeteer** (dev) | Screenshots / automation | Dev-only; don’t bundle into Next runtime. |

## Installation

```bash
# Core (illustrative—prefer `npm ci` from lockfile in CI)
npm install next@^16 react@19 react-dom@19 gsap @gsap/react lenis
npm install @vercel/speed-insights tailwindcss @tailwindcss/postcss
npm install clsx tailwind-merge class-variance-authority

# Dev
npm install -D eslint @tailwindcss/typography tailwindcss @tailwindcss/postcss
```

*Exact versions should follow the repo `package.json` / lockfile; bump Next/React on minors together after reading Next release notes.*

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **WordPress REST + `_embed`** | **WPGraphQL** (+ WPGraphQL for ACF) | Many custom post types, nested ACF, or you need one round-trip for complex graphs and strong typing via codegen—adds PHP plugin ops + schema governance. |
| **`fetch` + `next: { revalidate, tags }`** | **`unstable_cache`** for non-fetch work | Use `unstable_cache` when data comes from helpers that don’t use `fetch`, or you need keyed cache + tags in one place (Context7 Next.js 16 patterns). |
| **Time-based ISR** (`revalidate: N`) | **On-demand** `revalidateTag` / webhook from WP | When editors expect near-instant publish; requires a secure route or automation to call revalidation—more moving parts. |
| **Lenis** | **Native scroll only** | If motion budget drops; Lenis removal simplifies scroll sync but changes feel. |
| **npm** | **pnpm** | Monorepo or disk efficiency; migration is optional and needs Vercel `installCommand` update. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **WordPress as the public page renderer** for marketing | Defeats Next performance/UX control; larger attack surface | Next owns all routes; WP is API-only. |
| **Dumping raw `content.rendered` to DOM without a policy** | XSS / broken HTML risk from plugins | Sanitize (e.g. DOMPurify server or trusted pipeline) + typography styles; document trust boundary. |
| **Animating layout props** (width/height/margin) in GSAP | Scroll jank, CLS, breaks `AGENTS.md` perf bar | Transform + opacity; `will-change` sparingly. |
| **Duplicate scroll controllers** (Lenis + conflicting smooth-scroll libs) | ScrollTrigger desync, hard-to-debug bugs | One smooth-scroll strategy; GSAP ticker integration documented in one module. |
| **GraphQL layer “because it’s newer”** | Ops + WP plugin burden if REST already meets list/detail posts | Stay on REST until product complexity justifies GraphQL. |
| **Heavy client data fetching for blog lists** | Waterfalls, worse SEO/TTFB vs RSC | Fetch posts in Server Components; client islands only for interactivity. |

## Stack Patterns by Variant

**If the site stays marketing + blog (current `PROJECT.md`):**

- Use **Server Components** for listing and slug pages; **`fetch` with `next: { revalidate, tags: ['posts'] }`** for WP lists/detail where you want ISR (Next.js 16 docs: tag-based revalidation with `revalidateTag` in Route Handler or Server Action when WP publishes).
- Keep **GSAP in `"use client"`** islands; pass **serializable props** from server (no passing functions/server-only secrets).

**If editors need faster than revalidate windows:**

- Add **on-demand revalidation** (webhook → Next Route Handler → `revalidateTag('posts')` or path revalidation)—still keep REST unless GraphQL is already required.

**If bundle size is a priority:**

- Audit **Three/R3F** and **AI** packages; remove if unused.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@16` | `react@19` + `react-dom@19` | Keep React versions aligned; check Next release notes on minimum React. |
| `gsap@3.13` | `@gsap/react@2.1` | Register plugins once; `useGSAP` + `ScrollTrigger` per Greensock docs. |
| `lenis@1.x` | `gsap` + `ScrollTrigger` | Sync Lenis’ RAF with `gsap.ticker`—**single animation frame loop** (project-specific wiring; validate in `ClientLayout` / Lenis module). |
| `@tailwindcss/postcss@4.x` | `tailwindcss@4.x` | Keep PostCSS plugin pair on same major. |
| **Peer deps** | Three.js / R3F / React | Often drives `--legacy-peer-deps` on Vercel; treat as **known constraint** until upgraded as a batch. |

## Sources

- **Context7** `/vercel/next.js` **v16.1.1** — `fetch` caching (`cache: 'force-cache' | 'no-store'`, `next: { revalidate, tags }`), `unstable_cache`, `revalidateTag`, Cache Components / `cacheTag` patterns (topics: App Router caching & revalidation).
- **Context7** `/greensock/react` — `useGSAP`, `scope` ref for selector scoping, ScrollTrigger cleanup behavior.
- **Context7** Tailwind: resolve did not return authoritative **tailwindcss** core ID; **Tailwind v4** stack taken from **project `package.json` + Tailwind v4 PostCSS docs** (verify upgrades on https://tailwindcss.com/docs ).
- **Project facts:** `d:/projects/sites/ktgv2/package.json`, `next.config.js`, `vercel.json`, `src/lib/wordpress.js`, `.planning/PROJECT.md`, `AGENTS.md`.
- **Web ecosystem (MEDIUM confidence):** Headless WP + Next patterns (ISR, webhooks, GraphQL vs REST tradeoffs)—use for roadmap options, not as vendor guarantees.

---
*Stack research for: Next.js marketing site + headless WordPress blog (brownfield / evolution)*  
*Researched: 2026-03-21*

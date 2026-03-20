# Feature Research

**Domain:** Public marketing + portfolio + headless WordPress blog (Next.js App Router on Vercel)  
**Project:** KTG One (ktgv2) — see `.planning/PROJECT.md`  
**Researched:** 2026-03-21  
**Confidence:** **MEDIUM** — Next.js capabilities verified via Context7 (`/vercel/next.js/v16.0.3`); comparable-product norms blend official framework support with industry patterns (some WebSearch-only = lower confidence).

## Feature Landscape

### Table Stakes (Users Expect These)

Features visitors, hiring managers, and partners assume exist on a credible modern marketing site with a blog. Missing these feels unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Fast perceived performance** | Core Web Vitals and “instant” navigation are baseline for tech/creative brands; slow sites signal poor craft | MEDIUM | Next.js server-first routes + image optimization; motion must not regress LCP/CLS (PROJECT: GSAP transform/opacity discipline). |
| **Mobile-responsive layout** | Majority of first touches are mobile; broken layouts read as neglected | MEDIUM | Tailwind-first; test key breakpoints for blog + marketing pages. |
| **Clear primary navigation + wayfinding** | Users must find Work, Services, Blog, Contact (or equivalents) without hunting | LOW | Information architecture is a product decision; stale nav hurts credibility. |
| **Contact / next-step CTA** | Marketing sites exist to start conversations; dead-end pages frustrate | LOW–MED | Email, form, or calendar link — at least one obvious path. |
| **Blog index + readable post pages** | Headless WP stack implies editorial content is a first-class surface | MEDIUM | List + `[slug]` (validated in PROJECT); pagination or “load more” when post count grows. |
| **Stable URLs for posts** | Sharing and SEO depend on durable permalinks | LOW | Slug routing in Next; canonical alignment with WordPress permalinks. |
| **Featured images / media that render reliably** | Social preview and reading experience expect hero/OG imagery | MEDIUM | `_embed` for featured media (PROJECT); fallbacks when missing. |
| **Page-level SEO metadata** | Search and social sharing need title, description, canonical, OG/Twitter | MEDIUM | Next.js App Router **Metadata** / `generateMetadata` — Open Graph and Twitter cards use **absolute URLs** for images per framework docs. |
| **Sitemap + robots** | Discoverability for marketing URLs and blog posts | MEDIUM | `sitemap.(js|ts)` and `robots.(js|ts)` conventions in `app/`; large sites may split sitemaps (`generateSitemaps`). |
| **Sane error handling for CMS** | WordPress outages shouldn’t white-screen the whole site | MEDIUM | Graceful empty states / cached fallbacks; align fetch caching with explicit decision (PROJECT “Active”: `no-store` vs `revalidate`). |
| **404 / not-found** | Broken links happen; professional sites acknowledge them | LOW | `not-found` route pattern in App Router. |
| **Accessible basics** | Keyboard, focus, contrast, semantic landmarks — increasingly table stakes for public sites | MEDIUM | Especially for animated UIs: reduced motion, focus order, not “motion instead of content.” |
| **Security posture (public site)** | No accidental exposure of draft content, admin URLs, or API keys in client bundles | MEDIUM | Read-only WP from app; env for URLs; sanitize HTML bodies from WP (PROJECT CONCERNS). |

### Differentiators (Competitive Advantage)

Features that comparable boutique agency / technical portfolio sites *may* have, but that are not universal — this is where KTG One’s **core value** (storytelling + motion + credible brand) should show up.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Distinctive motion design (GSAP + Lenis)** | Scroll storytelling and “feel” separate premium studios from template portfolios | HIGH | PROJECT explicitly positions this; must stay perf-safe (transform/opacity, cleanup via `useGSAP`). |
| **Editorial, long-form narrative** | Demonstrates depth of thinking — not only screenshots | MED–HIGH | Pairs with WordPress for real writing, not lorem ipsum. |
| **Case-study depth (problem → approach → outcome)** | Wins trust vs logo grids alone; common among strong agency sites | MEDIUM | Often implemented as static sections + MDX or CMS fields; may be marketing pages, not WP posts. |
| **Rich preview on share (OG / Twitter)** | Reinforces brand when links are dropped in Slack/X/LinkedIn | MEDIUM | Dynamic `generateMetadata` for posts; brand OG template for static pages. |
| **Structured data (JSON-LD) for articles** | Better eligibility for rich results / clearer semantics | MEDIUM | Where implemented (PROJECT notes JSON-LD where present); expand consistently for blog. |
| **Performance as proof** | For agencies/dev consultancies, Lighthouse-like excellence is a silent salesperson | MEDIUM | Vercel Analytics / Speed Insights (PROJECT mentions Speed Insights) support the story with evidence. |
| **Thoughtful content ops** | Editors can publish without devs — headless WP’s reason for being | LOW–MED | Workflow in WP (categories, tags, preview) — product/process differentiator more than a single UI control. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **“Real-time” blog / live CMS preview inside Next** | Feels modern | Tight coupling, auth complexity, WebSocket/long-poll cost; PROJECT out-of-scope for visitor auth | WordPress preview links or staged content workflow; optional ISR/on-demand revalidation with webhooks when needed. |
| **Full-site WordPress theme + Next** | Reuse existing WP templates | Duplicated UX, SEO canonical conflicts, maintenance hell | Single rendering surface (Next); WP as content API only — matches current architecture. |
| **Heavy site search (Algolia-class) on day one** | “We need search” | Cost + indexing + relevance tuning for small catalogs | Defer until content volume justifies; start with good nav, tags, and Google `site:` as stopgap. |
| **Comments / community on marketing posts** | Engagement | Spam, moderation, liability, performance | Use third-party on canonical URL or LinkedIn/Twitter for discussion; keep marketing site read-only. |
| **Member-only blog** | Exclusivity | Conflicts with public marketing goals; adds auth (PROJECT: out of scope) | Public posts + separate gated product if ever required. |
| **More animation everywhere** | “Wow” factor | Motion sickness, a11y failures, jank | Restraint + `prefers-reduced-motion`; hero/key sections only. |
| **Parallel experimental app trees in production** | Rapid design iteration | Confusing source of truth; deploy drift | Keep experiments in branches; canonical `src/` only for production (PROJECT notes `ktg*` trees). |

## Feature Dependencies

```
[Crawlable URLs + metadata]
    └──requires──> [Stable routes: marketing pages + blog slug]
                       └──requires──> [WordPress REST client + error handling]

[Fresh blog content in production]
    └──requires──> [Fetch caching / revalidation strategy — explicit decision]
        └──enhances──> [Sitemap includes new posts]

[Social share quality]
    └──requires──> [Absolute URLs for OG/Twitter images + per-post metadata]

[GSAP storytelling]
    └──requires──> [Client islands + Lenis/GSAP lifecycle]
        └──conflicts──> [Layout-thrashing animations / uncleaned tweens]
```

### Dependency Notes

- **SEO metadata requires stable routes:** Dynamic `generateMetadata` depends on knowing slug and fetching post data; failures must not emit empty titles for indexable URLs.
- **“Fresh content” requires a caching policy:** Table stakes for *accuracy* conflict with *build speed* unless revalidate or webhooks are defined (flagged Active in PROJECT).
- **Motion differentiator vs performance table stakes:** The same GSAP layer must not undermine LCP/CLS; perf budgets are a dependency gate for shipping animation-heavy sections.

## MVP Definition

Aligned with PROJECT.md **Validated** items as baseline; **Active** items as hardening, not optional forever.

### Launch With (v1)

- [ ] **Marketing home + key story sections** — establishes brand and positioning  
- [ ] **Blog index + post template** — WordPress-sourced list and `[slug]` with embedded media  
- [ ] **Global layout + typography + theme** — coherent shell (Tailwind v4, fonts)  
- [ ] **Core SEO surfaces** — metadata, sitemap, robots, sensible 404  
- [ ] **Motion within perf constraints** — GSAP/Lenis where brand-critical, not blocking content  

### Add After Validation (v1.x)

- [ ] **Sitemap pagination / multi-sitemap** — trigger: post count and indexer limits (PROJECT flags >100 posts)  
- [ ] **On-demand revalidation or webhooks** — trigger: editors expect near-instant publish without redeploy  
- [ ] **Deeper case-study templates** — trigger: sales need proof, not just visuals  
- [ ] **RSS feed** — trigger: audience asks or distribution partners expect it  

### Future Consideration (v2+)

- [ ] **Alternative CMS or federated content** — PROJECT marks WP replacement as major pivot  
- [ ] **Native apps or authenticated areas** — explicitly out of scope for current public site  

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Credible performance (CWV) | HIGH | MEDIUM | P1 |
| Blog read path + WP integration | HIGH | MEDIUM | P1 |
| SEO metadata + sitemap + robots | HIGH | MEDIUM | P1 |
| Contact / CTA | HIGH | LOW | P1 |
| Distinctive GSAP storytelling | HIGH | HIGH | P1 (brand) |
| JSON-LD across posts | MEDIUM | LOW–MED | P2 |
| RSS | MEDIUM | LOW | P2 |
| Full-text search | LOW–MED | HIGH | P3 |
| WP live preview in-app | LOW | HIGH | P3 (anti-feature for v1) |

**Priority key:** P1 = launch credibility; P2 = growth/SEO polish; P3 = defer unless pull from users.

## Competitor Feature Analysis

Representative **comparables** (categories, not exhaustive): Vercel’s headless WordPress starter and reference architectures; boutique dev/design agency marketing sites; senior IC portfolios with engineering blogs.

| Feature | Typical headless WP + Next starter | Strong agency / studio site | KTG One (intent) |
|---------|-----------------------------------|-----------------------------|------------------|
| Blog + dynamic routes | Yes (posts as data) | Sometimes (often case studies over blog) | Yes — editorial blog is core |
| OG/Twitter + metadata | Yes (patterns in templates) | Yes | Yes — align with Next Metadata API |
| Motion / storytelling | Light by default | Often custom (video, scroll) | **High** — GSAP + Lenis as differentiator |
| Search | Sometimes scaffolded | Often minimal | Defer until needed |
| Comments | Rare in starters | Rare on marketing | Avoid (anti-feature) |
| Analytics | Vercel / generic | Heatmaps + A/B sometimes | Speed Insights + analytics as proof |

## Sources

- **HIGH:** Next.js 16 docs via Context7 — Metadata (`generate-metadata`), Open Graph/Twitter (absolute image URLs), `sitemap` and `robots` file conventions, `generateSitemaps` for large sites — [Next.js on GitHub / Vercel](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/03-api-reference/04-functions/generate-metadata.mdx)  
- **MEDIUM:** `.planning/PROJECT.md` (validated scope, constraints, Active concerns)  
- **MEDIUM:** `AGENTS.md` (GSAP, WordPress client patterns, deployment)  
- **LOW (industry blogs / summaries):** Headless WordPress + Next.js guides (e.g. ISR, webhooks, sitemap plugins) — useful for checklists, verify per implementation  

---
*Feature research for: headless WordPress + Next.js public marketing + blog*  
*Researched: 2026-03-21*

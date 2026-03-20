# Requirements: KTG One (ktgv2)

**Defined:** 2026-03-21  
**Core Value:** Visitors reliably get a fast, credible brand experience and can read blog content sourced from WordPress without the marketing site depending on WordPress for page shells or routing.

## v1 Requirements

### Content & CMS

- [ ] **CMS-01**: Site retrieves WordPress posts via REST (`/wp/v2/posts`) with `_embed` for featured media using the shared client in `src/lib/wordpress.js`
- [ ] **CMS-02**: Site loads a single post by slug for dynamic blog routes, including graceful handling when the API returns empty or errors
- [ ] **CMS-03**: Published WordPress HTML bodies render in post detail without breaking the page shell (trust/sanitization stance documented and consistent)

### Blog

- [ ] **BLOG-01**: Visitor can browse a blog index that lists posts from WordPress
- [ ] **BLOG-02**: Visitor can open a post at `/blog/[slug]` with stable URLs aligned to WordPress permalinks
- [ ] **BLOG-03**: Unknown slugs show the App Router not-found experience (not a generic 500)

### Marketing & shell

- [ ] **MRKT-01**: Marketing pages use the shared app layout (fonts, global styles, header/footer patterns as implemented)
- [ ] **MRKT-02**: Client-only shell (Lenis, GSAP-capable layout) wraps interactive routes without hydration failures on primary pages

### Motion & performance

- [ ] **MOTN-01**: GSAP usage follows project rules: `useGSAP` with scope, ScrollTrigger registered, transform/opacity-first animations
- [ ] **MOTN-02**: Smooth scroll (Lenis) and ScrollTrigger stay synchronized (single driver; no duplicate scroll controllers)

### SEO & discoverability

- [ ] **SEO-01**: App Router `metadata` / `generateMetadata` provides titles and descriptions for core marketing and blog routes
- [ ] **SEO-02**: Social sharing metadata (Open Graph / Twitter) uses absolute image URLs where dynamic metadata is implemented
- [ ] **SEO-03**: `sitemap.xml` (or generated sitemap route) includes key static routes and blog post URLs the product should expose

### Operations & reliability

- [ ] **OPS-01**: Production build matches documented constraints (`npm install --legacy-peer-deps` where required) and passes `npm run build` in CI
- [ ] **OPS-02**: Observability: Speed Insights (or equivalent documented RUM) is included for production monitoring story

## v2 Requirements

Deferred until triggers in `.planning/research/FEATURES.md` / `SUMMARY.md` fire (volume, editorial expectations).

### CMS & caching

- **CMSV2-01**: All WordPress `fetch` calls use a shared timeout/abort strategy (no hung SSR on slow upstream)
- **CMSV2-02**: Documented cache policy (`revalidate` vs `no-store` vs tags) matches `AGENTS.md` and production freshness needs
- **CMSV2-03**: On-demand revalidation (webhooks + `revalidateTag` / `revalidatePath`) if editors require near-instant publish

### SEO & scale

- **SEOV2-01**: Sitemap generation paginates or loops so more than 100 posts are discoverable when catalog exceeds one REST page
- **SEOV2-02**: `robots.txt` / split sitemaps if index size warrants

### Content & product

- **PRODV2-01**: Deeper case-study or expertise templates if sales narrative requires structured proof
- **PRODV2-02**: RSS feed if distribution partners or audience demand it

### Engineering hygiene

- **ENGV2-01**: Remove unused dependencies (`ai`, `@ai-sdk/openai`, `zustand`, orphan `array`, unused R3F stack) or restore intentional features
- **ENGV2-02**: Resolve experimental `ktg*` / duplicate trees so `src/` is the only production source of truth

## Out of Scope

| Feature | Reason |
|---------|--------|
| Replacing WordPress with another CMS | Major pivot; not v1 |
| Visitor accounts / auth | Public marketing site |
| Native mobile apps | Web-first |
| Real-time in-app CMS preview | Complexity; use WP workflows / optional webhooks instead |
| Heavy third-party site search (e.g. Algolia) | Defer until content volume justifies |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CMS-01 | Phase 2 | Pending |
| CMS-02 | Phase 2 | Pending |
| CMS-03 | Phase 2 | Pending |
| BLOG-01 | Phase 2 | Pending |
| BLOG-02 | Phase 2 | Pending |
| BLOG-03 | Phase 2 | Pending |
| MRKT-01 | Phase 1 | Pending |
| MRKT-02 | Phase 1 | Pending |
| MOTN-01 | Phase 1 | Pending |
| MOTN-02 | Phase 1 | Pending |
| SEO-01 | Phase 3 | Pending |
| SEO-02 | Phase 3 | Pending |
| SEO-03 | Phase 3 | Pending |
| OPS-01 | Phase 3 | Pending |
| OPS-02 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-21*  
*Last updated: 2026-03-21 after roadmap creation (traceability)*

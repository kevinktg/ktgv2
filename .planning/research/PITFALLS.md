# Pitfalls Research

**Domain:** Next.js App Router + headless WordPress (REST API) — brownfield marketing/blog site  
**Researched:** 2026-03-21  
**Confidence:** MEDIUM–HIGH (Next.js/WP REST: HIGH via Context7 + developer.wordpress.org; operational/plugin/CDN interactions: MEDIUM, often environment-specific)

## Critical Pitfalls

### Pitfall 1: Mismatched caching semantics (Next Data Cache vs route cache vs WordPress origin)

**What goes wrong:**  
Editors publish in WordPress but the Next site shows old titles, lists, or bodies for minutes or “forever.” Alternatively, ISR/`revalidateTag` appears broken even though Next config is correct.

**Why it happens:**  
`fetch(..., { next: { revalidate: N } })` caches in Next’s **Data Cache** with time-based revalidation (stale-while-revalidate style) ([Next.js caching guide](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/02-guides/caching.mdx)). A separate issue is **WordPress or edge layers caching JSON** at `/wp-json/**` (security plugins, LiteSpeed, reverse proxies), so Next never sees fresh JSON. Teams also confuse **`revalidatePath`** (route/layout cache) with **`revalidateTag`** / tagged `fetch` (data cache)—on-demand updates may need the right lever ([`revalidateTag` docs](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/03-api-reference/04-functions/revalidateTag.mdx)).

**How to avoid:**  
- Tag WordPress-backed fetches: `fetch(url, { next: { revalidate: T, tags: ['posts', 'post-slug'] } })` and call `revalidateTag('posts', 'max')` from a Route Handler when WordPress publishes (webhook).  
- Validate origin behavior: curl `/wp-json/wp/v2/posts` with and without cookies; exclude `/wp-json/**` from aggressive page-cache plugins or set correct cache-control for API responses.  
- Document one **authoritative freshness policy** (time-based only vs webhook + tags) and align `AGENTS.md` with code (`cache: 'no-store'` vs `revalidate`).

**Warning signs:**  
Stale content after deploy; different JSON in browser vs server; “works after purge plugin”; ISR interval and UI staleness unrelated.

**Phase to address:**  
**Integration alignment / hardening** — single decision on cache + webhook path; verify WP/plugin/CDN.

---

### Pitfall 2: Treating `cache: 'no-store'` and `next.revalidate` as interchangeable

**What goes wrong:**  
Either accidental over-fetching (no cache, slow TTFB, hammering WordPress) or accidental staleness (cached fetch when the team expected “always fresh”).

**Why it happens:**  
Next documents three distinct `fetch` strategies in Server Components: default/`force-cache`, `cache: 'no-store'` (every request), and `next: { revalidate }` (ISR-like) ([App Router migration / data fetching](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/02-guides/migrating/app-router-migration.mdx)). Mixing them across `getPosts`, sitemap, and `generateMetadata` without a matrix causes inconsistent behavior.

**How to avoid:**  
Maintain a small **fetch policy table** in code or docs: blog list, single post, sitemap, connection test — each with explicit `cache` / `next.revalidate` / `tags`. Use `no-store` only where freshness dominates cost (e.g. admin previews if added later).

**Warning signs:**  
WordPress rate limits or slow TTFB; contradictory comments (“always fresh”) next to `revalidate: 60`.

**Phase to address:**  
**Hardening** — align `wordpress.js` and all call sites with the chosen policy (this repo flags `AGENTS.md` vs `revalidate` mismatch in `PROJECT.md`).

---

### Pitfall 3: Pagination and “first page only” lists (sitemap, redirects, imports)

**What goes wrong:**  
Sitemaps, static path generation, or “all posts” feeds silently drop content beyond the first REST page (commonly 100 posts per request unless looped). SEO gaps or missing routes.

**Why it happens:**  
WordPress REST returns paginated collections and exposes totals via **`X-WP-Total`** and **`X-WP-TotalPages`** ([`WP_REST_Posts_Controller`](https://developer.wordpress.org/reference/classes/wp_rest_posts_controller/get_items/)). Code that calls `getPosts(1, 100)` once never sees page 2+ (noted in `../codebase/CONCERNS.md` for this repo).

**How to avoid:**  
Loop until `page > totalPages` (using response headers), or use a dedicated endpoint/workflow that returns all slugs for build/sitemap. Cap `per_page` within API max (filter `rest_*_collection_params` on WP if needed — see [collection params hook](https://developer.wordpress.org/reference/hooks/rest_this-post_type_collection_params/)).

**Warning signs:**  
Post count in WP admin > URLs in sitemap; new posts missing from static generation lists.

**Phase to address:**  
**SEO / content completeness** — sitemap + any bulk slug fetch.

---

### Pitfall 4: Unbounded or inconsistent upstream waits (no abort on main fetch paths)

**What goes wrong:**  
SSR, ISR regeneration, or build steps hang when WordPress is slow or TCP stalls; Vercel/serverless timeouts; empty fallbacks that look like “no posts.”

**Why it happens:**  
Timeouts are easy to add for diagnostics but omitted on hot paths. This codebase uses `fetchWithTimeout` for connection tests and some fallbacks, but primary `getPosts` / `getPostBySlug` use plain `fetch` ([`CONCERNS.md`](../codebase/CONCERNS.md), [`wordpress.js`](../../src/lib/wordpress.js)).

**How to avoid:**  
Route **all** WordPress fetches through one wrapper with `AbortSignal`, shared timeout, structured logging, and consistent error → empty-array or 404 behavior. Tune timeouts separately for build vs runtime if needed.

**Warning signs:**  
Intermittent 504s; logs showing long gaps before response; build flakes when CMS is under load.

**Phase to address:**  
**Reliability hardening** — single client module and observability.

---

### Pitfall 5: Rendering `post.content.rendered` without a threat model

**What goes wrong:**  
XSS if WordPress is compromised or a malicious post slips through; or broken layout when sanitization strips needed embeds.

**Why it happens:**  
`dangerouslySetInnerHTML` is the common way to render WordPress HTML in React. Risk is not “Next” but **trust boundary** on CMS + plugins (shortcodes, embeds, ads).

**How to avoid:**  
Keep WordPress locked down (roles, minimal plugins, updates). For higher assurance, sanitize server-side (allowlist) or use a constrained renderer; avoid mixing raw CMS HTML with user-supplied markdown from untrusted sources.

**Warning signs:**  
New plugins injecting scripts; unexpected `<script>` in post body in REST JSON.

**Phase to address:**  
**Security hardening** — optional sanitization pass after threat model review.

---

### Pitfall 6: Build-time coupling to live WordPress without a fallback slug source

**What goes wrong:**  
`generateStaticParams` returns few or no paths when the API fails during CI; first deploy or WP outage shrinks prerendered routes (mitigated partially by `dynamicParams`).

**Why it happens:**  
Static params are generated from a live call; no persisted slug list for build-only use ([`CONCERNS.md`](../codebase/CONCERNS.md)).

**How to avoid:**  
Optional: export slugs at build from a reliable artifact (CI artifact, generated file, or WP CLI); or accept runtime-only generation and document it. Add health checks before static param generation in CI.

**Warning signs:**  
Build succeeds but blog index empty; “works locally” when WP is up.

**Phase to address:**  
**Build/CI hardening** — deterministic params or explicit dynamic strategy.

---

### Pitfall 7: CORS and client-side REST calls (when features move auth or previews to the browser)

**What goes wrong:**  
Browser-blocked requests to WordPress; missing `Authorization` on cross-origin calls; confusion about exposed headers (`X-WP-Total`, pagination).

**Why it happens:**  
WordPress REST configures CORS and exposes specific headers by default in core ([`WP_REST_Server`](https://developer.wordpress.org/reference/classes/wp_rest_server/)). Patterns that work in Node `fetch` fail in the browser without correct WP filters and Next origin config.

**How to avoid:**  
Prefer **server-side** fetches for CMS data. If the client must call WP, plan CORS, nonce/JWT/application passwords, and never expose secrets in `NEXT_PUBLIC_*`.

**Warning signs:**  
CORS errors only in production; preflight failures on `/wp-json`.

**Phase to address:**  
**Feature work** (previews, logged-in flows) — design API boundary early.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Duplicate `fetch` options copy-pasted per call | Ship faster | Drift in cache/timeout behavior | Never long-term; centralize in `wordpress.js` |
| Rely on default `NEXT_PUBLIC_WORDPRESS_URL` fallback | Works without env | Fixed infra baked into bundle; surprises on fork | Short-term dev only; production should set env ([`CONCERNS.md`](../codebase/CONCERNS.md)) |
| `dangerouslySetInnerHTML` for all CMS HTML | Full Gutenberg fidelity | XSS surface if WP untrusted | Only with trusted CMS + hardening |
| Parallel app trees (`ktg/`, `ktg2/`) for experiments | Quick UI spikes | Wrong file edited; merge confusion | Move to branch or archive outside app root |
| `npm ci` in CI without `--legacy-peer-deps` while Vercel uses legacy | Cleaner install | CI vs Vercel drift | Align or remove peer conflict at source ([`CONCERNS.md`](../codebase/CONCERNS.md)) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| WordPress REST `posts` | Single-page fetch for “all” content | Paginate using `X-WP-Total` / `X-WP-TotalPages` headers |
| `_embed` | 403/blocked embed on some hosts; fat payloads | Fallback without embed + separate media fetch; cache embed responses |
| Next Data Cache | Expecting `revalidatePath` alone to refresh `fetch` cache | Use `revalidateTag` + `next.tags` on `fetch`, or match strategy to docs |
| WP plugins (SEO, cache, firewall) | Caching or blocking `/wp-json` | Exclude API routes from page cache; allow REST for server IPs if needed |
| Webhooks (publish) | No signature verification | Verify HMAC or shared secret in Route Handler before `revalidateTag` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|------------------|
| Heavy `_embed` on large lists | Slow list pages, large JSON | Fetch embed only on detail views; field-filter where possible | Many posts per page or slow WP |
| No origin cache awareness | Next + WP “double stale” | Test REST response headers; exclude JSON from aggressive caches | Any caching plugin/CDN in front of WP |
| Client-side waterfall to WP | Browser waterfalls, CORS | Server Components + one batched fetch | Adding client-only widgets that fetch per post |
| Build-time fan-out to WP | Long builds, rate limits | Cache slug list; reduce `generateStaticParams` fan-out | Large site or strict WP rate limits |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Raw HTML from CMS in React | XSS if WP/plugin compromised | Sanitize, CSP, minimal plugins, audit posts |
| Application password or webhook secret in client bundle | Account compromise, forged revalidation | Server-only env vars; Route Handlers |
| Exposing draft/preview URLs | Content leak | `draftMode`, tokenized preview routes, no public drafts |
| Trusting REST without TLS | MITM | HTTPS only; pin env URLs |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Stale excerpt/title after publish | Editors think site is broken | Webhook revalidation + visible “last synced” only if needed |
| Error states show empty blog | Looks like site down | Differentiate empty vs error; retry or stale fallback messaging |
| Loading layout shift from embedded media | CLS | Reserve space; lazy media; sanitize dimensions if available |

## "Looks Done But Isn't" Checklist

- [ ] **Caching:** Tagged `fetch` + documented policy matches production behavior — verify with a test publish and known staleness window
- [ ] **WordPress origin:** `/wp-json` responses not blindly cached by WP plugins — verify with curl/incognito ([community pattern](https://stackoverflow.com/questions/79744583/next-js-isr-revalidatetag-wasnt-updating-data-from-wordpress-pods-turned-o); **MEDIUM** confidence, environment-specific)
- [ ] **Sitemap / lists:** Pagination covers all posts — compare WP total count to generated URLs
- [ ] **Timeouts:** All production `fetch` paths use shared timeout — no hung SSR
- [ ] **Build:** CI can build when WP is slow/down — understood tradeoffs for `generateStaticParams`
- [ ] **HTML:** Threat model for `dangerouslySetInnerHTML` documented — sanitization or acceptance signed off

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Origin caching stale JSON | LOW–MEDIUM | Purge WP/CDN cache; exclude `/wp-json`; redeploy or tag revalidation |
| Wrong revalidation API | LOW | Add `next.tags` + `revalidateTag`; re-read Next 16 docs for `profile: 'max'` |
| Missing posts in sitemap | MEDIUM | Implement pagination loop; re-submit sitemap |
| XSS concern | HIGH | Take post down; sanitize layer; rotate WP creds; audit plugins |
| CI ≠ Vercel install | MEDIUM | Align `npm ci` flags or fix peer deps |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Cache mismatch / WP JSON cached | Hardening: integration + infra | Publish test; compare REST body over time |
| `no-store` vs `revalidate` drift | Hardening: client API module | Grep `fetch`; table review |
| Pagination / sitemap gaps | SEO / content phase | Count URLs vs WP |
| Fetch timeouts | Reliability phase | Chaos or slow WP in staging |
| XSS / HTML trust | Security phase | Pen test or sanitization review |
| Build static params | Build/CI phase | Build with WP blocked |
| CORS / client WP | Feature phase (previews) | Browser network tab |

## Sources

- Next.js v16.0.3 docs (Context7 `/vercel/next.js/v16.0.3`): `fetch` + `next.revalidate`, caching strategies, `revalidateTag` / `next.tags` ([caching](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/02-guides/caching.mdx), [revalidateTag](https://github.com/vercel/next.js/blob/v16.0.3/docs/01-app/03-api-reference/04-functions/revalidateTag.mdx))
- WordPress REST API (Context7 `/websites/developer_wordpress_reference`): pagination headers `X-WP-Total`, `X-WP-TotalPages`, CORS/header exposure ([REST server](https://developer.wordpress.org/reference/classes/wp_rest_server/))
- Project facts: `../PROJECT.md`, `../codebase/CONCERNS.md`, `../../src/lib/wordpress.js`
- Stack Overflow / ecosystem: LiteSpeed (or similar) caching REST JSON breaking ISR expectations — **MEDIUM** confidence; treat as a checklist item, not universal law

---
*Pitfalls research for: Next.js + headless WordPress (subsequent-milestone: features & hardening)*  
*Researched: 2026-03-21*

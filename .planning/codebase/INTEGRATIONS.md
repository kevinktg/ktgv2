# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Headless CMS (WordPress):**
- WordPress REST API — Blog posts and embedded media for the marketing site.
  - Client: `fetch` in `src/lib/wordpress.js` (no WordPress PHP SDK).
  - Base URL: `process.env.NEXT_PUBLIC_WORDPRESS_URL` with fallback to `https://lawngreen-mallard-558077.hostingersite.com` (same file).
  - Endpoints: `/wp-json/wp/v2/posts` with `_embed` for featured images; slug queries for single posts; optional `testWordPressConnection()` against `/wp-json/wp/v2`.
  - Caching: `next: { revalidate: 60 }` on main fetches (ISR-style revalidation, not `cache: 'no-store'` on the default path — see AGENTS.md vs implementation when changing freshness requirements).
  - Headers: `User-Agent`, `Accept`, `Referer` set to reduce blocking; 403 fallback retries without `_embed`.

**AI (optional / future):**
- Vercel AI SDK — `ai` and `@ai-sdk/openai` in `package.json` for OpenAI-compatible providers; no active server routes or client imports under `src/` at analysis time. If reintroducing chat or streaming, add a Route Handler and document required env vars (e.g. `OPENAI_API_KEY`) in Vercel without committing values.

**Fonts (Google):**
- Google Fonts via `next/font/google` — `Syne` and `Inter` registered in `src/app/layout.jsx` (no runtime font CSS from external `<link>` tags).

## Data Storage

**Databases:**
- None in-app — No Prisma, Drizzle, or SQL clients; content is fetched from WordPress over HTTPS.

**File Storage:**
- Static assets in `public/` (e.g. `public/assets/` referenced from metadata in `src/app/layout.jsx`).
- WordPress-hosted media URLs returned through `_embedded` featured media and used with Next.js `Image` where applicable.

**Caching:**
- Next.js fetch caching / ISR revalidation windows in `src/lib/wordpress.js` (`revalidate: 60`). No Redis or external cache.

## Authentication & Identity

**Auth Provider:**
- None for site visitors — No NextAuth, Clerk, or custom session code in `src/`. WordPress is read-only from the Next app’s perspective (public REST reads).

## Monitoring & Observability

**Analytics / performance:**
- Vercel Speed Insights — `@vercel/speed-insights/next` `SpeedInsights` component in `src/app/layout.jsx`.

**Error tracking:**
- Not integrated — No Sentry or similar in `package.json` or `src/`.

**Logs:**
- Application uses `console.error` / `console.warn` in `src/lib/wordpress.js` for API failures; no structured logging service.

## CI/CD & Deployment

**Hosting:**
- Vercel — `vercel.json` sets `framework: nextjs`, `regions: ["iad1"]`, `installCommand: npm install --legacy-peer-deps`.

**CI Pipeline:**
- GitHub Actions — `.github/workflows/deploy.yml` runs on `push`/`pull_request` to `main`: checkout, Node 20, `npm ci`, `npm run build`. (Does not deploy to Vercel by itself unless additional secrets/steps are added later.)

**CLI:**
- `npm run deploy` → `vercel --prod` (`package.json`).

## Environment Configuration

**Public / build-time variables (names only):**
- `NEXT_PUBLIC_WORDPRESS_URL` — Override WordPress origin (`src/lib/wordpress.js`).
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL for SEO/sitemap (`src/app/sitemap.js`, `src/app/blog/page.jsx`, `src/app/blog/[slug]/page.jsx`); defaults to `https://ktg.one` if unset.

**Scripts:**
- `SITE_URL` — Used by `scripts/scroll-screenshot.js` for Puppeteer target (defaults to `http://localhost:3000`).

**Secrets location:**
- Production: Vercel project environment variables (dashboard). No `.env.example` committed in this exploration; document new vars there when adding AI or other backends.

## Next.js Image & remote hosts

**Remote image patterns:**
- `next.config.js` `images.remotePatterns` allows `https://ktg.one` and `https://lawngreen-mallard-558077.hostingersite.com` (WordPress/media host alignment).

## Webhooks & Callbacks

**Incoming:**
- None — No `src/app/api/**/route.js` webhook handlers present for external services at analysis time.

**Outgoing:**
- Outbound HTTPS only — `fetch` to WordPress REST API from server components and server-side data paths; no user-configured outbound webhooks.

---

*Integration audit: 2026-03-21*

# External Integrations

**Analysis Date:** 2026-03-23 · **2026-04 update:** Production chat uses **Vercel AI SDK** on **`/api/hub/chat`** (`src/app/api/hub/chat/route.js`) with multi-provider support (e.g. Google, Anthropic, OpenAI via **`@ai-sdk/*`**). The old **ulti-chat** path under `src/app/ulti-chat/` is **removed**; a local AI Studio copy may exist only under **`_reference/ulti-chat/`** (not deployed with the main app).

## APIs & External Services

**AI Models:**
- **Hub chat (`/hub/chat`)** — `POST /api/hub/chat` (streaming)
  - SDK: `ai` + `@ai-sdk/google`, `@ai-sdk/anthropic`, `@ai-sdk/openai` (see root `package.json`)
  - Auth: **Server-side** env vars on Vercel / `.env.local` (e.g. provider keys — no `NEXT_PUBLIC_*` LLM keys in `src/`)
  - Usage: Multi-model chat UI in `src/app/hub/chat/page.jsx`

- **`@google/genai`** — still a root dependency; used where referenced (not the primary hub chat path; hub uses AI SDK)

- **OpenAI API** — main app (available via AI SDK)
  - SDK/Client: `@ai-sdk/openai` (3.0.12) via Vercel AI SDK
  - Library: `ai` (6.0.5) for streaming and tool calling
  - Auth: Expected in `OPENAI_API_KEY` environment variable (not configured)
  - Status: Available for future integration

**External Content:**
- **WordPress Blog** — main app (`src/lib/wordpress.js`)
  - Host: `https://lawngreen-mallard-558077.hostingersite.com`
  - Integration: REST API client with 10-second request timeout
  - Auth: None (public API)
  - Endpoints:
    - `GET /wp-json/wp/v2/posts` — Fetch paginated blog posts
    - `GET /wp-json/wp/v2/posts?slug={slug}` — Fetch single post by slug
    - `GET /wp-json/wp/v2` — Connection test (health check)
  - Features:
    - Paginated fetches (10 posts per page default)
    - Featured image extraction via `_embed` parameter (with fallback)
    - ISR (Incremental Static Regeneration) — 60 second revalidation
    - Error handling: Graceful 403 fallback (attempts request without `_embed`)
  - Files: `src/lib/wordpress.js` (162 lines)
  - Used by: `/blog` and `/blog/[slug]` routes

**Image Hosting:**
- **ktg.one** — Self-hosted images (main domain)
  - Enabled in Next.js image optimization config
- **lawngreen-mallard-558077.hostingersite.com** — WordPress images
  - Enabled in Next.js image optimization config

## Data Storage

**Databases:**

**Vercel Postgres:**
- Type: Managed PostgreSQL
- Connection: `POSTGRES_URL` environment variable
- Client: `postgres` (3.4.8) — PostgreSQL JavaScript client
- ORM: Drizzle ORM (0.45.1) with TypeScript typings
- Schema file: `src/lib/db/schema.js` — Single `snippets` table
- Schema details:
  - `id` (UUID primary key, auto-generated)
  - `title` (text, required)
  - `description` (text, optional)
  - `blob_url` (text, required) — Reference to Vercel Blob file
  - `tags` (text array, optional)
  - `snippet_type` (text, optional) — e.g., "gate", "technique", "protocol"
  - `source_file` (text, required) — Original DOCS file name
  - `created_at` (timestamp, auto-set)
  - `updated_at` (timestamp, auto-set)
- Migrations: Drizzle Kit generates migrations to `./drizzle/` directory
- Migration config: `drizzle.config.js`
- Query layer: `src/lib/snippets/queries.js` — CRUD operations
  - `getAllSnippets()` — Select all, ordered by created_at DESC
  - `getSnippetById(id)` — Select by UUID
  - `searchSnippets(query)` — Search by title/description (case-insensitive)
  - `createSnippet(data)` — Insert and return full record

**File Storage:**

**Vercel Blob:**
- Service: Cloud file storage (public, HTTP-accessible)
- Access token: `BLOB_READ_WRITE_TOKEN` environment variable
- Files stored: Markdown snippet content
- Path structure: `snippets/{filename}.md`
- Metadata: Content-Type: `text/markdown`, Access: `public`
- Integration: `src/lib/snippets/storage.js`
  - `uploadSnippet(filename, content)` — PUT file, returns object with `url`
  - `getSnippetContent(url)` — GET file, returns text content
- Populated by: `scripts/extract-snippets.js` — Reads local DOCS files and uploads to Blob

**Caching:**
- ISR (Incremental Static Regeneration) — 60 second revalidation on WordPress blog routes
- Next.js built-in caching for images (optimized via `next.config.js`)
- No external caching service (Redis, etc.)

## Authentication & Identity

**Auth Provider:**
- Custom/None for main app — No auth system implemented
- **Historical:** An AI Studio / Cloud Run OAuth flow may have applied to a **standalone** ulti-chat deploy — not to the integrated **`/hub/chat`** surface on Vercel

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, etc.)

**Logs:**
- Console logging via `console.error()` and `console.warn()` in:
  - WordPress client (`src/lib/wordpress.js`) — Detailed fetch errors and timeouts
  - API routes (`src/app/api/hub/snippets/route.js`) — Database and Blob errors
  - Database client (`src/lib/db/index.js`) — Missing env var errors
- No log aggregation service (Datadog, CloudWatch, etc.)

**Performance Monitoring:**
- Vercel Speed Insights (`@vercel/speed-insights/next`) — Imported in `src/app/layout.jsx`
  - Web Vitals tracking (LCP, FID, CLS)
  - Deployed to production only

## CI/CD & Deployment

**Hosting:**
- **Main app (`ktgv2`)** — Vercel (Edge Network, automatic HTTPS, CDN)
  - Custom domain: `ktg.one`
  - Build command: `next build`
  - Start command: `next start`
  - Region: `iad1` (US East Coast, per `vercel.json`)
  - npm flag: `--legacy-peer-deps` (peer dependency compatibility)
  - Includes **hub chat** and **hub APIs** in the same deployment

- **Legacy ulti-chat (standalone)** — If still operated outside this repo, would be a **separate** deploy (e.g. Cloud Run / AI Studio); **not** part of `src/app/` App Router

**CI Pipeline:**
- Not explicitly configured (no GitHub Actions, GitLab CI, etc.)
- Vercel handles automatic deployments from git pushes

## Environment Configuration

**Required env vars (main app):**
- `POSTGRES_URL` — Vercel Postgres connection string (format: `postgresql://...`)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob API token
- `NEXT_PUBLIC_WORDPRESS_URL` (optional) — WordPress API endpoint (defaults to Hostinger instance)
- **Hub chat:** Provider keys as required by `src/app/api/hub/chat/route.js` (e.g. Google / Anthropic / OpenAI — **server-only**)

**Secrets location:**
- Main app (including hub): **Vercel Environment Variables** (encrypted in Vercel dashboard)
- **`_reference/ulti-chat/`** (if present locally): may document its own env pattern — **not** production for ktg.one App Router

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected (WordPress is fetch-only, no webhook listeners)

---

*Integration audit: 2026-03-23*

# External Integrations

**Analysis Date:** 2026-03-23

## APIs & External Services

**AI Models:**
- **Google Gemini API** — ulti-chat sub-app (`src/app/ulti-chat/app/page.tsx`)
  - SDK/Client: `@google/genai` (1.17.0)
  - Auth: `GEMINI_API_KEY` environment variable (injected by AI Studio at runtime)
  - Usage: Chat interface with personas, prompt injection, skill system
  - Endpoint: Google Gemini REST API

- **OpenAI API** — main app (imported but not actively used in current code)
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
- Google OAuth implied for AI Studio (ulti-chat) — Inherited from AI Studio platform
  - `APP_URL` used for OAuth callback setup
  - Details handled by Cloud Run environment

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

- **ulti-chat sub-app** — Google Cloud Run
  - Standalone Next.js deployment with `output: 'standalone'`
  - Built via AI Studio platform (source-managed interface)
  - Environment: Custom `APP_URL` injected at runtime
  - HMR disabled during agent edits via `DISABLE_HMR=true`

**CI Pipeline:**
- Not explicitly configured (no GitHub Actions, GitLab CI, etc.)
- Vercel handles automatic deployments from git pushes

## Environment Configuration

**Required env vars (main app):**
- `POSTGRES_URL` — Vercel Postgres connection string (format: `postgresql://...`)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob API token
- `NEXT_PUBLIC_WORDPRESS_URL` (optional) — WordPress API endpoint (defaults to Hostinger instance)

**Required env vars (ulti-chat):**
- `GEMINI_API_KEY` — Google Gemini API authentication
- `APP_URL` — Cloud Run service base URL (for OAuth callbacks)

**Secrets location:**
- Main app: Vercel Environment Variables (encrypted in Vercel dashboard)
- ulti-chat: AI Studio Secrets panel (Google Cloud Secret Manager)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected (WordPress is fetch-only, no webhook listeners)

---

*Integration audit: 2026-03-23*

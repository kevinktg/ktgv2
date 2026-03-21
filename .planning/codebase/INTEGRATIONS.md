# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Content Management:**
- WordPress REST API
  - What it's used for: Blog post retrieval, featured images, post metadata
  - Client: Native fetch (wrapped in `src/lib/wordpress.js`)
  - Endpoints:
    - `GET /wp-json/wp/v2/posts` - List posts with pagination
    - `GET /wp-json/wp/v2/posts?slug={slug}` - Get single post by slug
  - Response handling: Fallback to non-`_embed` variant if 403 error
  - Cache strategy: ISR (Incremental Static Regeneration) with 60-second revalidation
  - Error handling: Graceful timeout (10 seconds) with silent failure (returns empty array/null)

**AI/Language Models:**
- OpenAI API
  - SDK: `@ai-sdk/openai` 3.0.9
  - Client: Vercel AI SDK (`ai` 6.0.5)
  - What it's used for: Unknown (installed but no active usage detected in codebase)
  - Auth: Likely `OPENAI_API_KEY` environment variable (not visible in source)

## Data Storage

**Databases:**
- None detected - Static/SSG architecture with external content source

**File Storage:**
- Hostinger-hosted WordPress media:
  - Domain: `lawngreen-mallard-558077.hostingersite.com`
  - Connection: HTTPS fetch
  - Contains: Featured images and blog media
- Local filesystem (public/assets):
  - `/public/assets/` - SVG icons, OG images, other static assets
  - Client: Next.js Static File Serving

**Caching:**
- Next.js ISR: 60-second revalidation for dynamic blog routes
- GSAP animation caching: In-memory (ScrollTrigger instances)
- Image caching: Browser cache + Vercel CDN (optimized images)

## Authentication & Identity

**Auth Provider:**
- None detected - Static site, no user authentication system

**Content Access:**
- WordPress REST API: Public endpoint (no authentication required)
- Vercel Speed Insights: Public token embedded in page

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Bugsnag, or similar)

**Performance Monitoring:**
- Vercel Speed Insights
  - Integration: `@vercel/speed-insights` 1.2.0
  - Component: `<SpeedInsights />` in `src/app/layout.jsx`
  - Metrics tracked: Core Web Vitals (LCP, FID, CLS), page load times
  - Data sent to: Vercel analytics endpoint

**Logs:**
- Browser console: Standard `console.error()` and `console.warn()` for development
- Server logs: Next.js built-in logging to stdout (Vercel capture)
- WordPress API errors logged to console with full context (URL, status, response snippet)

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Edge Functions: Available (not currently used)
  - Serverless Functions: Available (not currently used)
  - Build Command: `next build`
  - Start Command: `next start`
  - Environment: Node.js 18+

**CI Pipeline:**
- GitHub → Vercel automatic deployments
  - Trigger: Push to main branch
  - Preview deployments: Auto-generated for PRs
  - Production: Manual or automatic on merge
- Pre-deployment: ESLint checks (via `npm run lint`)

**Build Optimization:**
- Turbopack enabled for faster rebuild times
- CSS optimization enabled
- Next.js image optimization
- SWC compiler for faster transpilation

## Environment Configuration

**Required env vars:**
```
NEXT_PUBLIC_WORDPRESS_URL    # WordPress API endpoint (default: https://lawngreen-mallard-558077.hostingersite.com)
NEXT_PUBLIC_SITE_URL         # Site canonical URL (default: https://ktg.one)
OPENAI_API_KEY               # OpenAI API authentication (optional, likely not in use)
```

**Optional env vars:**
- None documented

**Secrets location:**
- Vercel Project Settings → Environment Variables (encrypted at rest)
- Local development: `.env.local` (not committed)
- Build time: Injected via Vercel CLI deployment

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Vercel Speed Insights - Automatic performance data submission on each page load
- WordPress REST API - One-directional reads (no write operations)

## Image Delivery & CDN

**Image Optimization Service:**
- Vercel Image Optimization CDN
  - Formats: AVIF (primary), WebP (fallback), original
  - Device sizes: 640, 750, 828, 1080, 1200, 1920px
  - Image sizes: 16, 32, 48, 64, 96, 128, 256px

**Allowed remote hosts:**
- `ktg.one` - Portfolio assets
- `lawngreen-mallard-558077.hostingersite.com` - WordPress media

## Third-Party Integrations Summary

| Service | Purpose | Status | Critical |
|---------|---------|--------|----------|
| WordPress (Hostinger) | Blog content | Active | No (graceful degradation) |
| OpenAI API | AI capabilities | Installed, unused | No |
| Vercel Platform | Hosting + Speed Insights | Active | Yes |
| Google Fonts | Typography | Active | Yes (with fallbacks) |
| Vercel Analytics | Performance monitoring | Active | No |

---

*Integration audit: 2026-03-21*

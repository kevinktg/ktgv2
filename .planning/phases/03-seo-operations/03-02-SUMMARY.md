# 03-02 — Sitemap + CI + Speed Insights — execution summary

**Executed:** 2026-04-03  
**Verification:** `pnpm run lint` and `pnpm run build` exit 0.

## SEO-03 — Sitemap

- `src/app/sitemap.js` — static marketing/hub URLs plus blog posts via paginated `getPosts` until an empty page (page size 100).

## OPS-01 — CI / pnpm parity

- `.github/workflows/deploy.yml` — `pnpm/action-setup@v4`, `pnpm install --frozen-lockfile`, `pnpm run build`; checkout/setup-node v4.

## OPS-02 — Speed Insights

- `src/app/layout.jsx` — `<SpeedInsights />` from `@vercel/speed-insights/next` remains mounted in production layout (no change required in this wave).

## Notes

- `vercel.json` — no change required for this plan’s outcomes; plan frontmatter listed it as optional touchpoint.

## Requirements

- SEO-03, OPS-01, OPS-02 — addressed per plan must_haves.

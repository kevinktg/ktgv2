# ktgv2 — ktg.one (Main Portfolio + AI Hub)

## HARD RULES — VIOLATE THESE AND YOU FAIL

1. SEARCH before asking. Use ls, Glob, Grep. If it's in this project, find it yourself.
2. Do NOT add dependencies. The stack is locked.
3. Do NOT refactor working code. If it works, leave it.
4. Do NOT create new files unless a task below explicitly requires it.
5. Do NOT improvise features. Only work on tasks listed below.
6. If the plan is unclear, ASK — do not guess.

## Stack (LOCKED)

- Next.js 16.1 (App Router, JSX)
- Tailwind CSS v4 + shadcn/ui
- GSAP 3.13 + @gsap/react + Lenis
- React Three Fiber + Three.js (3D elements)
- Drizzle ORM + Vercel Postgres
- Fonts: Syne (headings), Inter (body)

## Brand

- Name: .ktg / Kevin Tan
- Domain: ktg.one
- Title: ".ktg | AI Whisperer"
- Colors: Pure black (#000) + off-white, minimal palette via CSS vars
- Style: all headings lowercase, monochrome, no flashy colors
- Logo: /public/assets/ktg.svg

## Status

100% branded. Fully production-ready.

## Current Tasks (ONLY THESE)

- [ ] Final polish pass — check all pages render correctly (/, /blog, /expertise, /hub, /hub/snippets, **`/hub/chat`**, /validation)
- [ ] Hub chat (same branch until merge): verify **`/hub/chat`** end-to-end — message send, streaming, model switch, env keys on **Vercel** (see `.planning/STATE.md` Phase 6 checklist)
- [ ] Lighthouse audit all routes — target 90+
- [ ] Verify WordPress blog integration still pulling posts
- [ ] Deploy to Vercel

## DO NOT

- Change the brand identity — it's finalized
- Add new pages without explicit approval
- Touch the database schema
- Modify the GSAP scroll animations
- Change font choices

# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- JavaScript (JSX) - React components and frontend logic
- TypeScript - Optional, but configuration present via `@swc/core` transpilation
- CSS - Tailwind CSS 4 + custom global styles

## Runtime

**Environment:**
- Node.js 18+ (inferred from package dependencies and Next.js 16 requirements)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.1 - Full-stack React framework with App Router
  - Used for: Server-side rendering, static generation, API routes, image optimization
- React 19.2.0 - UI library
- React DOM 19.2.0 - DOM rendering

**Animation & Graphics:**
- GSAP 3.13.0 - Advanced animation library
- @gsap/react 2.1.2 - React hook integration for GSAP
- Three.js 0.182.0 - 3D graphics library
- @react-three/fiber 9.5.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Helper components for react-three-fiber
- Lenis 1.3.15 - Smooth scroll library
- @reactlenis component wrapper - Custom Lenis integration in `src/libs/lenis.jsx`

**Scroll & UX:**
- Simplex-noise 4.0.3 - Procedural noise for generative animations

**UI Components:**
- Radix UI:
  - @radix-ui/react-navigation-menu 1.2.14
  - @radix-ui/react-separator 1.1.8
  - @radix-ui/react-slot 1.2.4
- Lucide React 0.487.0 - Icon library
- shadcn-studio components - Component library (custom implementations at `src/components/shadcn-studio/`)

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.18 - PostCSS plugin for Tailwind
- @tailwindcss/typography 0.5.19 - Typography plugin for blog content
- class-variance-authority 0.7.1 - Variant management for components
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merge Tailwind classes safely

**State Management:**
- Zustand 4.5.7 - Lightweight state management (installed but minimal usage observed in codebase)

**AI/Language Models:**
- ai 6.0.5 - Vercel AI SDK
- @ai-sdk/openai 3.0.9 - OpenAI provider for AI SDK

**Performance:**
- @vercel/speed-insights 1.2.0 - Web performance metrics integration

**Build & Compilation:**
- @swc/core 1.15.8 - Rust-based JavaScript compiler (transpiler)
- @swc/cli 0.7.9 - CLI for SWC
- @swc/helpers 0.5.18 - Runtime helpers for SWC transformations

**Dev/Testing:**
- ESLint 9 - JavaScript linter
- Puppeteer 24.32.0 - Browser automation (for testing/debugging)

## Key Dependencies

**Critical:**
- Next.js 16.1.1 - Framework foundation; handles routing, SSR, ISR, image optimization
- React 19 - Core UI rendering engine
- GSAP + @gsap/react - Enables 60fps scrolling animations central to UX
- Lenis - Smooth scroll hijacking for scroll-based interactions

**Animation & 3D:**
- Three.js ecosystem - Enables 3D geometric background and interactive visuals
- Simplex-noise - Procedural animation/texture generation

**Styling & Components:**
- Tailwind CSS 4 - Entire design system and utility-first styling
- Radix UI - Accessible primitive components

**External Integration:**
- @ai-sdk/openai - OpenAI API client (likely for future AI features; minimal usage detected)
- @vercel/speed-insights - Observability/performance monitoring

## Configuration

**Environment:**
- Variables defined in `.env` (not visible; check `.env.example` or documentation)
- Public vars prefixed with `NEXT_PUBLIC_`:
  - `NEXT_PUBLIC_WORDPRESS_URL` - WordPress REST API endpoint (default: `https://lawngreen-mallard-558077.hostingersite.com`)
  - `NEXT_PUBLIC_SITE_URL` - Site canonical URL (default: `https://ktg.one`)

**Build:**
- `next.config.js` - Next.js configuration
  - Image optimization with AVIF/WebP formats
  - Remote image domains: `ktg.one`, `lawngreen-mallard-558077.hostingersite.com`
  - Turbopack enabled for faster builds
  - CSS optimization enabled
- `tailwind.config.js` - Tailwind CSS customization with design tokens
- `postcss.config.mjs` - PostCSS configuration (Tailwind v4 via `@tailwindcss/postcss`)
- `jsconfig.json` - JavaScript module resolution with path aliases (`@/` for `src/`)

**Linting:**
- ESLint 9 configured (config file check for `.eslintrc.json`, `.eslintrc.js`)

## Platform Requirements

**Development:**
- Node.js 18+
- npm 8+
- Browser with ES2020+ support
- 2GB+ RAM for Next.js dev server + build

**Production:**
- Deployment target: Vercel (primary; supports Node.js runtime)
- Alternative: Any Node.js 18+ hosting (self-hosted with `next start`)
- Environment: `NODE_ENV=production`

## CDN & Asset Delivery

**Images:**
- Next.js Image Optimization CDN (Vercel)
- Formats: AVIF, WebP with fallback to original
- Sources:
  - Local: `/public/assets/` (SVGs, screenshots)
  - Remote: `ktg.one`, Hostinger WordPress media

**Fonts:**
- Google Fonts (via Next.js Font API):
  - Syne: Display font (weights: 400, 700, 800)
  - Inter: Body font (weights: 400)
  - Font swap strategy for performance

---

*Stack analysis: 2026-03-21*

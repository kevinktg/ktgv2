# AGENTS.md - Development Guide for KTG One

This file contains critical information for AI coding agents working in this repository.

## Architecture

**Headless WordPress + Next.js on Vercel**
- **Backend:** WordPress REST API at configured domain
- **Frontend:** Next.js 16 App Router on Vercel
- **Content:** Fetched via WordPress REST API with `_embed` for featured images
- **Environment:** `NEXT_PUBLIC_WORDPRESS_URL` (optional, has default fallback)

## Build/Lint/Test Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checks
npm run deploy       # Vercel deployment
```

**Testing:** No test framework currently configured. Manual testing required.

## Code Style Guidelines

### Import/Export Patterns
```jsx
// Order: React/Next.js → Third-party → Local components
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { SplitText } from "./SplitText";
import { ComponentName } from "@/components/ComponentName";
```

- Named exports for components: `export function ComponentName()`
- Default exports for pages: `export default function PageName()`
- Use `@/` alias for absolute imports from src/

### Component Architecture
- **Functional components only** with `"use client";` directive
- **Forward ref pattern** for DOM references: `forwardRef((props, ref) => {...})`
- **Consistent useGSAP hook** for all GSAP animations
- **Component naming:** PascalCase with descriptive names (e.g., `HeroSection`, `ExpertiseSection`)

### Formatting Conventions
- **Indentation:** 2 spaces (no tabs)
- **Line length:** Under 100 characters
- **Comment style:** Detailed inline comments with section markers (e.g., `// --- 1. INITIAL ANIMATE IN ---`)

### Styling Guidelines
- **Tailwind CSS v4** utility-first approach
- **Custom CSS** in `src/app/globals.css` with @layer directives
- **Color theme:** Black/white with opacity variations (`bg-black text-white`)
- **Typography:** Syne font for headings, Ubuntu Mono for body/code
- **Headings:** `text-transform: lowercase` (design choice)
- **Avoid:** Hard-coded colors, use Tailwind utility classes

### Animation Patterns (CRITICAL)
```jsx
// Standard GSAP pattern
useGSAP(() => {
  gsap.from(elementRef.current, {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: elementRef.current,
      start: "top 80%",
      scrub: 1,
    }
  });
}, { scope: containerRef });
```

- **Register plugins:** `gsap.registerPlugin(ScrollTrigger);` at component top
- **Transform/opacity only** - No layout shift allowed (performance critical)
- **60fps minimum** requirement for all animations
- **Strict cleanup** using gsap.context() via useGSAP hook
- **Lenis sync:** GSAP Ticker drives smooth scroll

### Error Handling
```jsx
// API error pattern
try {
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  if (!Array.isArray(data)) {
    return []; // Fallback
  }
  return data;
} catch (err) {
  console.error('Error description:', err);
  return []; // Graceful degradation
}
```

- **Null/undefined checks** before rendering
- **Fallback content** for failed API calls
- **Console.error** for debugging (no console.log in production)

### State Management
- **useState:** Simple local state (e.g., blog posts, form data)
- **useRef:** DOM references and GSAP targets
- **useEffect:** Side effects and API calls
- **No global state:** No Redux/Zustand - use props drilling

### TypeScript Usage
- **Current state:** JavaScript only (.jsx files)
- **Runtime validation:** Manual type checking in API functions
- **JSDoc comments:** For function documentation
- **Recommendation:** Consider migrating to TypeScript for type safety

## Project-Specific Rules

### WordPress Integration
```jsx
import { getPosts } from "@/lib/wordpress";

// Always use cache: 'no-store' for fresh content
const posts = await getPosts(page, perPage);
```

- Use `src/lib/wordpress.js` client for all API calls
- Handle connection errors gracefully
- Set `cache: 'no-store'` for fresh WordPress content
- Include User-Agent headers for API requests
- **Critical:** All blog content comes from WordPress, not hardcoded content

### GSAP Integration Requirements
```jsx
// ✅ Correct: useGSAP hook with cleanup
useGSAP(() => {
  const tl = gsap.timeline({ scrollTrigger: {...} });
  // Animation code
}, { scope: containerRef });

// ❌ Wrong: No cleanup
useEffect(() => {
  gsap.to(element, {...});
}, []);
```

- **Always use useGSAP hook** from `@gsap/react`
- **Scope parameter** required for proper cleanup
- **Transform/opacity only** - Never animate layout properties (width, height, margin, padding)
- **Performance:** Use `will-change` sparingly for GPU acceleration

### File Organization
```
src/
├── app/              # Next.js App Router (pages, layouts)
├── components/       # Reusable React components
├── lib/             # Utilities (WordPress client, helpers)
└── libs/            # Third-party library wrappers (Lenis)
```

- **Components:** PascalCase filenames (e.g., `HeroSection.jsx`)
- **Utilities:** camelCase filenames (e.g., `wordpress.js`)
- **Routes:** Lowercase with hyphens (e.g., `blog/[slug]/page.jsx`)

## Development Workflow

### Before Making Changes
1. Run `npm run lint` to check code quality
2. Test animations at 60fps (use browser DevTools Performance tab)
3. Verify responsive design (mobile, tablet, desktop)
4. Check WordPress API integration if applicable
5. Verify SEO metadata is complete

### Code Review Checklist
- [ ] Proper import order (React/Next.js → libraries → local)
- [ ] GSAP cleanup implemented (useGSAP hook with scope)
- [ ] Error handling present (try-catch, fallbacks)
- [ ] Performance considerations met (transform/opacity only, 60fps)
- [ ] SEO metadata complete (title, description, structured data)
- [ ] Responsive design verified
- [ ] No console.log in production code
- [ ] Proper alt tags for images
- [ ] Semantic HTML structure (article, section, nav)

### Performance Requirements
- **Zero Layout Shift:** Animations must not trigger reflows
- **60fps Minimum:** Use transform/opacity, avoid layout properties
- **Image Optimization:** Use Next.js Image component with proper sizing
- **Bundle Size:** Automatic with Next.js App Router - no manual code splitting needed

### SEO Best Practices
```jsx
// Page metadata
export const metadata = {
  title: "Page Title",
  description: "Page description",
  openGraph: {
    title: "OG Title",
    description: "OG Description",
    images: ["/og-image.jpg"],
  },
};
```

- **Semantic HTML:** Use proper HTML5 elements (article, section, nav)
- **Structured Data:** JSON-LD for blog posts and pages
- **Meta tags:** Comprehensive metadata objects for social sharing
- **Accessibility:** Proper alt text, ARIA labels where needed

## Common Patterns

### Scroll-Triggered Animation
```jsx
const sectionRef = useRef(null);

useGSAP(() => {
  gsap.from(".animate-element", {
    opacity: 0,
    y: 50,
    stagger: 0.2,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}, { scope: sectionRef });

return <section ref={sectionRef}>
  <div className="animate-element">...</div>
</section>;
```

### WordPress Blog Post Fetching
```jsx
export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title.rendered}</h2>
        </article>
      ))}
    </div>
  );
}
```

### Responsive Text with Clamp
```jsx
<h1 className="text-[clamp(3rem,10vw,8rem)]">
  Responsive Heading
</h1>
```

## Critical Warnings

⚠️ **GSAP Without Cleanup:** Will cause memory leaks and performance issues
⚠️ **Layout-Triggering Animations:** Will break 60fps requirement and cause jank
⚠️ **Missing Error Handling:** Will crash production apps on API failures
⚠️ **Ignoring Responsive Design:** Will break user experience on mobile devices
⚠️ **Skipping SEO Metadata:** Will harm search engine rankings

## Deployment

### Vercel Configuration (CRITICAL)
```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "installCommand": "npm install --legacy-peer-deps"
}
```

**IMPORTANT:** The `--legacy-peer-deps` flag is required for successful builds. Do not remove this from vercel.json.

### GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml
- Node version: 20
- Uses npm ci for dependencies
- Runs npm run build in CI
```

### Manual Deployment
```bash
# First time setup
vercel login
vercel --prod  # Production deployment

# Or use npm script
npm run deploy
```

### Environment Variables
- `NEXT_PUBLIC_WORDPRESS_URL`: WordPress API URL (optional, has default fallback)
- Add via: `vercel env add VARIABLE_NAME`

### Custom Domain Setup
- DNS records configured for ktg.one
- Redirects vercel.app domain to custom domain
- See VERCEL_DEPLOY.md for detailed domain management

**Platform:** Vercel with automatic deployments from GitHub
**Branch:** Deploy from main branch

## Additional Resources

- **GSAP Integration:** See `GSAP_NEXTJS_INTEGRATION.md`
- **Hydration Debug:** See `HYDRATION-DEBUG-SESSION.md`
- **Deployment Guide:** See `VERCEL_DEPLOY.md`

---

**Last Updated:** 2025-12-28
**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, GSAP, Lenis

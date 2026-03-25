# Navigation, CTA & Blog Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken 3-button header with a right-edge floating icon dock nav (on all pages), add a contact CTA form as the homepage closer, remove BlogPreview from homepage, and standardize blog post typography.

**Architecture:** DockNav component rendered in layout.jsx (global, every page). ContactCTA component replaces BlogPreview on homepage. Blog typography fixed via prose class standardization in globals.css and blog slug page.

**Tech Stack:** Next.js (App Router), shadcn/ui (Tooltip, Input, Label, Textarea, Button, Separator), lucide-react icons, Tailwind v4, mailto for contact.

---

### Task 1: Install required shadcn components

**Files:**
- Modify: `src/components/ui/` (new files auto-created by shadcn CLI)

**Step 1: Install tooltip, input, label, textarea**

Run:
```bash
cd D:/projects/sites/ktgv2
pnpm dlx shadcn@latest add tooltip input label textarea
```

Expected: 4 new files in `src/components/ui/`

**Step 2: Verify installation**

Run: `ls src/components/ui/`

Expected: tooltip.jsx, input.jsx, label.jsx, textarea.jsx alongside existing files

**Step 3: Commit**

```bash
git add src/components/ui/tooltip.jsx src/components/ui/input.jsx src/components/ui/label.jsx src/components/ui/textarea.jsx
git commit -m "feat: install shadcn tooltip, input, label, textarea components"
```

---

### Task 2: Create DockNav component

**Files:**
- Create: `src/components/DockNav.jsx`

**Step 1: Build the DockNav**

```jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Box, Mail } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/blog", icon: Newspaper, label: "Insights" },
  { href: "/hub/snippets", icon: Box, label: "Hub" },
  { href: "/#contact", icon: Mail, label: "Contact" },
];

export function DockNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-2"
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 p-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : href.startsWith("/#")
                ? pathname === "/"
                : pathname.startsWith(href);

            const isAnchor = href.startsWith("/#");

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  {isAnchor ? (
                    <a
                      href={href}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      aria-label={label}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      aria-label={label}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-white/10 backdrop-blur-md border-white/10 text-white text-xs tracking-widest font-syne"
                >
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}
```

**Step 2: Verify no syntax errors**

Run: `cd D:/projects/sites/ktgv2 && npx next lint --file src/components/DockNav.jsx 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/components/DockNav.jsx
git commit -m "feat: create DockNav floating icon dock component"
```

---

### Task 3: Wire DockNav into layout, remove Header imports from pages

**Files:**
- Modify: `src/app/layout.jsx` — add DockNav
- Modify: `src/app/page.jsx` — remove Header import
- Modify: `src/app/blog/page.jsx` — remove Header import, keep rest
- Modify: `src/app/blog/[slug]/page.jsx` — remove Header import, keep rest
- Modify: `src/app/expertise/page.jsx` — remove Header import
- Modify: `src/app/validation/page.jsx` — remove Header import
- Modify: `src/app/hub/snippets/page.jsx` — no Header here, no change needed

**Step 1: Add DockNav to layout.jsx**

In `src/app/layout.jsx`, add import:
```jsx
import { DockNav } from "@/components/DockNav";
```

Inside the `<ClientLayout>` block, after `<GeometricBackground fixed />`, add:
```jsx
<DockNav />
```

**Step 2: Remove Header from page.jsx (homepage)**

In `src/app/page.jsx`:
- Remove line: `import { Header } from "@/components/Header";`
- Remove line: `<Header />`

**Step 3: Remove Header from blog/page.jsx**

In `src/app/blog/page.jsx`:
- Remove line: `import { Header } from "@/components/Header";`
- Remove line: `<Header />`

**Step 4: Remove Header from blog/[slug]/page.jsx**

In `src/app/blog/[slug]/page.jsx`:
- Remove line: `import { Header } from "@/components/Header";`
- Remove line: `<Header />`

**Step 5: Remove Header from expertise/page.jsx**

In `src/app/expertise/page.jsx`:
- Remove line: `import { Header } from "@/components/Header";`
- Remove line: `<Header />`

**Step 6: Remove Header from validation/page.jsx**

In `src/app/validation/page.jsx`:
- Remove line: `import { Header } from "@/components/Header";`
- Remove line: `<Header />`

**Step 7: Verify dev server runs clean**

Run: `cd D:/projects/sites/ktgv2 && npx next build 2>&1 | tail -20`

Expected: Build succeeds. No Header references remain (DockNav is global).

**Step 8: Commit**

```bash
git add src/app/layout.jsx src/app/page.jsx src/app/blog/page.jsx "src/app/blog/[slug]/page.jsx" src/app/expertise/page.jsx src/app/validation/page.jsx
git commit -m "feat: wire DockNav globally, remove per-page Header imports"
```

---

### Task 4: Create ContactCTA component

**Files:**
- Create: `src/components/ContactCTA.jsx`

**Step 1: Build the ContactCTA**

```jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function ContactCTA() {
  return (
    <section id="contact" className="relative py-24 md:py-32 px-6 md:px-12 z-[60]">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-syne text-4xl md:text-5xl font-bold lowercase mb-4 text-white">
          get in touch
        </h2>
        <p className="text-white/40 mb-12 text-sm md:text-base">
          have a project, question, or just want to talk AI?
        </p>

        <Separator className="mb-12 bg-white/10" />

        <form
          action="mailto:kevin@ktg.one"
          method="POST"
          encType="text/plain"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/60 text-xs tracking-widest font-syne">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="your name"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/10 rounded-lg h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-xs tracking-widest font-syne">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/10 rounded-lg h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white/60 text-xs tracking-widest font-syne">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="what's on your mind?"
              rows={5}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/10 rounded-lg resize-none"
            />
          </div>

          <Button
            type="submit"
            className="bg-emerald-500/90 hover:bg-emerald-500 text-white font-syne tracking-widest text-sm h-11 px-8 rounded-full transition-all duration-300"
          >
            send message
          </Button>
        </form>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ContactCTA.jsx
git commit -m "feat: create ContactCTA form component with mailto action"
```

---

### Task 5: Swap BlogPreview for ContactCTA on homepage

**Files:**
- Modify: `src/app/page.jsx`

**Step 1: Replace BlogPreview with ContactCTA**

In `src/app/page.jsx`:
- Remove import: `import { BlogPreview } from "@/components/BlogPreview";`
- Add import: `import { ContactCTA } from "@/components/ContactCTA";`
- Remove the blog fetch logic (lines 20-26: `let blogPosts = []` through the try/catch)
- Replace `<BlogPreview posts={blogPosts} />` with `<ContactCTA />`

The resulting page.jsx should look like:

```jsx
import { HeroSection } from "@/components/HeroSection";
import { HeroTransition } from "@/components/HeroTransition";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { ExpertiseTransition } from "@/components/ExpertiseTransition";
import { PhilosophySection } from "@/components/PhilosophySection";
import { Footer } from "@/components/Footer";
import { ValidationSection } from "@/components/ValidationSection";
import { ContactCTA } from "@/components/ContactCTA";
import { GeometricBackground } from "@/components/GeometricBackground";

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col relative" suppressHydrationWarning>
      <GeometricBackground fixed />

      <main className="grow" suppressHydrationWarning>
        <HeroSection />
        <HeroTransition />

        <div id="main-content">
          <ExpertiseSection />
        </div>

        <ExpertiseTransition />
        <ValidationSection />
        <PhilosophySection />
        <ContactCTA />
      </main>

      <Footer />
    </div>
  );
}
```

Note: `revalidate` export removed since we no longer fetch blog posts on homepage. Page can be fully static.

**Step 2: Verify build**

Run: `cd D:/projects/sites/ktgv2 && npx next build 2>&1 | tail -20`

**Step 3: Commit**

```bash
git add src/app/page.jsx
git commit -m "feat: replace BlogPreview with ContactCTA on homepage"
```

---

### Task 6: Standardize blog post typography

**Files:**
- Modify: `src/app/blog/[slug]/page.jsx` — tighten prose classes
- Modify: `src/app/globals.css` — add WordPress-specific prose overrides

**Step 1: Update prose classes in blog slug page**

In `src/app/blog/[slug]/page.jsx`, replace the content `<div>` (lines 153-168) className with:

```jsx
<div
  className="prose prose-invert prose-lg max-w-none
    prose-headings:font-syne prose-headings:lowercase
    prose-headings:text-white prose-headings:font-bold
    prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mt-12 prose-h1:mb-6
    prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4
    prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-3
    prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
    prose-p:text-white/80 prose-p:leading-relaxed prose-p:font-light
    prose-p:text-base prose-p:md:text-lg
    prose-a:text-emerald-400 prose-a:underline prose-a:underline-offset-4
    prose-a:decoration-emerald-400/30 hover:prose-a:decoration-emerald-400
    prose-strong:text-white prose-strong:font-semibold
    prose-code:text-emerald-400 prose-code:font-mono prose-code:text-sm
    prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
    prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
    prose-img:rounded-xl prose-img:border prose-img:border-white/10
    prose-blockquote:border-l-2 prose-blockquote:border-white/20
    prose-blockquote:text-white/60 prose-blockquote:italic prose-blockquote:pl-6
    prose-ul:text-white/80 prose-ol:text-white/80
    prose-li:text-white/80 prose-li:marker:text-white/30
    prose-hr:border-white/10"
  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
/>
```

Key changes from current:
- Explicit h1-h4 sizing with responsive variants (fixes "different sizes")
- Consistent paragraph sizing: `text-base md:text-lg` (was uncontrolled)
- Links changed to emerald-400 (matches site accent, was plain white)
- Added hr, ul, ol, strong standardization
- Added rounded-lg to pre blocks, border to images

**Step 2: Add WordPress content normalization to globals.css**

At the end of the `@layer base` block in `src/app/globals.css`, before the closing `}`, add:

```css
  /* WordPress content normalization */
  .prose figure {
    margin: 2rem 0;
  }

  .prose figcaption {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    text-align: center;
    margin-top: 0.5rem;
  }

  .prose .wp-block-image img {
    border-radius: 0.75rem;
    border: 1px solid hsl(0 0% 18%);
  }

  .prose .wp-block-quote {
    border-left: 2px solid hsl(0 0% 18%);
    padding-left: 1.5rem;
    font-style: italic;
    color: hsl(0 0% 65%);
  }

  .prose table {
    width: 100%;
    border-collapse: collapse;
  }

  .prose th, .prose td {
    border: 1px solid hsl(0 0% 18%);
    padding: 0.75rem 1rem;
    text-align: left;
  }

  .prose th {
    background: hsl(0 0% 6%);
    font-weight: 600;
  }
```

**Step 3: Verify with dev server**

Run: `cd D:/projects/sites/ktgv2 && npx next build 2>&1 | tail -10`

**Step 4: Commit**

```bash
git add "src/app/blog/[slug]/page.jsx" src/app/globals.css
git commit -m "fix: standardize blog post typography and WordPress content normalization"
```

---

## Summary

| Task | What | Components |
|------|------|-----------|
| 1 | Install shadcn deps | tooltip, input, label, textarea |
| 2 | Create DockNav | Floating pill, icons, tooltips |
| 3 | Wire globally, kill Header per-page | layout.jsx + 5 page files |
| 4 | Create ContactCTA | Form with mailto |
| 5 | Swap BlogPreview → ContactCTA | page.jsx |
| 6 | Blog typography | prose classes + WordPress CSS |

6 commits. Each task is independently verifiable.

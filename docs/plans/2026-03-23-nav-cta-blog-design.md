# Navigation, CTA Form & Blog Cleanup

Date: 2026-03-23

## Context

ktg.one is evolving from a portfolio into an AI toolhub. Current "nav" is 3 inconsistent floating buttons (top-right), no mobile support, pages are dead-ends with no way back. Footer is bare. BlogPreview sits on homepage but doesn't belong as the site grows. No contact method exists.

## Decisions

### 1. Right-edge floating pill nav

- Vertical glass morphism capsule, fixed to right edge
- Icons only. Tooltip on hover shows label.
- Starting icons: Home, Blog/Insights, Hub, Contact (scrolls to CTA on homepage, or links to contact section on other pages)
- Future icons added per section: Prompt Forge, Workflow Studio, Embed Chain Room, Google Universe, Newsroom, Orchestration Station, Content Hub
- Must render on ALL pages via layout.jsx — no page should be a dead-end
- All links must work from every page
- Replaces current Header.jsx entirely

### 2. Contact CTA form (homepage closer)

- Replaces BlogPreview position (between PhilosophySection and Footer)
- Fields: Name, Email, Message
- Submit: mailto:kevin@ktg.one (simple mailto for now, no API route)
- Style: dark, minimal, border-white/10 inputs, emerald accent submit button
- Matches site aesthetic (Syne font, glass morphism)

### 3. Remove BlogPreview from homepage

- BlogPreview component removed from page.jsx
- Blog lives at /blog only
- Blog gets an icon in the dock nav

### 4. Blog post typography standardization

- /blog/[slug]/page.jsx has inconsistent text sizing
- Standardize with proper prose classes: consistent h1-h4 sizes, paragraph spacing, list styling, blockquote treatment, code blocks
- Ensure WordPress HTML content renders with uniform typography

## Components affected

- `src/components/Header.jsx` — replaced by new DockNav
- `src/app/layout.jsx` — swap Header for DockNav
- `src/app/page.jsx` — remove BlogPreview, add ContactCTA
- `src/components/Footer.jsx` — minor enhancement (keep minimal)
- `src/app/blog/[slug]/page.jsx` — typography standardization
- New: `src/components/DockNav.jsx`
- New: `src/components/ContactCTA.jsx`

## shadcn components needed

- `Sheet` — mobile fallback if dock needs expand behavior
- `Tooltip` — hover labels on dock icons
- `Input`, `Label`, `Textarea` — contact form fields
- `Button` — submit button
- `Separator` — form/footer division

## Tech notes

- Icons: lucide-react (already installed)
- Glass morphism: bg-white/5 backdrop-blur-md border-white/10 (matches existing site patterns)
- Tooltip: shadcn TooltipProvider wrapping the dock
- mailto link: simple window.location or form action for now

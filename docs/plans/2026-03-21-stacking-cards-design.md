# Horizontal Stacking Cards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert ValidationSection from horizontal scroll strip to horizontal stacking cards (Graphite.com style)

**Architecture:** Section pins via ScrollTrigger. 5 cards are absolutely positioned and stacked. Cards 2-5 animate from x:100% to x:0% via a GSAP timeline with scrub:1. Card 1 is always visible. Snap-to-labels provides clean card boundaries.

**Tech Stack:** GSAP, ScrollTrigger, @gsap/react (useGSAP), Next.js, Tailwind CSS, Lenis smooth scroll

---

## Task 1: Update Refs and Remove horizontalScrollRef

**Files:**
- Modify: `src/components/ValidationSection.jsx:22-25` (refs section)

**Step 1: Replace horizontalScrollRef with cardRefs array**

Change:
```jsx
const horizontalScrollRef = useRef(null);
```
To:
```jsx
const cardRefs = useRef([]);
```

**Step 2: Verify no other code references horizontalScrollRef yet**

Will be cleaned up in Task 3 when we rewrite the animation.

**Step 3: Commit**

```bash
git add src/components/ValidationSection.jsx
git commit -m "refactor(validation): replace horizontalScrollRef with cardRefs array"
```

---

## Task 2: Rewrite JSX Layout — Stacked Absolute Cards

**Files:**
- Modify: `src/components/ValidationSection.jsx:211-330` (JSX return block)

**Step 1: Replace the horizontal strip container and card layout**

Replace everything from line 211 (`{/* Scroll Feature Container */}`) through line 329 (`</div>` closing scroll-feature-container) with:

```jsx
      {/* Scroll Feature Container - stacking cards pattern */}
      <div className="w-full scroll-feature-container">

        {/* Full-height wrapper for proper spacing */}
        <div className="h-dvh w-full flex flex-col items-center justify-center p-4 md:p-8">

          {/* Card Container - This gets pinned by ScrollTrigger */}
          <div
            ref={cardRef}
            className="h-full max-h-[85vh] w-full mx-auto max-w-[98vw] relative border border-border rounded-3xl overflow-hidden bg-card/40 backdrop-blur-sm"
          >

            {/* Stacking Cards Container */}
            <div className="relative w-full h-full">

              {/* 01. INTRO */}
              <div
                ref={el => cardRefs.current[0] = el}
                className="absolute inset-0 z-10 flex flex-col justify-center p-8 md:p-16 overflow-y-auto bg-background digital-text"
              >
                <div className="max-w-2xl">
                  <div className="mb-8 w-12 h-12 border-l border-t border-foreground/20" />
                  <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                    <span className="text-foreground font-semibold">{data.intro.title}</span>
                    <br/><br/>
                    {data.intro.desc}
                    <br/><br/>
                    <span className="text-muted-foreground/80">{data.intro.note}</span>
                  </p>
                  <div className="mt-12 flex gap-4">
                    <div className="px-6 py-3 border border-border rounded-full text-sm text-foreground bg-card/60">
                      audit status: {data.intro.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* 02. VERTEX AUDIT */}
              <div
                ref={el => cardRefs.current[1] = el}
                className="absolute inset-0 z-20 p-8 md:p-16 overflow-y-auto bg-background will-change-transform digital-text"
              >
                <div className="max-w-3xl">
                  <div className="border-b border-border pb-8 mb-8">
                    <div className="text-xs text-muted-foreground mb-4">log id: {data.audit.id}</div>
                    <div className="flex justify-between items-start gap-8">
                      <h3 className="text-3xl md:text-4xl font-syne font-bold">{data.audit.title}</h3>
                      <div className="text-sm font-bold text-foreground bg-card/80 px-4 py-2 whitespace-nowrap border border-border">{data.audit.badge}</div>
                    </div>
                  </div>
                  <div className="space-y-8 text-lg md:text-xl">
                    <div className="border-l-4 border-border pl-8 py-3">
                      <span className="text-muted-foreground block mb-3 text-xs tracking-widest">findings:</span>
                      <p className="leading-relaxed text-foreground">{data.audit.findings}</p>
                    </div>
                    <ul className="space-y-4 text-lg text-muted-foreground">
                      {data.audit.checklist.map((item, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <span className="text-foreground mt-1.5">✓</span>
                          <span><strong className="text-foreground">{item.label}:</strong> {item.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 03. PERCENTILE RANK */}
              <div
                ref={el => cardRefs.current[2] = el}
                className="absolute inset-0 z-30 p-8 md:p-16 overflow-y-auto bg-background will-change-transform digital-text"
              >
                <div className="max-w-2xl">
                  <div className="border-b border-border pb-8 mb-8">
                    <div className="text-xs text-muted-foreground mb-4">log id: {data.percentile.id}</div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-3xl font-syne font-bold">Percentile</h3>
                      <div className="text-5xl md:text-6xl font-bold text-foreground">{data.percentile.rank}</div>
                    </div>
                  </div>
                  <div className="space-y-8 text-lg md:text-xl">
                    <div className="bg-card/40 p-8 rounded-xl border border-border">
                      <div className="text-xs text-muted-foreground mb-4 tracking-widest">justification: depth</div>
                      <p className="leading-relaxed text-foreground">{data.percentile.justification}</p>
                    </div>
                    <p className="text-muted-foreground text-lg italic border-l-2 border-border pl-6">
                      "{data.percentile.quote}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 04. THE EVIDENCE */}
              <div
                ref={el => cardRefs.current[3] = el}
                className="absolute inset-0 z-40 p-8 md:p-16 overflow-y-auto bg-background will-change-transform digital-text"
              >
                <div className="max-w-2xl">
                  <div className="mb-6">
                    <div className="text-xs text-muted-foreground mb-2">log id: {data.evidence.id}</div>
                    <h3 className="text-2xl font-syne font-bold">The Evidence</h3>
                  </div>
                  <div className="space-y-6">
                    <p className="text-lg md:text-xl leading-relaxed text-foreground">"{data.evidence.quote1}"</p>
                    <div className="p-6 border border-border bg-card/50 rounded-lg">
                      <p className="text-base text-foreground leading-relaxed">"{data.evidence.quote2}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 05. THE FINAL VERDICT */}
              <div
                ref={el => cardRefs.current[4] = el}
                className="absolute inset-0 z-50 overflow-y-auto bg-foreground text-background p-8 md:p-16 will-change-transform digital-text"
              >
                <div className="max-w-3xl relative">
                  <div className="absolute top-0 right-0 opacity-50 text-xs">final_transmission</div>
                  <div className="space-y-8 pt-8">
                    <h3 className="text-3xl md:text-5xl font-syne font-bold leading-tight">"{data.verdict.title}"</h3>
                    <p className="text-xl md:text-2xl border-l-4 border-background/20 pl-8 py-2">
                      {data.verdict.subtitle}
                    </p>
                    <div className="pt-8 border-t border-background/20 flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-base font-bold tracking-widest">{data.verdict.status}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
```

Key changes from current JSX:
- Removed `horizontalScrollRef` div and `flex gap-8 min-w-max` strip
- Each card: `absolute inset-0` with incrementing z-index (10-50)
- Removed fixed widths (`w-[85vw]`, `md:w-[650px]`), using padding + `max-w-2xl/3xl` instead
- Added `bg-background` to cards 1-4 so they fully cover previous cards
- Card 5 keeps `bg-foreground text-background` (inverted)
- Added `will-change-transform` to cards 2-5 only
- Removed end spacer div (no longer needed)
- Removed `flex p-4 md:p-8` from cardRef (cards handle own padding now)

**Step 2: Commit**

```bash
git add src/components/ValidationSection.jsx
git commit -m "refactor(validation): convert horizontal strip to stacked absolute cards"
```

---

## Task 3: Rewrite GSAP Animation — Timeline with Sequential Tweens

**Files:**
- Modify: `src/components/ValidationSection.jsx:74-194` (useGSAP hook)

**Step 1: Update the ref guard check**

Change line 76:
```jsx
if (!horizontalScrollRef.current || !shutterRef.current || !cardRef.current) {
```
To:
```jsx
if (!cardRefs.current[0] || !shutterRef.current || !cardRef.current) {
```

**Step 2: Replace the entire `setupHorizontalScroll` function and its surrounding code**

Replace lines 118-193 (from `// PHASE 3:` comment through the cleanup return) with:

```jsx
    // PHASE 3: Stacking cards — pin + timeline scrub (Lenis-safe).
    let stackTimeline = null;
    let resizeTimeout = null;

    const setupStackingCards = () => {
      stackTimeline?.kill();
      stackTimeline = null;
      ScrollTrigger.getById("validation-hx")?.kill();

      if (!sectionRef.current || !cardRef.current || !cardRefs.current[0]) {
        return;
      }

      const viewport = cardRef.current;
      const cards = cardRefs.current.filter(Boolean);
      const scrollSpan = (cards.length - 1) * window.innerHeight
        + window.innerHeight * GRAPHITE_END_VIEWPORT_PAD;

      // Set initial positions: card 1 at x:0, cards 2-5 at x:100%
      gsap.set(cards[0], { x: "0%" });
      cards.slice(1).forEach(card => gsap.set(card, { x: "100%" }));

      // Build timeline with sequential card reveals
      stackTimeline = gsap.timeline({
        scrollTrigger: {
          id: "validation-hx",
          trigger: viewport,
          start: "top top",
          end: () => `+=${scrollSpan}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: "labels",
            duration: { min: 0.2, max: 0.8 },
            delay: 0.1,
            ease: "power1.inOut"
          }
        }
      });

      stackTimeline.addLabel("card1");
      cards.slice(1).forEach((card, i) => {
        stackTimeline
          .addLabel(`card${i + 2}`)
          .to(card, { x: "0%", duration: 1, ease: "none", force3D: true });
      });
    };

    const initTimeout = setTimeout(() => {
      setupStackingCards();
      ScrollTrigger.refresh(true);
    }, 300);

    const scheduleRefresh = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupStackingCards();
        ScrollTrigger.refresh(true);
      }, 120);
    };

    window.addEventListener("resize", scheduleRefresh);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleRefresh())
        : null;
    if (ro && cardRef.current) ro.observe(cardRef.current);

    return () => {
      clearTimeout(initTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener("resize", scheduleRefresh);
      ro?.disconnect();
      stackTimeline?.kill();
      ScrollTrigger.getById("validation-hx")?.kill();
    };
```

Key changes from current animation:
- `scrollTween` (single tween) replaced by `stackTimeline` (gsap.timeline)
- No more `strip.scrollWidth - viewport.clientWidth` calculation
- Scroll span = `(N-1) * vh + pad` instead of `travel + pad`
- `gsap.set()` establishes initial card positions (card 1 visible, rest off-screen right)
- Timeline builds sequentially with `.addLabel()` + `.to()` per card
- `snap: { snapTo: "labels" }` added for clean card boundaries
- ResizeObserver only watches `cardRef` (no more `horizontalScrollRef`)
- `force3D: true` on each card tween for GPU acceleration

**Step 3: Commit**

```bash
git add src/components/ValidationSection.jsx
git commit -m "feat(validation): implement stacking cards timeline with ScrollTrigger pin+scrub"
```

---

## Task 4: Update JSDoc Comment

**Files:**
- Modify: `src/components/ValidationSection.jsx:13-18` (comment block)

**Step 1: Update the component docblock**

Replace:
```jsx
/**
 * Graphite.com-style "scrolling cards" ScrollTrigger (reference site, not ktg):
 * - Pin + scrub on the card frame (trigger = card), not the whole section.
 * - Scroll span = horizontal travel + extra vertical distance (feels like Graphite's dwell).
 * - scrub: 1 → smooth scroll-linked motion with Lenis (see docs/plans 2026-01-05 pattern notes).
 */
```
With:
```jsx
/**
 * Graphite.com-style stacking cards ScrollTrigger:
 * - Pin + scrub on the card frame, cards slide in from right and stack.
 * - Timeline with sequential x:100%→0% tweens, one per card.
 * - Snap-to-labels for clean card boundaries.
 * - scrub: 1 → smooth scroll-linked motion with Lenis.
 */
```

**Step 2: Commit**

```bash
git add src/components/ValidationSection.jsx
git commit -m "docs(validation): update component docblock for stacking cards pattern"
```

---

## Task 5: Visual Verification

**Step 1: Run dev server**

```bash
npm run dev
```

**Step 2: Verify in browser**

Open Chrome DevTools → navigate to ValidationSection. Check:

1. Section pins when scrolled to
2. Card 1 is visible immediately
3. Cards 2-5 slide in from right one-by-one as you scroll
4. Each card fully covers the previous
5. Snap stops at each card boundary
6. Shutter animation (white bars) still plays on first visit
7. Text reveal animations still work
8. `sessionStorage` skip works on reload
9. Resize/orientation change doesn't break layout
10. No horizontal scrollbar appears

**Step 3: Test with Lenis**

Verify smooth scroll feel — scrub:1 should make cards follow scroll smoothly without jank.

**Step 4: Final commit if any tweaks needed**

```bash
git add src/components/ValidationSection.jsx
git commit -m "fix(validation): polish stacking cards visual tweaks"
```

---

## Verification Checklist

- [ ] Cards stack correctly — each new card slides from right and covers previous
- [ ] Scroll feels smooth with Lenis (scrub: 1)
- [ ] Snap stops at each card boundary
- [ ] Shutter + text reveal animations still work
- [ ] Resize/orientation change recalculates correctly
- [ ] Mobile responsive — cards fill viewport properly
- [ ] `sessionStorage` skip-animation still works
- [ ] No layout shift when pin engages
- [ ] No horizontal scrollbar
- [ ] `horizontalScrollRef` fully removed (no dead refs)

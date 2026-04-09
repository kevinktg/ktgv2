"use client";

import { useRef, forwardRef, lazy, Suspense, useEffect } from "react";
import { SkipButton } from "@/components/SkipButton";

// Lazy load Three.js component
const HeroImages = lazy(() => import("@/components/HeroImages").then(mod => ({ default: mod.HeroImages })));

export const HeroSection = forwardRef((props, ref) => {
  const heroRef = useRef(null);
  const internalRef = ref || heroRef;

  

  return (
    <section
      ref={internalRef}
      data-cursor-zone="hero"
      className="relative w-full min-h-screen flex items-center justify-center px-6 overflow-hidden z-10"
      style={{ background: 'transparent' }}
      suppressHydrationWarning
    >
      {/* Transparent background to show geometric background through */}
      <div className="absolute inset-0 bg-transparent z-0" style={{ top: '-1px', left: 0 }} />

      <Suspense fallback={<div className="absolute inset-0 z-10 bg-neutral-900" />}>
        <HeroImages
          topImage="/assets/top-hero.webp"
          bottomImage="/assets/bottom-hero.webp"
        />
      </Suspense>

      {/* Skip Button */}
      <SkipButton />
    </section>
  );
});

HeroSection.displayName = "HeroSection";

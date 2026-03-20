"use client";

import { ReactLenis as Lenis } from "lenis/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ReactLenis({
  root,
  options,
  children,
  ...props
}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!lenisRef.current?.lenis) return;

    const lenis = lenisRef.current.lenis;

    // 1. THE BRIDGE: Sync Lenis with GSAP's internal clock (Ticker)
    // Why? GSAP updates animations on every frame. Lenis updates scroll on every frame.
    // If they aren't synced, your scroll-based animations will jitter or lag.
    function update(time) {
      // "raf" stands for Request Animation Frame. 
      // We manually tell Lenis to update exactly when GSAP updates.
      lenis.raf(time * 1000);
    }

    // 2. CONNECT: Add our update function to GSAP's ticker
    // This ensures Lenis moves the page *before* GSAP calculates ScrollTrigger positions.
    gsap.ticker.add(update);

    // 2b. CRITICAL: Disable lag smoothing for proper Lenis sync
    // From Lenis docs: prevents GSAP from trying to smooth delays
    gsap.ticker.lagSmoothing(0);

    // 3. CRITICAL: Configure ScrollTrigger to use Lenis as the scroll container
    // This fixes pin spacers and ensures ScrollTrigger watches the correct scroll element
    // Lenis wraps content in a wrapper element - we proxy the window/documentElement
    ScrollTrigger.scrollerProxy(window, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      scrollHeight() {
        return lenis.limit;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    // 4. Refresh ScrollTrigger when Lenis updates (for dynamic content)
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // 5. EXPOSE LENIS INSTANCE: Make it available globally for skip button
    window.lenis = lenis;

    // 6. Initial ScrollTrigger refresh after setup - with delay to ensure DOM is ready
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    // 7. CLEANUP: Remove the listener when component unmounts
    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll");
      ScrollTrigger.scrollerProxy(window, {});
      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, []);

  return (
    <Lenis
      ref={lenisRef}
      root={root}
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        ...options,
      }}
      {...props}
    >
      {children}
    </Lenis>
  );
}


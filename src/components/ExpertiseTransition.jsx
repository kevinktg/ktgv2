"use client";

import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ExpertiseTransition - Creates wipe effect from expertise (white) to validation (black)
 * Similar to HeroTransition but transitions from white to black
 */
export function ExpertiseTransition() {
  const containerRef = useRef(null);
  const wipeRef = useRef(null);
  const gridRevealRef = useRef(null);

  // Session-based animation tracking
  const hasPlayed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('expertise-transition-played') === 'true';
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    // If already played, set final state
    if (hasPlayed) {
      if (wipeRef.current) {
        gsap.set(wipeRef.current, { clipPath: 'inset(100% 0 0 0)' });
      }
      if (gridRevealRef.current) {
        gsap.set(gridRevealRef.current, { opacity: 1 });
      }
      return;
    }

    // Timeline for coordinated transition
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 0.8,
        onLeave: () => {
          sessionStorage.setItem('expertise-transition-played', 'true');
        },
      },
    });

    // Wipe effect using clip-path (white to black transition)
    tl.fromTo(
      wipeRef.current,
      { clipPath: 'inset(0 0 0 0)' },
      { clipPath: 'inset(100% 0 0 0)', ease: 'power2.inOut' },
      0
    );

    // Reveal grid pattern (geometric background)
    tl.fromTo(
      gridRevealRef.current,
      { opacity: 0 },
      { opacity: 1, ease: 'power1.in' },
      0.2
    );

  }, { scope: containerRef, dependencies: [hasPlayed] });

  return (
    <div
      ref={containerRef}
      className="relative h-[60vh] w-full overflow-hidden z-35"
      style={{ contain: 'layout paint' }}
    >
      {/* Grid reveal pattern - shows geometric background peaking through */}
      <div
        ref={gridRevealRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Wipe panel - white overlay that clips away to reveal black bg */}
      <div
        ref={wipeRef}
        className="absolute inset-0 bg-white"
        style={{
          clipPath: 'inset(0 0 0 0)',
          willChange: 'clip-path',
        }}
        aria-hidden="true"
      >
        {/* Subtle gradient for depth */}
        <div className="absolute inset-0 bg-linear-to-b from-white via-white to-transparent" />
      </div>

      {/* Top gradient for smooth blend from expertise */}
      <div
        className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Bottom gradient for smooth blend into validation */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />
    </div>
  );
}

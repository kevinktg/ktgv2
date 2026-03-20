"use client";

import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * HeroTransition - Creates wipe effect from hero to geometric background
 * Uses clip-path for smooth reveal effect
 */
export function HeroTransition() {
  const containerRef = useRef(null);
  const wipeRef = useRef(null);
  const gridRevealRef = useRef(null);

  // Session-based animation tracking
  const hasPlayed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('hero-transition-played') === 'true';
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
          sessionStorage.setItem('hero-transition-played', 'true');
        },
      },
    });

    // Wipe effect using clip-path (smoother than scale)
    tl.fromTo(
      wipeRef.current,
      { clipPath: 'inset(0 0 0 0)' },
      { clipPath: 'inset(100% 0 0 0)', ease: 'power2.inOut' },
      0
    );

    // Reveal grid pattern
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
      className="relative h-[60vh] w-full overflow-hidden z-20"
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

      {/* Wipe panel - black overlay that clips away to reveal bg */}
      <div
        ref={wipeRef}
        className="absolute inset-0 bg-black"
        style={{
          clipPath: 'inset(0 0 0 0)',
          willChange: 'clip-path',
        }}
        aria-hidden="true"
      >
        {/* Subtle gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-transparent" />
      </div>

      {/* Top gradient for smooth blend from hero */}
      <div
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Bottom gradient for smooth blend into next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />
    </div>
  );
}

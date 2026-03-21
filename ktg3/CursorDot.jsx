"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * CursorDot — trailing dot effect that follows mouse.
 *
 * ARCHITECTURE NOTE:
 * This component is mounted in layout.jsx (fixed, z-[99999]).
 * GlobalCursor is mounted in ClientLayout.jsx (inside Lenis).
 * If BOTH are active, you get doubled mousemove + rAF loops.
 * Pick one or the other for production.
 */
export function CursorDot() {
  const containerRef = useRef(null);
  const dotsRef = useRef([]);

  const DOT_COUNT = 12;
  const LAG_FACTOR = 0.2;

  useGSAP(
    () => {
      // Initial setup — hide all dots off-screen
      gsap.set(dotsRef.current, {
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        scale: 0,
        x: -1000,
        y: -1000,
      });

      const mouse = { x: 0, y: 0 };
      const dots = dotsRef.current.map(() => ({ x: -1000, y: -1000 }));
      let isMoving = false;
      let timeoutId = null;
      let rafId = null;

      const render = () => {
        // Leader dot — tight sync with mouse
        dots[0].x += (mouse.x - dots[0].x) * 0.95;
        dots[0].y += (mouse.y - dots[0].y) * 0.95;

        if (dotsRef.current[0]) {
          gsap.set(dotsRef.current[0], {
            x: dots[0].x,
            y: dots[0].y,
            xPercent: -50,
            yPercent: -50,
          });
        }

        // Followers — each trails the previous
        for (let i = 1; i < DOT_COUNT; i++) {
          const prev = dots[i - 1];
          const curr = dots[i];

          curr.x += (prev.x - curr.x) * LAG_FACTOR;
          curr.y += (prev.y - curr.y) * LAG_FACTOR;

          if (dotsRef.current[i]) {
            gsap.set(dotsRef.current[i], {
              x: curr.x,
              y: curr.y,
              xPercent: -50,
              yPercent: -50,
            });
          }
        }

        if (isMoving) {
          rafId = requestAnimationFrame(render);
        }
      };

      const onMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if (!isMoving) {
          // Initialize all dots at cursor position for instant appearance
          dots.forEach((dot) => {
            dot.x = mouse.x;
            dot.y = mouse.y;
          });
          isMoving = true;
          rafId = requestAnimationFrame(render);

          // Fade in with head bright, tail fading
          gsap.to(dotsRef.current, {
            opacity: (i) => 1 - i / DOT_COUNT,
            scale: (i) => 1 - (i / DOT_COUNT) * 0.5,
            duration: 0.3,
          });
        }

        // Hide trail after 2s of no movement
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (rafId) cancelAnimationFrame(rafId);
          isMoving = false;
          gsap.to(dotsRef.current, {
            opacity: 0,
            scale: 0,
            duration: 0.5,
          });
        }, 2000);
      };

      window.addEventListener("mousemove", onMouseMove);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {[...Array(DOT_COUNT)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (dotsRef.current[i] = el)}
          className="absolute w-3 h-3 bg-white rounded-full mix-blend-difference"
          style={{ opacity: 0 }}
          // NOTE: will-change-transform removed. GSAP's gsap.set() automatically
          // promotes elements to GPU layers when actively animating. Permanent
          // will-change on 12 elements creates 12 persistent compositing layers
          // even when invisible — wasteful on mobile and mid-range GPUs.
        />
      ))}
    </div>
  );
}

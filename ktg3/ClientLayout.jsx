"use client";

import { ReactLenis } from "@/libs/lenis";
import { GlobalCursor } from "./GlobalCursor";

/**
 * ClientLayout wraps the entire app in Lenis smooth scroll.
 *
 * CURSOR ARCHITECTURE:
 * GlobalCursor lives here (client-side, inside Lenis).
 * CursorDot lives in layout.jsx (outside Lenis, fixed z-[99999]).
 *
 * IMPORTANT: If both GlobalCursor AND CursorDot are active, you get
 * doubled mousemove listeners and doubled rAF loops. Pick ONE:
 *   - GlobalCursor for Lenis-aware cursor behavior
 *   - CursorDot for the trailing dot effect
 * Currently both are mounted. If performance is an issue,
 * remove CursorDot from layout.jsx OR remove GlobalCursor here.
 */
export function ClientLayout({ children }) {
  return (
    <ReactLenis root>
      <div className="relative min-h-screen">
        <GlobalCursor />
        {children}
      </div>
    </ReactLenis>
  );
}

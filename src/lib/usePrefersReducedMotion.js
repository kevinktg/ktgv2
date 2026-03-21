"use client";

import { useEffect, useState } from "react";

function getReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * True when the user prefers reduced motion. Safe for SSR (false until client).
 * Syncs on prefers-reduced-motion changes.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(getReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

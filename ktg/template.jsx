"use client";

import { PageTransition } from "@/components/PageTransition";

// NOTE: If PageTransition uses framer-motion AnimatePresence, ensure it receives
// a stable `key` prop (e.g. based on pathname). Without it, route changes can
// trigger unmount/remount loops. For a single-page portfolio, this wrapper is
// low-risk but check PageTransition.jsx if you see flickering on navigation.
export default function Template({ children }) {
  return <PageTransition>{children}</PageTransition>;
}

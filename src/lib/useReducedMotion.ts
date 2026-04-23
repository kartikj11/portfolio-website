"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's `prefers-reduced-motion` preference. SSR-safe: always
 * returns `false` on the server and on the first client render (there's
 * no media query to read yet). The effect resolves the true value on
 * mount and subscribes to changes so an OS-level toggle mid-session
 * flips behavior live — matching framer-motion's hook.
 *
 * The CSS `@media (prefers-reduced-motion: reduce)` fallback in
 * globals.css is the load-bearing path for the Reveal fade reduction —
 * this hook exists only for JS branches (Marquee RAF loop opt-out,
 * StickyNav transform gating, HeroMeshSlot Canvas vs. SVG).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(QUERY);
    // Sync the initial match synchronously on mount. This is the
    // canonical matchMedia subscription pattern — without it, the
    // initial value is wrong for users whose OS setting is already on.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mql.matches);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

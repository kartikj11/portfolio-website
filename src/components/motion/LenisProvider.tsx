"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";

/**
 * Context value is the Lenis instance, or null. `null` covers three cases:
 * (1) server render, (2) first client render before the effect has run,
 * (3) reduced-motion users (we never create an instance for them).
 *
 * Consumers MUST handle null — see useLenis docs below.
 */
const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: true,
    });

    // setState-in-effect: we're bridging Lenis's instance lifecycle into
    // React state so consumers (useLenis) get a non-null value once the
    // instance is ready. This is a one-time init, not a render loop —
    // the lint rule's target pattern is cascading re-renders, which we
    // don't create here (instance is created once, set once, destroyed
    // once on unmount).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

/**
 * Read the active Lenis instance. Returns null on server, during first
 * client render before the provider effect has run, and for reduced-motion
 * users. Consumers MUST fall back gracefully when null — typically by
 * using native instant scroll (element.scrollIntoView() with no behavior
 * option, which defaults to "auto"/instant).
 *
 * Example:
 *   const lenis = useLenis();
 *   if (lenis) lenis.scrollTo(target, { offset: -56 });
 *   else target.scrollIntoView();
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { HeroMeshFallback } from "./HeroMeshFallback";
import { MeshErrorBoundary } from "./MeshErrorBoundary";

/**
 * Client-side wrapper that decides what to render into the Hero's mesh
 * slot:
 *
 *   - Mobile (viewport < lg, 1024px) → render nothing. The slot wrapper
 *     is `hidden lg:block` in CSS, so mobile users never see the mesh
 *     anyway. Without this JS-level gate, React would still mount
 *     <HeroMeshCanvas /> on mobile and Next would fetch the ~230 KB gz
 *     three.js chunk for zero visual payoff — a significant mobile TBT
 *     hit. `matchMedia` lets us keep the chunk off mobile bandwidth.
 *   - Reduced-motion users → static SVG only. No three.js chunk loaded,
 *     no Canvas mounted.
 *   - Desktop with full motion → dynamically-imported Canvas, wrapped in
 *     an error boundary. SVG is the loading state AND the error state.
 *
 * Lives in its own "use client" boundary so Hero.tsx can remain a Server
 * Component. The SVG fallback itself is server-renderable and is used
 * directly by this wrapper in the reduced-motion branch.
 */

// Dynamic import: ssr: false per CLAUDE.md 3D rules, SVG is the loading
// state. `loading` renders until the chunk resolves AND the component
// finishes its first client paint.
const HeroMeshCanvas = dynamic(() => import("./HeroMeshCanvas"), {
  ssr: false,
  loading: () => <HeroMeshFallback />,
});

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)"; // Tailwind `lg` breakpoint.

export function HeroMeshSlot() {
  const prefersReduced = useReducedMotion();
  // `null` until first client render resolves the match. The slot
  // wrapper is `hidden lg:block` so a one-frame null render is invisible
  // regardless of which branch eventually wins.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
    // Set immediately from current match; update on breakpoint crossings
    // so desktop↔mobile resize events also gate the Canvas correctly.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mql.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Mobile (or still-resolving): render nothing. The surrounding slot
  // wrapper is already display:none via `hidden lg:block`, so this
  // saves React mount + dynamic-import cost without any layout impact.
  if (!isDesktop) {
    return null;
  }

  if (prefersReduced) {
    return <HeroMeshFallback />;
  }

  return (
    <MeshErrorBoundary fallback={<HeroMeshFallback />}>
      <HeroMeshCanvas />
    </MeshErrorBoundary>
  );
}

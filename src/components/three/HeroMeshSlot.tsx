"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { HeroMeshFallback } from "./HeroMeshFallback";
import { MeshErrorBoundary } from "./MeshErrorBoundary";

/**
 * Client-side wrapper that decides what to render into the Hero's mesh
 * slot:
 *
 *   - Reduced-motion users → static SVG only. No three.js chunk loaded,
 *     no Canvas mounted.
 *   - Everyone else → dynamically-imported Canvas, wrapped in an error
 *     boundary. SVG is the loading state AND the error state.
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

export function HeroMeshSlot() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <HeroMeshFallback />;
  }

  return (
    <MeshErrorBoundary fallback={<HeroMeshFallback />}>
      <HeroMeshCanvas />
    </MeshErrorBoundary>
  );
}

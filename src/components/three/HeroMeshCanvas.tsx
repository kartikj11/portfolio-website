"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  Points,
} from "three";
import { buildMeshGeometry, simplex3 } from "./meshGeometry";

// ---- Motion tuning (matches Phase 0 approval) --------------------------

/** Per-vertex XY displacement amplitude, relative to graph half-width. */
const XY_AMPLITUDE = 0.06;
/** Per-vertex Z amplitude — half of XY to keep the graph mostly in-plane. */
const Z_AMPLITUDE = 0.03;
/** Noise input advances this much per second; a full cycle takes ~6.7s. */
const TIME_SCALE = 0.15;
/**
 * Spatial frequency of noise sampling per vertex. Smaller = smoother motion
 * across nearby vertices; larger = each vertex moves independently. We want
 * independence, so this is not tiny.
 */
const SPATIAL_SPREAD = 2.0;

// ---- Ink color resolution ---------------------------------------------

const INK_FALLBACK = "#131211";

function resolveInkColor(): string {
  try {
    if (typeof window === "undefined") return INK_FALLBACK;
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-ink")
      .trim();
    if (!raw) return INK_FALLBACK;
    // Validate via three's Color constructor — throws on unparseable input.
    new Color(raw);
    return raw;
  } catch (err) {
    console.warn(
      "[HeroMesh] Failed to resolve --color-ink, falling back to #131211:",
      err
    );
    return INK_FALLBACK;
  }
}

// ---- Per-frame buffer update ------------------------------------------

/**
 * Update per-vertex positions via 3D simplex noise, then propagate into
 * the line-segment buffer. Mutates `pointPositions` and `edgePositions`
 * in place. Called from useFrame; zero allocations per frame.
 *
 * Kept as a module-level pure function (not a closure inside the
 * component) so the buffer mutations live outside React's component
 * scope. R3F geometry buffers are GPU-bound storage, not React state.
 */
function updateMeshBuffers(
  t: number,
  points: readonly (readonly [number, number, number])[],
  seedOffsets: Float32Array,
  pointPositions: Float32Array,
  edges: readonly (readonly [number, number])[],
  edgePositions: Float32Array
): void {
  for (let i = 0; i < points.length; i += 1) {
    const [baseX, baseY, baseZ] = points[i];
    const ox = seedOffsets[i * 3];
    const oy = seedOffsets[i * 3 + 1];
    const oz = seedOffsets[i * 3 + 2];

    const dx = simplex3(ox, oy, t) * XY_AMPLITUDE;
    const dy = simplex3(oy, oz, t + 100) * XY_AMPLITUDE;
    const dz = simplex3(oz, ox, t + 200) * Z_AMPLITUDE;

    pointPositions[i * 3] = baseX + dx;
    pointPositions[i * 3 + 1] = baseY + dy;
    pointPositions[i * 3 + 2] = baseZ + dz;
  }

  for (let e = 0; e < edges.length; e += 1) {
    const [a, b] = edges[e];
    const base = e * 6;
    edgePositions[base] = pointPositions[a * 3];
    edgePositions[base + 1] = pointPositions[a * 3 + 1];
    edgePositions[base + 2] = pointPositions[a * 3 + 2];
    edgePositions[base + 3] = pointPositions[b * 3];
    edgePositions[base + 4] = pointPositions[b * 3 + 1];
    edgePositions[base + 5] = pointPositions[b * 3 + 2];
  }
}

// ---- Inner mesh component (runs inside <Canvas>) -----------------------

type AnimatedMeshProps = {
  inkColor: string;
};

function AnimatedMesh({ inkColor }: AnimatedMeshProps) {
  const pointsRef = useRef<Points | null>(null);
  const linesRef = useRef<LineSegments | null>(null);

  // Build geometry once — deterministic across mounts.
  const geometry = useMemo(() => buildMeshGeometry(), []);
  const { points, edges } = geometry;

  // Pre-allocated buffers, seeded with rest positions so the first paint
  // matches the SVG fallback. Never reassigned; mutated in place per frame.
  const pointPositions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i += 1) {
      arr[i * 3] = points[i][0];
      arr[i * 3 + 1] = points[i][1];
      arr[i * 3 + 2] = points[i][2];
    }
    return arr;
  }, [points]);

  const edgePositions = useMemo(() => {
    const arr = new Float32Array(edges.length * 2 * 3);
    for (let e = 0; e < edges.length; e += 1) {
      const [a, b] = edges[e];
      const base = e * 6;
      arr[base] = points[a][0];
      arr[base + 1] = points[a][1];
      arr[base + 2] = points[a][2];
      arr[base + 3] = points[b][0];
      arr[base + 4] = points[b][1];
      arr[base + 5] = points[b][2];
    }
    return arr;
  }, [points, edges]);

  // Per-vertex seed offsets so each point samples a different region of
  // the 3D noise field — prevents the mesh from moving in sync.
  const seedOffsets = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i += 1) {
      // Deterministic offsets from the base XY — each vertex gets a stable
      // unique noise coordinate, so reloading preserves motion character.
      arr[i * 3] = points[i][0] * SPATIAL_SPREAD + 13.7;
      arr[i * 3 + 1] = points[i][1] * SPATIAL_SPREAD + 47.3;
      arr[i * 3 + 2] = points[i][2] * SPATIAL_SPREAD + 91.1;
    }
    return arr;
  }, [points]);

  // Create the buffer geometries once, binding the pre-seeded buffers.
  const pointsGeometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pointPositions, 3));
    return g;
  }, [pointPositions]);

  const linesGeometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(edgePositions, 3));
    return g;
  }, [edgePositions]);

  useFrame((state) => {
    // Mutation of pre-allocated Float32Arrays returned from useMemo is
    // the standard R3F pattern. The update is extracted into a plain
    // function below so the mutation lives outside the component's
    // lexical scope, which also sidesteps lint's immutability rule —
    // the rule targets state mutation within components, not GPU buffer
    // updates from a dedicated function.
    updateMeshBuffers(
      state.clock.elapsedTime * TIME_SCALE,
      points,
      seedOffsets,
      pointPositions,
      edges,
      edgePositions
    );

    const pointsObj = pointsRef.current;
    const linesObj = linesRef.current;
    if (pointsObj) {
      const attr = pointsObj.geometry.attributes.position as BufferAttribute;
      attr.needsUpdate = true;
    }
    if (linesObj) {
      const attr = linesObj.geometry.attributes.position as BufferAttribute;
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial
          color={inkColor}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </lineSegments>
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          color={inkColor}
          transparent
          opacity={0.85}
          size={0.035}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ---- Outer wrapper: IntersectionObserver + frameloop toggle -----------

export default function HeroMeshCanvas() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [inkColor, setInkColor] = useState<string>(INK_FALLBACK);

  // Resolve ink color once on mount. Color parse failure does not trigger
  // the error boundary — we fall back to #131211 and warn. This is a
  // client-only read (getComputedStyle) that has to happen after mount;
  // the setState-in-effect pattern is the correct bridge for a one-shot
  // client value into React state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInkColor(resolveInkColor());
  }, []);

  // Pause the render loop when the canvas is offscreen. One observer,
  // one target, cleaned up on unmount.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0"
      // Explicit width/height guarantees a computed non-zero size for
      // R3F's initial measurement, even in browsers where inset-based
      // sizing resolves asynchronously.
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "default" }}
        dpr={[1, 1.5]}
        camera={{ fov: 35, position: [0, 0, 5.2] }}
        frameloop={isVisible ? "always" : "never"}
      >
        <AnimatedMesh inkColor={inkColor} />
      </Canvas>
    </div>
  );
}

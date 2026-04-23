import { buildMeshGeometry } from "./meshGeometry";

/**
 * Static SVG rendering of the Hero mesh — used as:
 *   - The reduced-motion fallback (no animation, no WebGL).
 *   - The loading state while HeroMeshCanvas is dynamically imported.
 *   - The error-boundary fallback if the Canvas fails to initialize.
 *
 * Uses the same shared `meshGeometry` module as HeroMeshCanvas, so the
 * static silhouette matches the animated Canvas's rest state exactly.
 * Server-component compatible — no "use client" needed.
 *
 * Z-depth from the source geometry is dropped (2D projection); the
 * perspective correction at the Canvas's camera distance is ~3% and not
 * worth the extra math for the static case. SVG reads honestly as a
 * drawing, not as a rendered 3D object.
 */
export function HeroMeshFallback() {
  const { points, edges } = buildMeshGeometry();

  return (
    <svg
      viewBox="-1.4 -1.4 2.8 2.8"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      // absolute inset-0 makes the SVG fill the positioned slot via
      // insets, not percentage sizing. h-full w-full is belt-and-
      // suspenders for browsers that resolve SVG percentage sizing
      // differently from positioned sizing.
      className="absolute inset-0 h-full w-full"
      // currentColor lets the svg inherit ink via the CSS token, with the
      // hex literal as a hard fallback if the token fails to resolve.
      style={{ color: "var(--color-ink, #131211)" }}
    >
      {/* Edges — hairlines, low opacity. vector-effect keeps the stroke
          at 1px regardless of how the SVG is scaled by its container. */}
      <g
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      >
        {edges.map(([a, b]) => {
          const [x1, y1] = points[a];
          const [x2, y2] = points[b];
          return (
            <line
              key={`${a}-${b}`}
              x1={x1.toFixed(3)}
              // SVG Y axis points down; flip so the mesh's Y maps to the
              // same visual orientation as the R3F canvas.
              y1={(-y1).toFixed(3)}
              x2={x2.toFixed(3)}
              y2={(-y2).toFixed(3)}
            />
          );
        })}
      </g>

      {/* Nodes — small filled circles at medium opacity. */}
      <g fill="currentColor" fillOpacity={0.8}>
        {points.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(3)} cy={(-y).toFixed(3)} r={0.02} />
        ))}
      </g>
    </svg>
  );
}

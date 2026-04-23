/**
 * Shared geometry module for the Hero mesh — pure TypeScript, zero deps.
 *
 * Responsibilities:
 *   - Seeded pseudo-random number generator (mulberry32) so the mesh
 *     renders identically on every mount and between Canvas / SVG.
 *   - Poisson-disk-ish point sampling in a square region with shallow Z.
 *   - 2D Delaunay triangulation (Bowyer-Watson) for the edge list.
 *   - 3D simplex noise (Gustavson reference) for the animated displacement.
 *
 * Both HeroMeshCanvas and HeroMeshFallback import from here; the shared
 * seed + deterministic generation mean the static SVG matches the
 * animated Canvas's rest state exactly.
 */

export const MESH_NODE_COUNT = 30;
/** Half-width of the square sample region (graph extends from -R to +R on XY). */
export const MESH_HALF_WIDTH = 1;
/** Z sample range is ±15% of XY half-width, per Phase 0 approval. */
export const MESH_Z_RANGE = 0.15;
/** Minimum distance between any two nodes (Poisson-disk radius). */
const MIN_DIST = 0.28;
/** Fixed seed — same layout every page load. */
const RNG_SEED = 0xdeadbeef;

export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];

// ---- Seeded RNG --------------------------------------------------------

/**
 * mulberry32 — compact seeded PRNG. ~6 lines, deterministic, fast.
 * Returns a new function each call so multiple RNG streams can coexist.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Poisson-disk-ish sampling ----------------------------------------

/**
 * Sample N points in the square [-R, +R]² with Z in [-Z, +Z], rejecting
 * candidates closer than `minDist` to any accepted point. If we fail to
 * place all N after MAX_ATTEMPTS, return what we have — at 30 points in
 * a 2×2 square with minDist=0.28, this completes in practice on the first
 * seed I tested.
 */
function samplePoints(
  rng: () => number,
  count: number,
  halfWidth: number,
  zRange: number,
  minDist: number
): Vec3[] {
  const points: Vec3[] = [];
  const minDistSq = minDist * minDist;
  const MAX_ATTEMPTS = 30 * count;
  let attempts = 0;

  while (points.length < count && attempts < MAX_ATTEMPTS) {
    attempts += 1;
    const x = (rng() * 2 - 1) * halfWidth;
    const y = (rng() * 2 - 1) * halfWidth;
    const z = (rng() * 2 - 1) * zRange;

    let ok = true;
    for (const [px, py] of points) {
      const dx = x - px;
      const dy = y - py;
      if (dx * dx + dy * dy < minDistSq) {
        ok = false;
        break;
      }
    }
    if (ok) points.push([x, y, z]);
  }

  return points;
}

// ---- Bowyer-Watson 2D Delaunay ----------------------------------------

type Triangle = readonly [number, number, number];

/**
 * Edge with sorted endpoints for stable dedup keying.
 */
function edgeKey(a: number, b: number): string {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

/**
 * Circumcircle of triangle (a, b, c). Returns center and squared radius.
 * Standard determinant-based formula; handles degenerate triangles by
 * returning a giant radius so they're kept (we clean up via super-triangle
 * removal at the end).
 */
function circumcircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): { x: number; y: number; rSq: number } {
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-12) {
    return { x: 0, y: 0, rSq: Infinity };
  }
  const ux =
    ((ax * ax + ay * ay) * (by - cy) +
      (bx * bx + by * by) * (cy - ay) +
      (cx * cx + cy * cy) * (ay - by)) /
    d;
  const uy =
    ((ax * ax + ay * ay) * (cx - bx) +
      (bx * bx + by * by) * (ax - cx) +
      (cx * cx + cy * cy) * (bx - ax)) /
    d;
  const dx = ax - ux;
  const dy = ay - uy;
  return { x: ux, y: uy, rSq: dx * dx + dy * dy };
}

/**
 * Bowyer-Watson incremental Delaunay triangulation on the XY projection
 * of the input points. Returns an edge list (pairs of point indices).
 *
 * Algorithm:
 *   1. Create a super-triangle that contains all input points.
 *   2. For each point, find all triangles whose circumcircle contains the
 *      point — these are "bad." Remove them, which leaves a polygonal
 *      hole bounded by edges that appeared in exactly one bad triangle.
 *   3. Re-triangulate the hole by connecting each boundary edge to the
 *      new point.
 *   4. Remove triangles that share a vertex with the super-triangle.
 *   5. Convert surviving triangles to a deduped edge list.
 *
 * The inline implementation is small because we don't need spatial
 * acceleration at n=30; scanning all triangles each insertion is O(n²)
 * worst-case, which is fine.
 */
function delaunayEdges(points: Vec3[]): Edge[] {
  const n = points.length;
  if (n < 3) return [];

  // Find bounding box to size the super-triangle.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const delta = Math.max(dx, dy);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  // Super-triangle: huge, axis-aligned, chosen to strictly enclose all
  // points with healthy margin.
  const superIdx0 = n;
  const superIdx1 = n + 1;
  const superIdx2 = n + 2;
  const pts: Vec3[] = [
    ...points,
    [midX - 20 * delta, midY - delta, 0],
    [midX + 20 * delta, midY - delta, 0],
    [midX, midY + 20 * delta, 0],
  ];

  let triangles: Triangle[] = [[superIdx0, superIdx1, superIdx2]];

  for (let i = 0; i < n; i += 1) {
    const [px, py] = pts[i];
    const bad: Triangle[] = [];
    const kept: Triangle[] = [];

    for (const tri of triangles) {
      const [a, b, c] = tri;
      const [ax, ay] = pts[a];
      const [bx, by] = pts[b];
      const [cx, cy] = pts[c];
      const { x, y, rSq } = circumcircle(ax, ay, bx, by, cx, cy);
      const dxp = px - x;
      const dyp = py - y;
      if (dxp * dxp + dyp * dyp < rSq) {
        bad.push(tri);
      } else {
        kept.push(tri);
      }
    }

    // Find the polygonal boundary of the bad region: edges that appear
    // in exactly one bad triangle.
    const edgeCount = new Map<string, { a: number; b: number; count: number }>();
    for (const [a, b, c] of bad) {
      for (const [u, v] of [
        [a, b],
        [b, c],
        [c, a],
      ] as const) {
        const key = edgeKey(u, v);
        const existing = edgeCount.get(key);
        if (existing) existing.count += 1;
        else edgeCount.set(key, { a: u, b: v, count: 1 });
      }
    }

    const newTris: Triangle[] = [];
    for (const { a, b, count } of edgeCount.values()) {
      if (count === 1) {
        newTris.push([a, b, i]);
      }
    }

    triangles = kept.concat(newTris);
  }

  // Drop triangles that touch the super-triangle vertices.
  const clean = triangles.filter(
    ([a, b, c]) =>
      a < n && b < n && c < n
  );

  // Convert to a deduped edge list.
  const edges = new Map<string, Edge>();
  for (const [a, b, c] of clean) {
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ] as const) {
      edges.set(edgeKey(u, v), u < v ? [u, v] : [v, u]);
    }
  }

  return [...edges.values()];
}

// ---- 3D Simplex noise (Gustavson reference) ---------------------------

// Standard Perlin permutation table — 256 values, mirrored to 512 so
// indexing with `p[(i + j) & 255]` wraps without a modulo.
const PERM: number[] = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];
const P: number[] = new Array(512);
for (let i = 0; i < 512; i += 1) P[i] = PERM[i & 255];

// Gradient vectors for 3D simplex noise (12 edge-midpoints of a cube).
const GRAD3: readonly Vec3[] = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

const F3 = 1 / 3;
const G3 = 1 / 6;

/**
 * 3D simplex noise. Gustavson reference, JavaScript port. Returns values
 * roughly in [-1, +1]. Used to drive per-vertex displacement.
 *
 * The algorithm is inline rather than a library to avoid an extra npm
 * dependency for 80 lines of math. See Stefan Gustavson's
 * "Simplex noise demystified" for derivation.
 */
export function simplex3(xin: number, yin: number, zin: number): number {
  const s = (xin + yin + zin) * F3;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const k = Math.floor(zin + s);
  const t = (i + j + k) * G3;
  const x0 = xin - (i - t);
  const y0 = yin - (j - t);
  const z0 = zin - (k - t);

  let i1: number, j1: number, k1: number;
  let i2: number, j2: number, k2: number;

  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
    } else {
      i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    }
  }

  const x1 = x0 - i1 + G3;
  const y1 = y0 - j1 + G3;
  const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2 * G3;
  const y2 = y0 - j2 + 2 * G3;
  const z2 = z0 - k2 + 2 * G3;
  const x3 = x0 - 1 + 3 * G3;
  const y3 = y0 - 1 + 3 * G3;
  const z3 = z0 - 1 + 3 * G3;

  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;

  const gi0 = P[ii + P[jj + P[kk]]] % 12;
  const gi1 = P[ii + i1 + P[jj + j1 + P[kk + k1]]] % 12;
  const gi2 = P[ii + i2 + P[jj + j2 + P[kk + k2]]] % 12;
  const gi3 = P[ii + 1 + P[jj + 1 + P[kk + 1]]] % 12;

  const dot = (g: Vec3, x: number, y: number, z: number) =>
    g[0] * x + g[1] * y + g[2] * z;

  let n0 = 0;
  let n1 = 0;
  let n2 = 0;
  let n3 = 0;

  const t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 >= 0) {
    const tt = t0 * t0;
    n0 = tt * tt * dot(GRAD3[gi0], x0, y0, z0);
  }
  const t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 >= 0) {
    const tt = t1 * t1;
    n1 = tt * tt * dot(GRAD3[gi1], x1, y1, z1);
  }
  const t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 >= 0) {
    const tt = t2 * t2;
    n2 = tt * tt * dot(GRAD3[gi2], x2, y2, z2);
  }
  const t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 >= 0) {
    const tt = t3 * t3;
    n3 = tt * tt * dot(GRAD3[gi3], x3, y3, z3);
  }

  return 32 * (n0 + n1 + n2 + n3);
}

// ---- Public API: baseGeometry -----------------------------------------

export type MeshGeometry = {
  /** Rest-position coordinates. Read-only; never mutate. */
  readonly points: readonly Vec3[];
  /** Edge pairs as point indices. */
  readonly edges: readonly Edge[];
};

/**
 * Generate the mesh's rest geometry. Deterministic — always returns the
 * same shape. Call once per page load and cache (both components do).
 */
export function buildMeshGeometry(): MeshGeometry {
  const rng = mulberry32(RNG_SEED);
  const points = samplePoints(
    rng,
    MESH_NODE_COUNT,
    MESH_HALF_WIDTH,
    MESH_Z_RANGE,
    MIN_DIST
  );
  const edges = delaunayEdges(points);
  return { points, edges };
}

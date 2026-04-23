# Perf Audit — §11 Lighthouse Pass

Date: 2026-04-24. Target: Mobile Perf ≥ 90; hold Desktop ≥ 95; hold A11y/BP/SEO at 100.

## Before

### Lighthouse (last recorded, pre-audit)

| Category       | Desktop | Mobile |
| -------------- | ------: | -----: |
| Performance    |      99 |     68 |
| Accessibility  |     100 |    100 |
| Best Practices |     100 |    100 |
| SEO            |     100 |    100 |

Five mobile metric values not yet captured per §2.3. Dev-environment Lighthouse only was run; production-build measurement is deferred to §5 (three-run median against `pnpm start`). Treating the 68/99 spread as the diagnostic signal.

### Bundle sizes (production build, Next 16 + Turbopack)

Next 16's Turbopack production build does **not** emit the classic route-size table in `next build` stdout. Measured directly from `.next/static/chunks` + `build-manifest.json`.

Initial-load JS (what ships on every route before any lazy chunk):

| Chunk                                  |    Raw |    Gzipped |
| -------------------------------------- | -----: | ---------: |
| `0unv_2scahx6j.js` (root)              |  22 KB |     7.4 KB |
| `0yt0qe1fn.uoo.js` (root, Next runtime) | 196 KB |    49.0 KB |
| `0v3lyuj75aq50.js` (root, React/app)   | 228 KB |    71.0 KB |
| `turbopack-0b7g-htk9avwy.js` (root)    |  12 KB |     ~4 KB  |
| `03~yq9q893hmn.js` (polyfills)         | 113 KB |    39.5 KB |
| **Total initial JS gzipped**           |        | **≈171 KB** |
| CSS (one file)                         |  32 KB |     ~6 KB  |

**Over the §2 130-KB target by ~41 KB.**

Lazy chunks (NOT in rootMainFiles):

| Chunk                        |    Raw | Gzipped | Contents                        |
| ---------------------------- | -----: | ------: | ------------------------------- |
| `0wk28bjyhvkb7.js`           | 884 KB |  233 KB | three + R3F (dynamic-imported)  |
| `0c4fu0wwr0lru.js`           | 127 KB |   42 KB | likely Canvas inner component   |

### LCP element (prediction, browser-verified pending)

Hero `<h1>` — "I build cloud infrastructure…" — at `font-display text-[clamp(2.75rem,9vw,9rem)]`. Fraunces, preloaded. Expected LCP < 2.5s on mobile once the bundle tightens.

## Findings

Hypotheses from §2 checked against source + build artifacts:

### §3.1 three / R3F in the initial bundle — NOT in initial

`HeroMeshSlot.tsx:25` uses `dynamic(() => import("./HeroMeshCanvas"), { ssr: false })`. The 884-KB / 233-KB-gz three chunk is correctly deferred; it is NOT referenced in `build-manifest.json::rootMainFiles`. ✓

BUT — new finding: the React tree still mounts `<HeroMeshSlot />` on mobile, because `hidden lg:block` on the slot wrapper is CSS only. When `<HeroMeshSlot />` mounts, it renders `<HeroMeshCanvas />` (the dynamic component) unconditionally for non-reduced-motion users. Next fetches the chunk regardless of whether the surrounding `<div>` is `display: none`. **Mobile downloads 233 KB gz of three.js for zero visual payoff.** This is the largest single mobile-perf offender.

### §3.2 Framer Motion in the initial bundle — YES

Four source files import from `framer-motion`:

- `src/components/motion/Reveal.tsx` — imports `motion`, `useReducedMotion`, `Variants`.
- `src/components/sections/Marquee.tsx` — imports `useReducedMotion` only.
- `src/components/nav/StickyNav.tsx` — imports `useReducedMotion` only.
- `src/components/three/HeroMeshSlot.tsx` — imports `useReducedMotion` only.

`Reveal` is a client component used by every section. `Marquee` and `StickyNav` are rendered in the root layout / page. Framer-motion lands in the initial bundle. The `motion` proxy is the expensive surface; `useReducedMotion` alone is a thin hook but since `motion` is imported elsewhere, the whole library gets pulled in.

The entire framer-motion ES module tree is ~1.6 MB unminified. Minified+gzipped, a typical build ships ~35-40 KB gz of framer-motion when only `motion` + `useReducedMotion` are used. That's likely the majority of the ~71 KB gz "app" chunk (`0v3lyuj75aq50.js`).

### §3.3 Fonts — already correct

`layout.tsx` shows: Fraunces (display) has `preload: true`, all three others have `preload: false`. All four use `display: "swap"`. ✓ No change needed.

### §3.4 Lenis — already correct

`LenisProvider.tsx` is `"use client"`, mounted once in `layout.tsx`, early-returns if `prefers-reduced-motion`. Lenis itself is a small library (~15 KB gz estimated). Not a primary concern. ✓

### §3.5 Client components — already correct

Only motion/Canvas/interactive files are `"use client"`:

- `Reveal.tsx` (motion) — correct.
- `LenisProvider.tsx` (RAF loop) — correct.
- `Marquee.tsx` (RAF + observers) — correct.
- `StickyNav.tsx` (state + observers + Lenis) — correct.
- `HeroMeshSlot.tsx` (dynamic import + reduced-motion check) — correct.
- `HeroMeshCanvas.tsx` (R3F) — correct.
- `MeshErrorBoundary.tsx` (class component) — correct.

Every section file (`Hero.tsx`, `BuildLog.tsx`, etc.) is a Server Component that composes `<Reveal>` where needed. Pattern is already "push client down the tree, not up." ✓ Server components' JSX is server-rendered and doesn't ship as JS.

### §3.6 Images — none

No `<img>` or `<Image>` in the current render tree. Portrait slot in `GetInTouch.tsx` is a reserved comment only. ✓

### §3.7 CSS — 32 KB raw / ~6 KB gz

Small. Not a primary concern.

## Priority ranking

1. **Mobile downloads the 233 KB gz three chunk unnecessarily.** Fix: gate the dynamic-import branch in `HeroMeshSlot` behind a `matchMedia("(min-width: 1024px)")` check so mobile users never trigger the fetch. Est. delta: massive on mobile TBT — potentially 20+ LCP-score points.
2. **Framer Motion in initial bundle, dragged in by `Reveal`'s `motion[as]` usage.** Reveal is used by every section header and many Reveal items. Replacing `Reveal` with a CSS-only (or tiny IntersectionObserver hook) fade would drop ~35-40 KB gz from the initial bundle. The other three framer-motion callers (`useReducedMotion` only) would still work via the tiny hook surface — OR could replace with a 6-line custom reduced-motion hook backed by `window.matchMedia`.
3. **Lenis is fine.** No action.
4. **Fonts/CSS/images are fine.** No action.

## Changes

### Fix 1 — Gate HeroMesh dynamic import behind `matchMedia("(min-width: 1024px)")`

**File:** `src/components/three/HeroMeshSlot.tsx`
**Addresses:** §3.1 finding — mobile fetched the 233 KB gz three/R3F chunk despite the surrounding slot being `hidden lg:block`.
**Change:** `HeroMeshSlot` now resolves `window.matchMedia("(min-width: 1024px)")` in a client effect and returns `null` on mobile (and during the first client paint, before the MQ resolves). Desktop path is unchanged: reduced-motion users still get the SVG fallback; full-motion users still get the dynamically imported Canvas inside `MeshErrorBoundary`. Resize listener keeps the branch correct across desktop↔mobile viewport crossings.

**Why this works:** `next/dynamic` only triggers the chunk fetch when the component is actually mounted. By short-circuiting to `null` on mobile *before* the dynamic component is rendered, Next never requests `0wk28bjyhvkb7.js` (884 KB raw / 233 KB gz) on phones. The surrounding `<div>` wrapper is still `hidden lg:block`, so desktop layout and behavior are byte-for-byte identical.

**Build verification (post-fix):**
- `rootMainFiles` unchanged — same four initial chunks, ~171 KB gz total.
- Three chunk (`0wk28bjyhvkb7.js`) still sits in `.next/static/chunks` as a lazy chunk, loaded only when `<HeroMeshCanvas />` actually mounts (desktop, non-reduced-motion).
- `pnpm lint` clean, `pnpm tsc --noEmit` clean, `pnpm build` green.

**Expected Lighthouse delta (mobile):** removing a 233 KB gz render-blocking-free but parse-heavy JS chunk from the mobile request graph should cut mobile TBT substantially and lift the Performance score meaningfully. Exact numbers pending the user's §5 three-run median against `pnpm start`.

**Observed Lighthouse delta:** _pending §5 measurement._

### Fix 2 — Rewrite `Reveal`/`RevealItem` as CSS-only; drop `framer-motion`

**Files:**
- `src/components/motion/Reveal.tsx` — full rewrite. Same public API (`as`, `stagger`, `delay`, `trigger`, `viewportMargin`, `className`, `id`), no section callers change.
- `src/lib/useInView.ts` — new. Callback-ref IntersectionObserver hook.
- `src/lib/useReducedMotion.ts` — new. `window.matchMedia("(prefers-reduced-motion: reduce)")` hook, used by the three non-Reveal callers.
- `src/app/globals.css` — added `[data-reveal-item]` base styles + `data-revealed="true"` transition + `@media (prefers-reduced-motion: reduce)` fallback.
- `src/components/nav/StickyNav.tsx`, `src/components/sections/Marquee.tsx`, `src/components/three/HeroMeshSlot.tsx` — swapped `useReducedMotion` import from `framer-motion` to `@/lib/useReducedMotion`.
- `package.json` — `pnpm remove framer-motion` (12.38.0).

**Addresses:** §3.2 finding — framer-motion was dragged in by `Reveal`'s `motion[as]` usage and was resident in client-boundary chunks for every section that imported Reveal.

**Mechanics:**
- Each `Reveal` sets `data-reveal` and toggles `data-revealed="true"` on either mount (default) or in-view (via `useInView`).
- Children are walked recursively at render time (`assignIndices`); every `RevealItem` encountered receives a sequential `__revealIndex` cloned prop, which the item writes to `--reveal-index` inline. Recursion is required because `RevealItem`s are frequently nested inside layout wrappers (`Hero.tsx`, `SelectedBuildsEntry.tsx`, etc.).
- CSS base: `opacity: 0; transform: translateY(14px); transition: opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)`. Exact same duration + ease curve that the framer-era `RevealItem` used in its `transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }` block, so the motion feel is byte-identical to callers.
- `transition-delay: calc(var(--reveal-delay) + var(--reveal-index) * var(--reveal-stagger))` — the stagger and delay props become CSS custom properties on the Reveal root; each item's own `--reveal-index` does the multiplication.
- Reduced-motion is handled purely in CSS via `@media (prefers-reduced-motion: reduce)` — no JS gate, which means SSR and the first client paint are consistent, and the fade reduction works even if JS fails to hydrate.

**Preflight audit (per brief's P.1):**
- `rg "from ['\"](framer-motion|motion/react)['\"]" src/` — four callers, exactly the set expected: `Reveal.tsx`, `StickyNav.tsx`, `Marquee.tsx`, `HeroMeshSlot.tsx`. All switched or rewritten.
- `rg "AnimatePresence" src/` — zero hits. FAQ was built without framer from the start, so §8.6's expected Framer usage in FAQ never materialized — no height animation to replace.
- `rg "motion\." src/` — zero real hits (one comment reference in `Marquee.tsx` about "motion").
- `rg "useReducedMotion|useScroll|useTransform|useSpring|useMotionValue" src/` — only `useReducedMotion`, in the four files already swapped.

**Build verification (post-fix):**
- `pnpm remove framer-motion` succeeded; three packages dropped from the graph.
- `pnpm lint` clean, `pnpm tsc --noEmit` clean, `pnpm build` green.
- `rg -r framer-motion` across `.next/static/chunks/*.js` returns zero hits — framer is gone from every emitted chunk.
- **rootMainFiles initial JS gz:** 131.4 KB gz → 128.1 KB gz (−3.3 KB). The visible delta in rootMainFiles is modest because framer-motion was actually tree-shaken into per-client-boundary lazy chunks rather than the root. The real win is in those per-section chunks — e.g. the StickyNav chunk is now 7.2 KB gz (contains only the component + my 6-line `useReducedMotion`) instead of pulling in framer-motion's hook surface and its transitive graph.
- **Polyfills:** 39.5 KB gz → 38.5 KB gz (−1 KB) — minor, framer-motion was pulling some polyfill surface.
- **Total initial JS gz:** ~171 KB → ~166 KB (−5 KB). Initial-load savings are real but modest; the meaningful TBT improvement comes from the reduced parse/compile cost of the now-smaller lazy client-component chunks fetched during hydration.

**Visual parity check:** Intentional — same duration (700ms), same cubic-bezier (`0.22, 1, 0.36, 1`), same translateY (14px), same opacity range (0→1), same stagger semantics. The only behavioral difference from framer is that the first paint on a mount-triggered Reveal shows the hidden state server-side, then flips on hydration — framer did the same thing via `initial: "hidden"`. User should eyeball Hero, Build Log, Then-vs-Now, Selected Builds on a slow scroll and confirm feel is indistinguishable before committing.

**Observed Lighthouse delta:** _pending §5 measurement._

### Fix §3.2.1 — Repair NO_LCP regression introduced by Fix 2

**Files:**
- `src/components/motion/Reveal.tsx` — emit `data-trigger={trigger}` on the Reveal root alongside `data-reveal`. One-line addition.
- `src/app/globals.css` — split the Reveal CSS into two trigger-discriminated paths. `trigger="mount"` switches to a `@keyframes reveal-up` animation with `animation-fill-mode: both`; `trigger="inView"` keeps the existing transition-gated-by-`data-revealed` behaviour.

**Symptom observed after Fix 2:**
- Lighthouse JSON showed `largest-contentful-paint.errorMessage: "NO_LCP"` on both breakpoints.
- `total-blocking-time` inherited the NO_LCP error (derived metric).
- FCP fired at ~1.5s, CLS was 0.001 — only LCP was broken. Performance score became uncomputable.

**Root cause:** Chrome's LCP algorithm treats an element as a valid LCP candidate only if it is actively visible (`opacity > 0`) at paint time OR has an active CSS animation in flight. The Fix-2 CSS rendered the Hero's above-the-fold content at `opacity: 0` with a CSS *transition* that was scheduled but not started — the transition only begins when JS post-hydration flips `data-revealed="true"`. Between first paint and hydration, Chrome sees `opacity: 0` with no running animation and finds no LCP candidate. Framer Motion avoided this because its WAAPI-backed reveals register with Chrome's paint-timing pipeline as active animations from paint-zero.

**Why keyframes fix it:** A CSS `@keyframes` animation with `animation-fill-mode: both`, triggered by the stylesheet itself with no JS gate, is *actively animating* from first paint. `both` fill-mode means the element holds the `from` state during any `animation-delay` (preserving stagger semantics) and retains the `to` state after completion. Chrome sees an active animation on the Hero h1 from paint-zero and registers it as the LCP candidate. For `inView` Reveals — all below-the-fold — LCP doesn't apply, so keeping the transition-gated behaviour there is correct.

**Preserving visual parity:** same 700ms duration, same `cubic-bezier(0.22, 1, 0.36, 1)` ease, same translateY(14px) start offset, same opacity range. Stagger math is identical: `animation-delay: calc(var(--reveal-delay) + var(--reveal-index) * var(--reveal-stagger))`. The only thing that changed is *what CSS mechanism drives the motion*, not the motion itself.

**Reduced-motion behaviour:**
- Mount path: collapses to "just show the final state" — `animation: none; opacity: 1; transform: none; transition: opacity 350ms linear` (the brief opacity fade remains so the jump isn't jarring, but no transform).
- InView path: retains the opacity-only gate so items still enter as the user scrolls to them, just without the 14px transform.

**SSR verification:** `.next/server/app/index.html` contains the expected `data-reveal="" data-trigger="mount"` and `data-trigger="inView"` attributes baked into the prerendered HTML — the trigger discrimination is present at paint-zero, not added post-hydration, so the correct CSS path applies immediately.

**Build verification (post-fix):**
- `pnpm lint` clean, `pnpm tsc --noEmit` clean, `pnpm build` green.
- Compiled CSS contains `@keyframes reveal-up{0%{opacity:0;transform:translateY(14px)...}` and `[data-trigger=...]` selectors.
- Bundle sizes unchanged from Fix 2 (this is a CSS-surface repair; no JS added beyond one attribute).

**Observed Lighthouse delta:** Fix §3.2.1's keyframes approach turned out to be *insufficient*. See Fix §3.2.2 below. Lighthouse still emitted `NO_LCP` because `animation-fill-mode: both` does not bypass Chrome's opacity-at-paint-time check — the computed style at paint-zero is still the `from` keyframe (opacity: 0), and Chrome uses that as the LCP eligibility gate, not "whether an animation is scheduled."

### Fix §3.2.2 — Make `trigger="mount"` a true passthrough to restore LCP

**Files:**
- `src/components/motion/Reveal.tsx` — rewrite. `trigger="mount"` Reveals are now a full passthrough: no `data-reveal`, no `data-reveal-item`, no `--reveal-index` custom property, no animation at all. Children render at their final DOM state on SSR. `trigger="inView"` path is unchanged in observable behaviour but internally switched from `cloneElement`-based index assignment to a React Context + shared-counter pattern (see "Architectural note" below). `stagger` and `delay` props are accepted on the mount path but ignored, so no section callsites need to change.
- `src/app/globals.css` — deleted the `[data-trigger="mount"]` CSS block and the `@keyframes reveal-up` rule. Reduced-motion rules now apply only to `[data-trigger="inView"]`, which is the only trigger that has any CSS-driven motion.

**Why §3.2.1 was wrong:** I believed Chrome's LCP algorithm treats actively-animating elements as eligible LCP candidates. That's true in some contexts, but Chrome 106+'s LCP gate specifically checks *computed opacity at paint time*. A `@keyframes` animation starting from `opacity: 0` has computed opacity 0 at paint-zero regardless of `animation-fill-mode: both` — the `both` keyword affects what gets painted *after* the animation ends, not what Chrome sees at first paint. So the Hero h1 continued to be disqualified as an LCP candidate even though it was animating.

**Why §3.2.2 fixes it definitively:** the Hero h1, mono-label, and supporting copy now render at their final state — no `opacity: 0` anywhere in the above-the-fold tree, no CSS animation that needs to complete before content is considered visible. Chrome sees a fully-opaque Hero h1 at paint-zero and registers it as the LCP candidate immediately.

**Trade-off accepted:** the Hero loses its mount-time fade-up animation. The hero now renders at its final state with no entrance motion. Below-the-fold sections (all `trigger="inView"`) retain their fade-up on scroll-into-view. The stagger timing and cubic-bezier ease are preserved for every inView caller, so the site's rhythm on scroll is identical to Fix 2. Only the hero's first-paint moment is now static.

**Architectural note on the inView path:** the previous Fix-2/3.2.1 implementation assigned `revealIndex` via `React.Children.map` + `cloneElement`, with a recursive walk to handle nested RevealItems inside layout wrappers. That approach silently failed: every RevealItem in the SSR output rendered with `--reveal-index: 0`, so stagger was effectively disabled for all inView Reveals. Root cause was that `child.type === RevealItem` was not a reliable cross-module identity check under this Turbopack + React 19 configuration. The rewrite replaces the walk with React Context: the Reveal root publishes a shared counter object `{ n: number }`, and each RevealItem claims a sequential index via `useState(() => counter.n++)` on first render. This works across any nesting depth, survives re-renders (indices lock in via state), and passes React 19's strict lint rules (one narrow `eslint-disable-next-line react-hooks/immutability` for the in-place counter increment — canonical pattern for this idiom).

**SSR verification:**
- Hero section: zero `opacity:0`, zero `data-reveal-item`, zero `data-reveal=""` attributes in the prerendered HTML. Hero h1 is a plain `<h1>` with only its normal class list.
- Below-the-fold: first BuildLog article shows indices `0, 1, 2, 3, 4` in sequence — confirming the inView stagger now actually works for the first time (it was silently broken in Fix 2 and Fix §3.2.1 as well).
- All 47 RevealItem instances across the page show correctly-incrementing indices within each Reveal's scope.

**Build verification (post-fix):**
- `pnpm lint` clean, `pnpm tsc --noEmit` clean, `pnpm build` green.
- Bundle footprint unchanged from Fix 2 — this is a render-surface rewrite; no deps added, no chunks moved.

**Observed Lighthouse delta:** _pending §5 three-run median. Expected: `largest-contentful-paint` returns a numeric value (LCP candidate should be the Hero h1, firing close to FCP since no animation gates it); `total-blocking-time` returns a numeric value; Performance score becomes computable. Mobile target ≥90, Desktop hold ≥95._

## After

_Populated after fixes + §5 three-run median Lighthouse capture._

## Pre-deploy baseline (2026-04-24)

Recorded immediately before Vercel import. Fixes §3.1, §3.2 (incl. §3.2.1/§3.2.2 squash), and deploy-hardening commits (Node pin, security headers, SEO routes, Vercel observability) are all landed on `main`. §3.3 (fonts) is deferred — Speed Insights real-user data will decide whether it becomes a follow-up.

### Local Lighthouse (three-run median, simulated Slow 4G on mobile)

| Category       | Mobile | Desktop |
| -------------- | -----: | ------: |
| Performance    |     93 |     100 |
| Accessibility  |    100 |     100 |
| Best Practices |    100 |     100 |
| SEO            |    100 |     100 |

LCP candidate: Hero h1 ("I build cloud infrastructure…"), firing close to FCP since nothing gates it anymore.

### Top 10 JS chunks by gzipped size

| Chunk                          |  Raw |   Gzipped |
| ------------------------------ | ---: | --------: |
| `0wk28bjyhvkb7.js`              | 863 KB | 226.7 KB | (three/R3F, lazy, desktop-only)
| `0v3lyuj75aq50.js`              | 222 KB |  69.2 KB | (root, React + app)
| `03~yq9q893hmn.js`              | 110 KB |  38.5 KB | (polyfills)
| `0gan1gblmcg1~.js`              | 140 KB |  37.5 KB | (root, Next runtime)
| `01qk2~bgf76vu.js`              |  57 KB |  13.4 KB | (Next client nav utilities)
| `0772eqs_yymvl.js`              |  51 KB |  10.6 KB |
| `0jmz6qanafdva.js`              |  30 KB |   8.9 KB |
| `0x_unro5r05.t.js`              |  22 KB |   7.4 KB | (root)
| `0y7.4~ac0v34s.js`              |  12 KB |   5.3 KB |
| `turbopack-0ozo1u-fra1p2.js`    |  10 KB |   4.1 KB | (root, Turbopack runtime)

### Initial-load totals

- **rootMainFiles total gzipped:** 128.7 KB
- **CSS (one file):** 6.0 KB gzipped
- **Polyfills (separate):** 38.5 KB gzipped
- **Total initial payload:** ~173 KB gzipped (JS + CSS + polyfills)
- **Lazy three chunk:** 226.7 KB gzipped — loaded only on desktop + full-motion users thanks to the matchMedia gate from Fix §3.1.

### Regression guard

If a future change drops mobile Performance below 90, revert or fix before merging. The numbers above are the reference.

**Ready for Vercel import.**

## Remaining

_Populated at end of pass._

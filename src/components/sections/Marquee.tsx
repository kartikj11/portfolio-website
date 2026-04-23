"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { featuredSkills } from "@/data/resume";

// ---- Animation tuning ---------------------------------------------------
// Baseline rightward-to-leftward scroll rate. 100 px/s is reading speed:
// at desktop widths, one item exits every ~2.5s, matching the 30–45s
// full-list traverse target.
const BASELINE_PX_PER_MS = 0.1;

// Total multiplier at peak boost is (1 + MAX_BOOST). 1.5 = 2.5x peak.
const MAX_BOOST = 1.5;

// Boost decay rate, per millisecond. At DECAY_RATE = 0.003, a full-boost
// value of 1.5 decays to 0 in ~500ms if no new impulse arrives.
const DECAY_RATE = 0.003;

// Per-event impulse scalar applied to scroll velocity (px/ms).
// Combined with the self-limiting factor (1 - boost/MAX_BOOST), this gives
// a brief flick ~60% of cap and sustained scrolling an asymptote near
// ~90% of cap rather than saturating. Tune here if the feel is off.
const COUPLING = 0.08;

// Frame-delta clamp — if the tab is backgrounded or a GC pause drops a
// frame, don't translate the track by hundreds of pixels when the next
// frame lands. Clamp to ~3 frames of motion.
const MAX_FRAME_DELTA_MS = 48;

// Edge mask — same value used for the animated wrapper and the static
// reduced-motion list so the two layouts share a silhouette.
const MASK_IMAGE =
  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)";

export function Marquee() {
  const prefersReduced = useReducedMotion();

  // Refs: all animation state lives here. Nothing in the animation path
  // touches React state, so RAF never triggers re-renders.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced-motion: early return. No RAF, no listeners, no observers,
    // no animation code runs at all for these users.
    if (prefersReduced) return;

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    // Mutable animation state, scoped to this effect.
    let offset = 0;
    let boost = 0;
    let oneCopyWidth = track.scrollWidth / 2;
    let lastTick = performance.now();
    let lastScrollY = window.scrollY;
    let lastScrollTime = lastTick;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(now - lastTick, MAX_FRAME_DELTA_MS);
      lastTick = now;

      // Decay the boost toward zero at a constant rate.
      boost = Math.max(0, boost - DECAY_RATE * dt);

      // Advance: baseline * (1 + boost) pixels per ms of frame time.
      offset -= BASELINE_PX_PER_MS * (1 + boost) * dt;

      // Wrap seamlessly when we've scrolled one copy-width. Using `while`
      // guards against massive jumps if a frame skipped badly.
      while (oneCopyWidth > 0 && offset <= -oneCopyWidth) {
        offset += oneCopyWidth;
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      rafIdRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafIdRef.current !== null) return;
      lastTick = performance.now();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const handleScroll = () => {
      const sy = window.scrollY;
      const t = performance.now();
      const dy = sy - lastScrollY;
      const dt = t - lastScrollTime;
      lastScrollY = sy;
      lastScrollTime = t;

      if (dt <= 0) return;

      const vel = Math.abs(dy / dt); // px per ms
      // Non-linear impulse: shrinks as boost approaches MAX_BOOST so
      // sustained scroll asymptotes below the cap instead of saturating.
      const headroom = 1 - boost / MAX_BOOST;
      const impulse = COUPLING * vel * headroom;
      boost = Math.min(MAX_BOOST, boost + impulse);
    };

    // Recompute the copy-width when the viewport or fonts change. One
    // ResizeObserver on the track is enough — no per-item observers.
    const resizeObserver = new ResizeObserver(() => {
      const w = track.scrollWidth / 2;
      // Guard against a zero-width measurement during layout thrash.
      if (w > 0) oneCopyWidth = w;
    });
    resizeObserver.observe(track);

    // Pause the RAF loop when the marquee leaves the viewport. Zero CPU
    // when not visible; the scroll listener stays armed (it's cheap) so
    // that re-entry picks up any boost the user builds from a flick that
    // scrolls the marquee back on-screen.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { root: null, threshold: 0 }
    );
    intersectionObserver.observe(wrapper);

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Kick off. IntersectionObserver will fire immediately on next tick
    // with the current visibility state, so `start()` here just ensures
    // we're running if the marquee is already on-screen at mount.
    start();

    return () => {
      // Cancel pending RAF explicitly — an un-cancelled RAF after unmount
      // is the most likely leak source for this pattern.
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prefersReduced]);

  // ---- Reduced-motion: static wrapped flex row --------------------------
  if (prefersReduced) {
    return (
      <section
        id="stack"
        aria-labelledby="stack-heading"
        className="relative pb-16 pt-6 sm:pb-20 sm:pt-8 lg:pb-24 lg:pt-12"
      >
        <h2 id="stack-heading" className="sr-only">
          The Stack
        </h2>
        <div
          className="mx-auto max-w-[1680px] px-6 sm:px-10 lg:px-16"
          style={{
            maskImage: MASK_IMAGE,
            WebkitMaskImage: MASK_IMAGE,
          }}
        >
          <p className="flex flex-wrap items-baseline gap-x-5 gap-y-3 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-normal leading-[1.25] tracking-[-0.01em] text-ink sm:gap-x-6 lg:gap-x-8">
            {featuredSkills.flatMap((skill, i) =>
              i === 0
                ? [<span key={skill}>{skill}</span>]
                : [
                    <span
                      key={`${skill}-sep`}
                      aria-hidden
                      className="text-mute"
                    >
                      /
                    </span>,
                    <span key={skill}>{skill}</span>,
                  ]
            )}
          </p>
        </div>
      </section>
    );
  }

  // ---- Animated: full-bleed RAF-driven horizontal scroll ----------------
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="relative pb-16 pt-6 sm:pb-20 sm:pt-8 lg:pb-24 lg:pt-12"
    >
      <h2 id="stack-heading" className="sr-only">
        The Stack
      </h2>
      <div
        ref={wrapperRef}
        aria-hidden
        className="relative w-full overflow-hidden"
        style={{
          maskImage: MASK_IMAGE,
          WebkitMaskImage: MASK_IMAGE,
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max items-baseline whitespace-nowrap py-3 font-display text-[clamp(2rem,5vw,4rem)] font-normal leading-[1.25] tracking-[-0.01em] text-ink will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <MarqueeCopy />
          <MarqueeCopy />
        </div>
      </div>
    </section>
  );
}

/**
 * One copy of the item list, ending with a trailing slash so the joint
 * between copies reads as a clean `... / ITEM / ITEM ...` rhythm instead
 * of a double-space. The component is rendered twice inside the track.
 */
function MarqueeCopy() {
  return (
    <div className="flex shrink-0 items-baseline">
      {featuredSkills.map((skill) => (
        <span key={skill} className="flex shrink-0 items-baseline">
          <span className="px-4 sm:px-6 lg:px-8">{skill}</span>
          <span aria-hidden className="text-mute">
            /
          </span>
        </span>
      ))}
    </div>
  );
}

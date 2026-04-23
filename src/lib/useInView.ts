"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  /**
   * IntersectionObserver `rootMargin`. Defaults to `-20% 0px` to match the
   * "reveal when the section is meaningfully inside the viewport, not at
   * the edge" convention the Framer-based Reveal used across the site.
   */
  margin?: string;
  /**
   * If true (default), the observer disconnects after the first time the
   * element becomes visible — the hook latches to `true` and never flips
   * back. If false, the return value tracks live visibility.
   */
  once?: boolean;
};

/**
 * Observes whether the attached element is intersecting the viewport.
 * Returns `[setRef, inView]` where `setRef` is a callback ref to attach
 * to the observed element.
 *
 * Callback-ref form is used because React 19's ref-in-render lint rule
 * flags `ref.current` access during render. The callback form lets the
 * hook wire up the observer inside the callback itself — no render-time
 * ref access.
 *
 * SSR-safe: IntersectionObserver access happens in the callback ref,
 * which only fires on the client when the element mounts.
 */
export function useInView<T extends Element>({
  margin = "-20% 0px",
  once = true,
}: UseInViewOptions = {}): [(el: T | null) => void, boolean] {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (el: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setInView(true);
              if (once) observer.disconnect();
            } else if (!once) {
              setInView(false);
            }
          }
        },
        { rootMargin: margin, threshold: 0 }
      );
      observer.observe(el);
      observerRef.current = observer;
    },
    [margin, once]
  );

  useEffect(() => {
    // Cleanup on unmount — disconnect whatever observer is live.
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return [setRef, inView];
}

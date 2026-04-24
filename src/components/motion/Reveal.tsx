"use client";

import {
  createContext,
  createElement,
  useContext,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useInView } from "@/lib/useInView";

/**
 * CSS-driven reveal primitive. Same public API as the framer-motion
 * implementation it replaced, but drops the framer bundle from the
 * initial chunk.
 *
 * Two paths, dispatched via RevealContext:
 *
 *   - `trigger="mount"` (default) — **passthrough**. Renders children
 *     at their final state with no animation, no `data-reveal`, no
 *     `data-reveal-item`, no custom properties. Required for above-
 *     the-fold content: Chrome's LCP algorithm (106+) disqualifies any
 *     element whose computed opacity is 0 at paint time, so SSR-ing
 *     the Hero h1 at its final state is the only reliable way to keep
 *     it as an LCP candidate. `stagger` and `delay` are accepted but
 *     ignored on this path so callsites don't need to change.
 *
 *   - `trigger="inView"` — IntersectionObserver-gated fade-up. The
 *     root sets `data-reveal` + `data-trigger="inView"` and toggles
 *     `data-revealed="true"` once in-view. Each RevealItem claims a
 *     sequential index on its first render using a shared counter
 *     object held in Context. The counter object's identity is stable
 *     per Reveal instance (via useState), so indices lock in on mount
 *     and survive re-renders.
 */

type ContainerTag =
  | "div"
  | "section"
  | "header"
  | "footer"
  | "article"
  | "ul"
  | "ol"
  | "dl";

type ItemTag =
  | "div"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "span"
  | "li"
  | "dt"
  | "dd";

type Trigger = "mount" | "inView";

type RevealProps = {
  as?: ContainerTag;
  stagger?: number;
  delay?: number;
  trigger?: Trigger;
  /** IntersectionObserver rootMargin when trigger === "inView". */
  viewportMargin?: string;
  className?: string;
  id?: string;
  children: ReactNode;
};

type RevealItemProps = {
  as?: ItemTag;
  className?: string;
  id?: string;
  children: ReactNode;
};

/**
 * `assigned` memoizes index allocation by `useId()` value so the
 * counter mutation inside RevealItem's `useState` initializer is
 * idempotent. Without this, React 19 StrictMode dev double-invokes
 * each initializer and the counter advances twice per item — SSR
 * (run once) and client (run twice) end up disagreeing on the
 * `--reveal-index` value, causing a hydration mismatch.
 */
type RevealContextValue =
  | { mode: "mount" }
  | { mode: "inView"; counter: { n: number; assigned: Map<string, number> } }
  | null;

const RevealContext = createContext<RevealContextValue>(null);

export function Reveal({
  as = "div",
  stagger = 0.06,
  delay = 0.05,
  trigger = "mount",
  viewportMargin = "-20% 0px",
  className,
  id,
  children,
}: RevealProps) {
  const [setRootRef, inView] = useInView<HTMLElement>({
    margin: viewportMargin,
    once: true,
  });

  // A per-instance counter object. `useState` with a function initializer
  // creates the object exactly once per Reveal instance; its identity is
  // stable across re-renders. Each RevealItem claims a sequential index
  // by passing its `useId()` to the counter; the `assigned` map keeps
  // the lookup idempotent so StrictMode's double-invocation of the
  // initializer doesn't double-advance `n`.
  //
  // Note: this is a plain object, NOT a useRef. The lint rules around
  // refs (react-hooks/refs, react-hooks/immutability) don't apply to
  // plain objects stored in useState, which is what lets this idiom
  // compile under React 19's stricter lint.
  const [counter] = useState<{ n: number; assigned: Map<string, number> }>(
    () => ({ n: 0, assigned: new Map() })
  );

  const contextValue = useMemo<RevealContextValue>(
    () =>
      trigger === "mount" ? { mode: "mount" } : { mode: "inView", counter },
    [trigger, counter]
  );

  if (trigger === "mount") {
    return createElement(
      RevealContext.Provider,
      { value: contextValue },
      createElement(as, { id, className }, children)
    );
  }

  const style: CSSProperties = {
    ["--reveal-stagger" as string]: `${stagger}s`,
    ["--reveal-delay" as string]: `${delay}s`,
  };

  return createElement(
    RevealContext.Provider,
    { value: contextValue },
    createElement(
      as,
      {
        ref: setRootRef,
        id,
        className,
        style,
        "data-reveal": "",
        "data-trigger": "inView",
        "data-revealed": inView ? "true" : undefined,
      },
      children
    )
  );
}

export function RevealItem({
  as = "div",
  className,
  id,
  children,
}: RevealItemProps) {
  const ctx = useContext(RevealContext);

  // `useId()` is stable across SSR and client renders for the same
  // component instance — and stable across StrictMode's double-render
  // of the initializer. We use it as a memoization key so the
  // counter advance happens at most once per RevealItem regardless
  // of how many times the initializer is invoked.
  const itemId = useId();

  const [index] = useState<number>(() => {
    if (ctx && ctx.mode === "inView") {
      const cached = ctx.counter.assigned.get(itemId);
      if (cached !== undefined) return cached;
      const i = ctx.counter.n;
      // eslint-disable-next-line react-hooks/immutability
      ctx.counter.n = i + 1;
      ctx.counter.assigned.set(itemId, i);
      return i;
    }
    return 0;
  });

  if (!ctx || ctx.mode === "mount") {
    return createElement(as, { id, className }, children);
  }

  const style: CSSProperties = {
    ["--reveal-index" as string]: index,
  };

  return createElement(
    as,
    {
      id,
      className,
      style,
      "data-reveal-item": "",
    },
    children
  );
}

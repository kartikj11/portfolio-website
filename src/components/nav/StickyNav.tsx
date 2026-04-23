"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "@/components/motion/LenisProvider";
import { navItems } from "@/data/resume";

/**
 * Sticky anchor nav — does not appear over Hero, fades in after the
 * Hero is ~mostly scrolled past, and hides again if Hero re-enters.
 * Scroll-spy highlights the current section. Desktop shows a
 * horizontal middle-dot row; below `lg` the row collapses to a single
 * MENU button that opens a full-screen overlay.
 */
export function StickyNav() {
  const prefersReduced = useReducedMotion() ?? false;
  const lenis = useLenis();

  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstOverlayItemRef = useRef<HTMLAnchorElement | null>(null);

  // ---- Scroll-spy: one observer, seven targets ---------------------------
  useEffect(() => {
    const targets = navItems
      .map((item) => document.getElementById(item.anchorId))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // Active band: middle 20% of the viewport. When a section's mid-point
    // crosses into this band it becomes the active nav item.
    const observer = new IntersectionObserver(
      (entries) => {
        // Multiple entries may fire per callback; pick the one that's
        // intersecting (if any). Scroll usually produces one change at a
        // time, but edge cases (fast scroll, resize) can batch.
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    for (const el of targets) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // ---- Hero visibility: nav fades in after Hero is mostly scrolled past --
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Hide nav while Hero is at least 20% visible; show otherwise.
        setVisible(!entry.isIntersecting || entry.intersectionRatio < 0.2);
      },
      { threshold: [0, 0.2, 0.5, 1] }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // ---- Body scroll lock + Lenis pause + <main> inert when menu open ------
  useEffect(() => {
    if (!menuOpen) return;

    const main = document.querySelector("main");
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    lenis?.stop();
    if (main) main.inert = true;

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      if (main) main.inert = false;
    };
  }, [menuOpen, lenis]);

  // ---- Escape closes overlay; focus returns to MENU button ---------------
  useEffect(() => {
    if (!menuOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    // Focus the first item on open for keyboard users.
    firstOverlayItemRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // ---- Return focus to MENU button after overlay close -------------------
  const prevMenuOpen = useRef(menuOpen);
  useEffect(() => {
    if (prevMenuOpen.current && !menuOpen) {
      menuButtonRef.current?.focus();
    }
    prevMenuOpen.current = menuOpen;
  }, [menuOpen]);

  // ---- Navigation handler: Lenis smooth-scroll, fallback to native -------
  const handleNavClick = useCallback(
    (anchorId: string) => {
      setMenuOpen(false);
      const target = document.getElementById(anchorId);
      if (!target) return;

      const navHeight = navRef.current?.offsetHeight ?? 56;

      if (lenis && !prefersReduced) {
        lenis.scrollTo(target, { offset: -navHeight });
      } else {
        // Reduced-motion or Lenis not ready: instant jump via native API.
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - navHeight, behavior: "auto" });
      }
    },
    [lenis, prefersReduced]
  );

  // Visibility transform: fade + small translate on desktop, fade-only
  // for reduced-motion users.
  const visibilityStyle = prefersReduced
    ? { opacity: visible ? 1 : 0 }
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-6px)",
      };

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary"
        className={`fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-paper/90 ease-out ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          ...visibilityStyle,
          transitionProperty: "opacity, transform",
          transitionDuration: "250ms",
        }}
      >
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-6 py-3 sm:px-10 sm:py-4 lg:px-16 lg:py-5">
          {/* Desktop: horizontal item row */}
          <ul className="hidden items-baseline gap-x-3 font-mono text-[0.8rem] uppercase tracking-[0.2em] lg:flex">
            {navItems.flatMap((item, i) => {
              const isActive = activeId === item.anchorId;
              const link = (
                <li key={item.anchorId}>
                  <a
                    href={`#${item.anchorId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.anchorId);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={`inline-flex items-baseline gap-x-1.5 transition-colors duration-200 ease-out focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4 ${
                      isActive
                        ? "text-ink"
                        : "text-mute hover:text-ink"
                    }`}
                  >
                    <span>{item.number}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              );
              return i === 0
                ? [link]
                : [
                    <li
                      key={`${item.anchorId}-sep`}
                      aria-hidden
                      className="text-mute/70"
                    >
                      ·
                    </li>,
                    link,
                  ];
            })}
          </ul>

          {/* Mobile: spacer to left, MENU button to right.
              The empty span on the left keeps `justify-between` balanced
              even though there's no wordmark. */}
          <span aria-hidden className="lg:hidden" />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-overlay"
            className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-ink transition-colors duration-200 ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4 lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile overlay — full-screen, role=dialog for screen readers.
          Rendered always for consistent hydration; visibility controlled
          by opacity + pointer-events so the fade can be CSS-only. */}
      <div
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-heading"
        aria-hidden={!menuOpen}
        onClick={(e) => {
          // Clicking the backdrop (but not an item) closes the overlay.
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
        className={`fixed inset-0 z-50 bg-paper transition-opacity duration-200 ease-out lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <h2 id="mobile-nav-heading" className="sr-only">
          Site Navigation
        </h2>
        <div className="flex min-h-dvh flex-col justify-center px-6 sm:px-10">
          <ul className="flex flex-col gap-y-4">
            {navItems.map((item, i) => (
              <li key={item.anchorId}>
                <a
                  ref={i === 0 ? firstOverlayItemRef : undefined}
                  href={`#${item.anchorId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.anchorId);
                  }}
                  className="group flex items-baseline gap-x-4 text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4"
                >
                  <span className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-mute transition-colors duration-200 ease-out group-hover:text-ink">
                    {item.number}
                  </span>
                  <span className="font-display text-[clamp(2.25rem,7vw,4rem)] font-normal leading-[1.1] tracking-[-0.02em]">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

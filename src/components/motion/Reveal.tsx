"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

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
  /** Only used when trigger === "inView". Framer viewport margin. */
  viewportMargin?: string;
  className?: string;
  children: ReactNode;
};

type RevealItemProps = {
  as?: ItemTag;
  className?: string;
  children: ReactNode;
};

export function Reveal({
  as = "div",
  stagger = 0.06,
  delay = 0.05,
  trigger = "mount",
  viewportMargin = "-10% 0px",
  className,
  children,
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  const container: Variants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      }
    : {
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      };

  // framer-motion types motion[tag] as a valid component, but TS can't
  // narrow the union cleanly — cast once at the boundary.
  const Component = motion[as] as ElementType;

  const animationProps =
    trigger === "inView"
      ? {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: viewportMargin },
        }
      : { initial: "hidden", animate: "visible" };

  return (
    <Component
      {...animationProps}
      variants={container}
      className={className}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  as = "div",
  className,
  children,
}: RevealItemProps) {
  const prefersReduced = useReducedMotion();

  const item: Variants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      }
    : {
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      };

  const Component = motion[as] as ElementType;

  return (
    <Component variants={item} className={className}>
      {children}
    </Component>
  );
}

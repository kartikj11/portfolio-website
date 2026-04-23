"use client";

import { Component, type ReactNode } from "react";

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Error boundary scoped to the Hero mesh. If R3F fails to initialize,
 * WebGL context creation fails, the noise loop throws, or anything in
 * the Canvas subtree errors during render, we render the SVG fallback
 * instead. The Hero never shows a broken canvas.
 *
 * Class component because React doesn't support error boundaries via
 * hooks in v19. This is the smallest-possible boundary that does the
 * one job we need.
 */
export class MeshErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Log once; don't spam if React tries to recover.
    console.warn("[HeroMesh] Canvas failed, falling back to SVG:", error);
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

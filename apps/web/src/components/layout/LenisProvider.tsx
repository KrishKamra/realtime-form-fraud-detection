"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

type LenisProviderProps = {
  children: ReactNode;
  /** Disable smooth scroll on dense tool surfaces when preferred */
  enabled?: boolean;
};

/**
 * App-wide Lenis smooth scroll.
 * Respects prefers-reduced-motion via options.smoothWheel gating.
 */
export function LenisProvider({ children, enabled = true }: LenisProviderProps) {
  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.15,
        smoothWheel: true,
        touchMultiplier: 1.2,
        wheelMultiplier: 0.95,
        anchors: true,
        autoRaf: true,
        // Prevent Lenis from fighting native focus scrolls in forms
        prevent: (node) => {
          if (!(node instanceof HTMLElement)) return false;
          return (
            node.closest("[data-lenis-prevent]") != null ||
            node.closest("input, textarea, select, [contenteditable='true']") != null
          );
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}

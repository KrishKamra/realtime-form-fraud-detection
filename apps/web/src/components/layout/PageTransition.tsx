"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

/**
 * Route-level enter/exit choreography + a thin top progress sheen.
 * Works with App Router via pathname-keyed AnimatePresence.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();

  // Scroll to top on route change (Lenis-aware)
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Top route progress sheen — CSS keyframe, no effect setState */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden"
      >
        <div
          key={pathname}
          className="route-progress-bar h-full w-full origin-left bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.65)]"
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-screen flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animate a number from 0 → target when `active` becomes true.
 */
export function useCountUp(
  target: number,
  {
    duration = 1200,
    active = true,
    decimals = 0,
  }: { duration?: number; active?: boolean; decimals?: number } = {},
) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setValue(Number(next.toFixed(decimals)));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, active, decimals]);

  if (!active) return 0;
  return value;
}

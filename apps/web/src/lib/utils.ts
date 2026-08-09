import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const spring = {
  snappy: { type: "spring" as const, stiffness: 420, damping: 32 },
  smooth: { type: "spring" as const, stiffness: 220, damping: 28 },
  gentle: { type: "spring" as const, stiffness: 120, damping: 22 },
};

/** @deprecated use `spring` */
export const springTransitions = spring;

export function riskTier(score: number): "low" | "medium" | "high" {
  if (score > 65) return "high";
  if (score > 35) return "medium";
  return "low";
}

export function riskColorClass(score: number, kind: "text" | "bg" | "border" | "glow" = "text") {
  const tier = riskTier(score);
  const map = {
    low: {
      text: "text-emerald-400",
      bg: "bg-emerald-500",
      border: "border-emerald-500/30",
      glow: "shadow-glow-risk-low",
    },
    medium: {
      text: "text-amber-400",
      bg: "bg-amber-500",
      border: "border-amber-500/30",
      glow: "",
    },
    high: {
      text: "text-rose-400",
      bg: "bg-rose-500",
      border: "border-rose-500/30",
      glow: "shadow-glow-risk-high",
    },
  } as const;
  return map[tier][kind];
}

export function formatMs(ms: number | undefined | null, fallback = "< 1.0 ms") {
  if (ms == null || Number.isNaN(ms)) return fallback;
  return `${ms.toFixed(ms < 10 ? 2 : 1)} ms`;
}

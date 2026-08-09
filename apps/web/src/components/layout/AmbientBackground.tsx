"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AmbientBackgroundProps = {
  variant?: "default" | "risk-low" | "risk-medium" | "risk-high" | "ops";
  className?: string;
  showGrid?: boolean;
  showNoise?: boolean;
};

const glowMap = {
  default: {
    primary: "bg-indigo-600/20",
    secondary: "bg-emerald-600/10",
    tertiary: "bg-violet-600/10",
  },
  "risk-low": {
    primary: "bg-emerald-600/18",
    secondary: "bg-indigo-600/10",
    tertiary: "bg-cyan-600/08",
  },
  "risk-medium": {
    primary: "bg-amber-600/16",
    secondary: "bg-indigo-600/10",
    tertiary: "bg-orange-600/08",
  },
  "risk-high": {
    primary: "bg-rose-600/18",
    secondary: "bg-orange-600/10",
    tertiary: "bg-indigo-600/08",
  },
  ops: {
    primary: "bg-indigo-600/14",
    secondary: "bg-cyan-600/08",
    tertiary: "bg-emerald-600/08",
  },
};

export function AmbientBackground({
  variant = "default",
  className,
  showGrid = true,
  showNoise = true,
}: AmbientBackgroundProps) {
  const glows = glowMap[variant];

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        showNoise && "noise-overlay",
        className,
      )}
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute -top-24 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]",
          glows.primary,
        )}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={cn(
          "absolute bottom-0 right-[-10%] h-[380px] w-[560px] rounded-full blur-[130px]",
          glows.secondary,
        )}
      />
      <motion.div
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className={cn(
          "absolute bottom-[20%] left-[-8%] h-[300px] w-[420px] rounded-full blur-[120px]",
          glows.tertiary,
        )}
      />

      {showGrid && <div className="grid-mask absolute inset-0" />}

      {/* Soft vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.11_0.012_260)_75%)]" />
    </div>
  );
}

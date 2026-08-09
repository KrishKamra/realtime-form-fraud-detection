"use client";

import { motion } from "framer-motion";
import { cn, riskTier } from "@/lib/utils";

type RiskGaugeProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  showPulse?: boolean;
};

const strokeByTier = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
};

const glowByTier = {
  low: "drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]",
  medium: "drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]",
  high: "drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]",
};

export function RiskGauge({
  score,
  size = 176,
  strokeWidth = 12,
  label = "Risk Index",
  className,
  showPulse = true,
}: RiskGaugeProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (circumference * clamped) / 100;
  const tier = riskTier(clamped);
  const center = size / 2;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {showPulse && (
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute inset-[12%] rounded-full",
            tier === "high" && "bg-rose-500",
            tier === "medium" && "bg-amber-500",
            tier === "low" && "bg-emerald-500",
          )}
        />
      )}

      <svg
        width={size}
        height={size}
        className={cn("-rotate-90 transform", glowByTier[tier])}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800/90"
          fill="transparent"
        />
        {/* Soft track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-700/40"
          fill="transparent"
          opacity={0.5}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          strokeLinecap="round"
          className={cn("transition-colors duration-500", strokeByTier[tier])}
          fill="transparent"
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <motion.span
          key={clamped.toFixed(0)}
          initial={{ scale: 0.92, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-mono text-4xl font-extrabold tracking-tight text-slate-50"
        >
          {clamped.toFixed(0)}
        </motion.span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

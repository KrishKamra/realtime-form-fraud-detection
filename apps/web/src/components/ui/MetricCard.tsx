"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone?: "neutral" | "danger" | "brand" | "success";
  className?: string;
};

const iconTone = {
  neutral: "bg-slate-800/60 text-slate-400 border-slate-700/50",
  danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  brand: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const valueTone = {
  neutral: "text-slate-100",
  danger: "text-rose-400",
  brand: "text-indigo-400",
  success: "text-emerald-400",
};

const hintTone = {
  neutral: "text-slate-500",
  danger: "text-rose-400/70",
  brand: "text-indigo-400/70",
  success: "text-emerald-400/70",
};

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className,
}: MetricCardProps) {
  return (
    <GlassCard
      hover
      className={cn("flex items-center justify-between p-5", className)}
      whileHover={{ y: -2 }}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <motion.p
          key={String(value)}
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mt-1 font-mono text-3xl font-bold tracking-tight", valueTone[tone])}
        >
          {value}
        </motion.p>
        {hint && (
          <p className={cn("mt-1 text-[10px]", hintTone[tone])}>{hint}</p>
        )}
      </div>
      <div className={cn("rounded-xl border p-3", iconTone[tone])}>{icon}</div>
    </GlassCard>
  );
}

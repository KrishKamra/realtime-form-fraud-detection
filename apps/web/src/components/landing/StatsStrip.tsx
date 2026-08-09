"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { GlassCard } from "@/components/ui/GlassCard";

const stats = [
  { label: "Test ROC-AUC", target: 1.0, suffix: "", decimals: 2, static: null as string | null },
  { label: "Inference p99", target: 0.84, suffix: "", decimals: 2, static: "< 1.0 ms" },
  { label: "Feature Vectors", target: 42, suffix: "", decimals: 0, static: null },
  { label: "Precision", target: 100, suffix: "%", decimals: 0, static: null },
];

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <SectionReveal as="section" className="relative z-10 px-6 py-10">
      <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <StatCell key={stat.label} {...stat} active={inView} />
        ))}
      </div>
    </SectionReveal>
  );
}

function StatCell({
  label,
  target,
  suffix,
  decimals,
  static: staticDisplay,
  active,
}: {
  label: string;
  target: number;
  suffix: string;
  decimals: number;
  static: string | null;
  active: boolean;
}) {
  const value = useCountUp(target, { active, decimals, duration: 1400 });
  const shown =
    staticDisplay ??
    `${decimals > 0 ? value.toFixed(decimals) : Math.round(value)}${suffix}`;

  return (
    <GlassCard intensity="subtle" className="px-4 py-5 text-center sm:px-5">
      <p className="font-mono text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
        {active ? shown : "—"}
      </p>
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </GlassCard>
  );
}

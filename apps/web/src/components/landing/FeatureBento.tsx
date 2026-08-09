"use client";

import {
  Cpu,
  Fingerprint,
  Gauge,
  Lock,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Zap,
    title: "Sub-10ms inference",
    body: "LightGBM compiled to ONNX C++ execution. p99 under a millisecond on single-frame scoring.",
    className: "md:col-span-2",
  },
  {
    icon: Fingerprint,
    title: "Zero PII exposure",
    body: "Only timing deltas, velocities, and focus IDs leave the browser. Characters never transit.",
    className: "",
  },
  {
    icon: Cpu,
    title: "Polars feature engine",
    body: "Vectorized microsecond timing and cursor jitter math without GIL contention.",
    className: "",
  },
  {
    icon: ShieldAlert,
    title: "Bot & imposter defense",
    body: "Flags paste velocity, robotic flight times, excessive tab switching, and synthetic pointer paths.",
    className: "md:col-span-2",
  },
  {
    icon: Gauge,
    title: "Live risk HUD",
    body: "Applicants see a continuous risk index while analysts get session forensics in real time.",
    className: "",
  },
  {
    icon: Lock,
    title: "Production-ready stack",
    body: "Docker, Prometheus metrics, Grafana panels, and Kubernetes manifests ship with the repo.",
    className: "",
  },
];

export function FeatureBento() {
  return (
    <SectionReveal as="section" className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-400">
              Capabilities
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-50">
              Built for production fraud ops
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            Every surface is designed around continuous, unobtrusive scoring — not CAPTCHA friction.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f, i) => (
            <SectionReveal key={f.title} delay={i * 0.05} className={f.className}>
              <GlassCard hover className="h-full p-5 sm:p-6">
                <div className="mb-4 inline-flex rounded-xl border border-slate-700/50 bg-slate-900/80 p-2.5 text-indigo-400 shadow-inner">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.body}</p>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

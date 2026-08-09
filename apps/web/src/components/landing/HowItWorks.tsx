"use client";

import { Activity, BrainCircuit, Radio } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { GlassCard } from "@/components/ui/GlassCard";

const steps = [
  {
    step: "01",
    icon: Activity,
    title: "Capture micro-behavior",
    body: "Keystroke hold/flight times, pointer curvature, paste events, and focus transitions — buffered every 250ms with zero character content.",
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    step: "02",
    icon: BrainCircuit,
    title: "Vectorize with Polars",
    body: "42 temporal-spatial features are extracted on the server in real time — dwell stats, velocity percentiles, jitter ratios, and form interaction signals.",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  {
    step: "03",
    icon: Radio,
    title: "Score via ONNX C++",
    body: "LightGBM trees run in native ONNX Runtime under a sub-millisecond SLA. Risk index and anomaly triggers stream back over WebSocket instantly.",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
];

export function HowItWorks() {
  return (
    <SectionReveal as="section" className="relative z-10 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-400">
            Pipeline
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            From keystroke to risk score
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            A streaming loop designed for frictionless applicants and ruthless fraud detection.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <SectionReveal key={s.step} delay={i * 0.08}>
              <GlassCard hover className="relative h-full p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className={`inline-flex rounded-xl border p-2.5 ${s.accent}`}
                  >
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-slate-600">{s.step}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-100">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.body}</p>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

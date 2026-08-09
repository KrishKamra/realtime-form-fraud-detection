"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { GlassCard } from "@/components/ui/GlassCard";

export function CTASection() {
  return (
    <SectionReveal as="section" className="relative z-10 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <GlassCard
          shine
          intensity="strong"
          className="relative overflow-hidden px-8 py-12 text-center sm:px-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-[80px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-600/15 blur-[70px]"
          />

          <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-400">
            Ready when you are
          </p>
          <h2 className="relative mt-3 text-balance text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Run a live biometric assessment in seconds
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-slate-400">
            Open the applicant form to stream telemetry, or jump into the operations
            console to watch sessions as they score.
          </p>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Start applicant flow
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Open operations center
            </Link>
          </div>
        </GlassCard>
      </div>
    </SectionReveal>
  );
}

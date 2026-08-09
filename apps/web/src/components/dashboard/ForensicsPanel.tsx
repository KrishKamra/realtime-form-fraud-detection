"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Terminal, User } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { RiskSparkline } from "@/components/ui/RiskSparkline";
import type { LiveSessionEntry } from "./SessionTable";
import { cn } from "@/lib/utils";

type ForensicsPanelProps = {
  session: LiveSessionEntry | null;
  riskHistory?: number[];
};

export function ForensicsPanel({ session, riskHistory }: ForensicsPanelProps) {
  return (
    <GlassCard
      intensity="strong"
      className="flex flex-col justify-between p-5 sm:p-6 lg:col-span-4"
    >
      <AnimatePresence mode="wait">
        {session ? (
          <motion.div
            key={session.session_id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Terminal className="h-4 w-4 text-indigo-400" />
                Session Forensics
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                <Clock className="h-3 w-3" />
                {session.last_updated || "Live"}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="truncate text-xs font-medium text-slate-100">
                  {session.applicant_name || "Anonymous Applicant"}
                </span>
                <span className="truncate font-mono text-[10px] text-slate-500">
                  {session.session_id}
                </span>
              </div>
            </div>

            <div className="flex justify-center py-1">
              <RiskGauge
                score={session.risk_score}
                size={148}
                strokeWidth={11}
                label="Neural Risk"
              />
            </div>

            {(riskHistory?.length ?? 0) >= 2 && (
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Risk trajectory
                  </span>
                  <span className="font-mono text-[10px] text-slate-600">
                    last {riskHistory!.length} samples
                  </span>
                </div>
                <RiskSparkline
                  points={riskHistory!}
                  width={280}
                  height={40}
                  strokeWidth={1.75}
                  className="w-full max-w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-300">
                Live Execution Metadata
              </span>
              <div className="space-y-2 font-mono text-xs">
                <MetaRow
                  label="Buffered Frames"
                  value={`${session.event_count ?? 0} events`}
                />
                <MetaRow
                  label="Inference Latency"
                  value={`${session.latency_ms} ms`}
                  valueClass="text-indigo-400"
                />
                <MetaRow
                  label="Classification"
                  value={
                    session.is_anomalous ? "ANOMALOUS_IMPOSTER" : "NORMAL_HUMAN"
                  }
                  valueClass={
                    session.is_anomalous
                      ? "text-rose-400 font-semibold"
                      : "text-emerald-400 font-semibold"
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-300">
                Triggered Anomaly Rules
              </span>
              <div className="flex min-h-[40px] flex-wrap gap-1.5">
                {session.triggers.length > 0 ? (
                  session.triggers.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1 font-mono text-[10px] text-rose-300"
                    >
                      ⚠ {t}
                    </span>
                  ))
                ) : (
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-400">
                    ✓ NO_ANOMALIES_DETECTED
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center font-mono text-xs text-slate-500">
            <Terminal className="mb-3 h-8 w-8 text-slate-700" />
            Select a session from the live stream to inspect forensics
          </div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function MetaRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between rounded border border-slate-800/60 bg-slate-950/60 px-3 py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className={cn("text-slate-200", valueClass)}>{value}</span>
    </div>
  );
}

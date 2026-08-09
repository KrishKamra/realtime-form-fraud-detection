"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Cpu, RefreshCw, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RiskSparkline } from "@/components/ui/RiskSparkline";
import { cn, riskColorClass } from "@/lib/utils";

export type LiveSessionEntry = {
  session_id: string;
  applicant_name?: string;
  risk_score: number;
  is_anomalous: boolean;
  latency_ms: number;
  triggers: string[];
  event_count?: number;
  last_updated?: string;
};

type SessionTableProps = {
  sessions: LiveSessionEntry[];
  filteredSessions: LiveSessionEntry[];
  selectedId: string | null;
  onSelect: (session: LiveSessionEntry) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  filterRisk: "ALL" | "HIGH" | "SAFE";
  onFilter: (f: "ALL" | "HIGH" | "SAFE") => void;
  /** Per-session chronological risk scores for sparklines */
  riskHistory?: Record<string, number[]>;
};

export function SessionTable({
  sessions,
  filteredSessions,
  selectedId,
  onSelect,
  searchQuery,
  onSearch,
  filterRisk,
  onFilter,
  riskHistory = {},
}: SessionTableProps) {
  return (
    <GlassCard intensity="strong" className="flex flex-col p-5 sm:p-6 lg:col-span-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Live Telemetry Stream
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search session or name..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              data-lenis-prevent
              className="w-48 rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 sm:w-52"
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5 font-mono text-[11px]">
            {(["ALL", "HIGH", "SAFE"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFilter(f)}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all",
                  filterRisk === f
                    ? f === "HIGH"
                      ? "bg-rose-500/20 font-semibold text-rose-300"
                      : f === "SAFE"
                        ? "bg-emerald-500/20 font-semibold text-emerald-300"
                        : "bg-slate-800 font-semibold text-slate-100"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="custom-scroll overflow-x-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 font-mono text-xs text-slate-500">
            <Cpu className="h-8 w-8 animate-pulse text-slate-700" />
            <p>No active applicant sessions connected.</p>
            <p className="text-[11px] text-slate-600">
              Open{" "}
              <span className="font-bold text-indigo-400">/apply</span> in a new
              window to stream live biometrics.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 font-mono text-[11px] uppercase text-slate-500">
                <th className="px-3 py-3 font-medium">Session ID</th>
                <th className="px-3 py-3 font-medium">Applicant</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Trend</th>
                <th className="px-3 py-3 font-medium">Triggers</th>
                <th className="px-3 py-3 font-medium">Events</th>
                <th className="px-3 py-3 font-medium">Latency</th>
                <th className="px-3 py-3 text-right font-medium">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              <AnimatePresence initial={false}>
                {filteredSessions.map((session) => {
                  const isHigh = session.risk_score > 65;
                  const isSelected = selectedId === session.session_id;

                  return (
                    <motion.tr
                      key={session.session_id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => onSelect(session)}
                      className={cn(
                        "cursor-pointer transition-colors duration-150 hover:bg-slate-800/35",
                        isSelected && "bg-slate-800/55",
                      )}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="h-4 w-0.5 shrink-0 rounded-full bg-indigo-500" />
                          )}
                          <span className="font-mono text-slate-300">
                            {session.session_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-200">
                        {session.applicant_name || "Anonymous"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 font-mono text-xs font-bold border",
                            isHigh
                              ? "border-rose-500/30 bg-rose-500/15 text-rose-400"
                              : "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
                          )}
                        >
                          {session.risk_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <RiskSparkline
                          points={
                            riskHistory[session.session_id] ?? [
                              session.risk_score,
                            ]
                          }
                          width={76}
                          height={22}
                        />
                      </td>
                      <td className="px-3 py-3">
                        {session.triggers.length > 0 ? (
                          <span className={cn("font-mono text-[11px]", riskColorClass(80))}>
                            ⚠ {session.triggers[0]}
                            {session.triggers.length > 1 &&
                              ` (+${session.triggers.length - 1})`}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-slate-500">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-400">
                        {session.event_count ?? 0}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-400">
                        {session.latency_ms} ms
                      </td>
                      <td className="px-3 py-3 text-right">
                        <ChevronRight className="inline-block h-4 w-4 text-slate-500" />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </GlassCard>
  );
}

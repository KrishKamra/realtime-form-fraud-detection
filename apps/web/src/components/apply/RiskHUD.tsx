"use client";

import { motion } from "framer-motion";
import { Activity, User, Wifi, WifiOff } from "lucide-react";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { formatMs } from "@/lib/utils";
import type { RiskScoreResponse } from "@/types/telemetry";

type RiskHUDProps = {
  sessionId: string;
  applicantName: string;
  riskData: RiskScoreResponse | null;
  isConnected: boolean;
};

export function RiskHUD({
  sessionId,
  applicantName,
  riskData,
  isConnected,
}: RiskHUDProps) {
  const riskScore = riskData?.risk_score ?? 5.0;
  const triggers = riskData?.triggers ?? [];

  return (
    <GlassCard intensity="strong" className="flex h-full flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Activity className="h-4 w-4 animate-pulse text-indigo-400" />
            Live Risk Scoring HUD
          </span>
          <span className="max-w-[45%] truncate font-mono text-[10px] text-slate-500">
            {sessionId || "Initializing..."}
          </span>
        </div>

        {/* Connection + applicant */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Tracked Applicant
              </span>
              <span className="truncate text-xs font-medium text-slate-200">
                {applicantName.trim() || "Anonymous Applicant"}
              </span>
            </div>
          </div>
          <Badge tone={isConnected ? "success" : "danger"} className="shrink-0 font-mono">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" /> WS Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" /> Connecting
              </>
            )}
          </Badge>
        </div>

        {/* Telemetry pulse strip — fixed height so bar scale never reflows the card */}
        <div className="mt-4 flex h-7 items-center gap-1.5">
          <div
            className="flex h-7 items-end gap-1"
            aria-hidden
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                animate={
                  isConnected
                    ? {
                        scaleY: [0.28, 0.55 + (i % 5) * 0.09, 0.28],
                        opacity: [0.35, 1, 0.35],
                      }
                    : { scaleY: 0.28, opacity: 0.2 }
                }
                transition={{
                  duration: 0.9 + (i % 4) * 0.12,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: "easeInOut",
                }}
                className={`inline-block w-1 origin-bottom rounded-full ${
                  riskScore > 65
                    ? "bg-rose-400"
                    : riskScore > 35
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }`}
                style={{ height: 26, willChange: "transform, opacity" }}
              />
            ))}
          </div>
          <span className="ml-2 shrink-0 font-mono text-[10px] leading-none text-slate-500">
            {riskData?.event_count != null
              ? `${riskData.event_count} frames`
              : riskData
                ? "live stream"
                : isConnected
                  ? "awaiting telemetry"
                  : "connecting…"}
          </span>
        </div>

        <div className="my-6 flex justify-center">
          <RiskGauge score={riskScore} size={188} strokeWidth={13} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-400">
            Triggered Anomaly Flags
          </span>
          <div className="flex min-h-[48px] flex-wrap gap-1.5">
            {triggers.length > 0 ? (
              triggers.map((trigger) => (
                <motion.span
                  key={trigger}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-[10px] font-medium text-rose-300"
                >
                  ⚠ {trigger}
                </motion.span>
              ))
            ) : (
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
                ✓ BEHAVIORAL_PATTERN_NORMAL
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4 font-mono text-xs text-slate-400">
        <span>Inference latency</span>
        <span className="font-semibold text-indigo-400">
          {formatMs(riskData?.latency_ms)}
        </span>
      </div>
    </GlassCard>
  );
}

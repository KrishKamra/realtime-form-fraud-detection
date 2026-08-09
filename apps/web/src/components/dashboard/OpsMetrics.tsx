"use client";

import { ShieldAlert, ShieldCheck, Users, Zap } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

type OpsMetricsProps = {
  activeCount: number;
  highRiskCount: number;
  avgLatency: string;
  passRate: string;
};

export function OpsMetrics({
  activeCount,
  highRiskCount,
  avgLatency,
  passRate,
}: OpsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Active Applicants"
        value={activeCount}
        hint="Live WebSocket buffer"
        icon={<Users className="h-5 w-5" />}
        tone="neutral"
      />
      <MetricCard
        label="Flagged Imposters"
        value={highRiskCount}
        hint="Risk Index > 65.0"
        icon={<ShieldAlert className="h-5 w-5" />}
        tone="danger"
      />
      <MetricCard
        label="Inference Latency"
        value={`${avgLatency} ms`}
        hint="Sub-10ms target"
        icon={<Zap className="h-5 w-5" />}
        tone="brand"
      />
      <MetricCard
        label="Auto-Clean Pass Rate"
        value={`${passRate}%`}
        hint="Frictionless onboarding"
        icon={<ShieldCheck className="h-5 w-5" />}
        tone="success"
      />
    </div>
  );
}

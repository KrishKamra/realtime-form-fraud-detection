"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { OpsMetrics } from "@/components/dashboard/OpsMetrics";
import {
  SessionTable,
  type LiveSessionEntry,
} from "@/components/dashboard/SessionTable";
import { ForensicsPanel } from "@/components/dashboard/ForensicsPanel";
import { Badge } from "@/components/ui/Badge";
import { getApiBaseUrl } from "@/lib/api";

export default function FraudAnalystDashboard() {
  const [sessions, setSessions] = useState<LiveSessionEntry[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<LiveSessionEntry | null>(null);
  const [filterRisk, setFilterRisk] = useState<"ALL" | "HIGH" | "SAFE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [clock, setClock] = useState("");
  const [apiOk, setApiOk] = useState(true);
  /** Rolling risk history per session for live sparklines (oldest → newest) */
  const [riskHistory, setRiskHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/sessions`);
        if (res.ok) {
          const data: LiveSessionEntry[] = await res.json();
          setSessions(data);
          setApiOk(true);

          // Append latest risk samples for sparkline trends
          setRiskHistory((prev) => {
            const activeIds = new Set(data.map((s) => s.session_id));
            const next: Record<string, number[]> = {};

            for (const s of data) {
              const hist = prev[s.session_id] ?? [];
              next[s.session_id] = [...hist, s.risk_score].slice(-28);
            }

            // Drop histories for sessions that disappeared
            for (const id of Object.keys(prev)) {
              if (!activeIds.has(id)) continue;
            }

            return next;
          });

          setSelectedSession((prev) => {
            if (!prev && data.length > 0) return data[0];
            if (prev) {
              const updated = data.find((s) => s.session_id === prev.session_id);
              return updated || prev;
            }
            return null;
          });
        } else {
          setApiOk(false);
        }
      } catch {
        setApiOk(false);
      }
    };

    fetchLiveSessions();
    const interval = setInterval(fetchLiveSessions, 1500);
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.session_id.toLowerCase().includes(query) ||
      (s.applicant_name && s.applicant_name.toLowerCase().includes(query));

    if (filterRisk === "HIGH") return matchesSearch && s.risk_score > 65.0;
    if (filterRisk === "SAFE") return matchesSearch && s.risk_score <= 65.0;
    return matchesSearch;
  });

  const highRiskCount = sessions.filter((s) => s.risk_score > 65.0).length;
  const avgLatency =
    sessions.length > 0
      ? (
          sessions.reduce((acc, curr) => acc + curr.latency_ms, 0) /
          sessions.length
        ).toFixed(1)
      : "0.0";
  const passRate =
    sessions.length > 0
      ? (
          ((sessions.length - highRiskCount) / sessions.length) *
          100
        ).toFixed(0)
      : "100";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground variant="ops" />
      <Navbar compact />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Ops header */}
        <header className="flex flex-col gap-4 border-b border-slate-800/70 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                <Activity className="h-5 w-5 animate-pulse" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                SentryForm Operations
              </h1>
              <Badge tone="brand" className="font-mono text-[10px]">
                v1.0-ONNX
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Real-time behavioral biometrics & neural telemetry feed
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500">{clock}</span>
            <Badge tone={apiOk ? "success" : "danger"} dot pulse={apiOk}>
              ONNX Engine: {apiOk ? "Connected" : "Unreachable"}
            </Badge>
          </div>
        </header>

        <OpsMetrics
          activeCount={sessions.length}
          highRiskCount={highRiskCount}
          avgLatency={avgLatency}
          passRate={passRate}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <SessionTable
            sessions={sessions}
            filteredSessions={filteredSessions}
            selectedId={selectedSession?.session_id ?? null}
            onSelect={setSelectedSession}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            filterRisk={filterRisk}
            onFilter={setFilterRisk}
            riskHistory={riskHistory}
          />
          <ForensicsPanel
            session={selectedSession}
            riskHistory={
              selectedSession
                ? riskHistory[selectedSession.session_id]
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Users,
  Search,
  RefreshCw,
  ChevronRight,
  Terminal,
  User,
  Clock,
  Cpu,
} from "lucide-react";

interface LiveSessionEntry {
  session_id: string;
  applicant_name?: string;
  risk_score: number;
  is_anomalous: boolean;
  latency_ms: number;
  triggers: string[];
  event_count?: number;
  last_updated?: string;
}

export default function FraudAnalystDashboard() {
  const [sessions, setSessions] = useState<LiveSessionEntry[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveSessionEntry | null>(null);
  const [filterRisk, setFilterRisk] = useState<"ALL" | "HIGH" | "SAFE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Poll FastAPI active session endpoint every 1.5 seconds
  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/sessions");
        if (res.ok) {
          const data: LiveSessionEntry[] = await res.json();
          setSessions(data);

          // Auto-select or maintain current selected session
          setSelectedSession((prev) => {
            if (!prev && data.length > 0) return data[0];
            if (prev) {
              const updated = data.find((s) => s.session_id === prev.session_id);
              return updated || prev;
            }
            return null;
          });
        }
      } catch (err) {
        console.error("Failed to fetch live session feed from API:", err);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                SentryForm Operations
              </h1>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono text-[10px] rounded-full font-medium">
                v1.0-ONNX
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-Time Behavioral Biometrics & Neural Telemetry Feed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ONNX Engine: Connected</span>
            </div>
          </div>
        </header>

        {/* Operational Metrics Cards (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Active Applicants
              </p>
              <p className="font-mono text-3xl font-bold text-slate-100 mt-1">
                {sessions.length}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Live WebSocket buffer
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400 border border-slate-700/50">
              <Users className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Flagged Imposters
              </p>
              <p className="font-mono text-3xl font-bold text-rose-400 mt-1">
                {highRiskCount}
              </p>
              <p className="text-[10px] text-rose-400/70 mt-1">
                Risk Index &gt; 65.0
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Inference Latency
              </p>
              <p className="font-mono text-3xl font-bold text-indigo-400 mt-1">
                {avgLatency} ms
              </p>
              <p className="text-[10px] text-indigo-400/70 mt-1">
                Sub-10ms target met
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Auto-Clean Pass Rate
              </p>
              <p className="font-mono text-3xl font-bold text-emerald-400 mt-1">
                {sessions.length > 0
                  ? (
                      ((sessions.length - highRiskCount) / sessions.length) *
                      100
                    ).toFixed(0)
                  : "100"}
                %
              </p>
              <p className="text-[10px] text-emerald-400/70 mt-1">
                Frictionless onboarding
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Main Section: Stream Table (8 Cols) + Forensics Drawer (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Sessions Stream Table */}
          <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Live Telemetry Stream
                </h2>
              </div>

              {/* Controls: Search and Filter Tabs */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search session or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50 w-52 transition-all"
                  />
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
                  <button
                    onClick={() => setFilterRisk("ALL")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      filterRisk === "ALL"
                        ? "bg-slate-800 text-slate-100 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setFilterRisk("HIGH")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      filterRisk === "HIGH"
                        ? "bg-rose-500/20 text-rose-300 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    HIGH
                  </button>
                  <button
                    onClick={() => setFilterRisk("SAFE")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      filterRisk === "SAFE"
                        ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SAFE
                  </button>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              {sessions.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
                  <Cpu className="w-8 h-8 text-slate-700 animate-pulse" />
                  <p>No active applicant sessions connected.</p>
                  <p className="text-[11px] text-slate-600">
                    Open <span className="text-indigo-400 font-bold">/apply</span> in a new window to stream live biometrics!
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400">
                      <th className="py-3 px-3">Session ID</th>
                      <th className="py-3 px-3">Applicant Name</th>
                      <th className="py-3 px-3">Risk Index</th>
                      <th className="py-3 px-3">Triggers</th>
                      <th className="py-3 px-3">Events</th>
                      <th className="py-3 px-3">Latency</th>
                      <th className="py-3 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    <AnimatePresence>
                      {filteredSessions.map((session) => {
                        const isHigh = session.risk_score > 65.0;
                        const isSelected =
                          selectedSession?.session_id === session.session_id;

                        return (
                          <motion.tr
                            key={session.session_id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSession(session)}
                            className={`cursor-pointer transition-all duration-150 hover:bg-slate-800/40 ${
                              isSelected
                                ? "bg-slate-800/60 border-l-2 border-indigo-500"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-3 font-mono text-slate-300">
                              {session.session_id}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-200">
                              {session.applicant_name || "Anonymous Applicant"}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                  isHigh
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                }`}
                              >
                                {session.risk_score.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {session.triggers.length > 0 ? (
                                <span className="text-rose-400 font-mono text-[11px]">
                                  ⚠️ {session.triggers[0]}
                                  {session.triggers.length > 1 &&
                                    ` (+${session.triggers.length - 1})`}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-mono text-[11px]">
                                  Clean
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">
                              {session.event_count ?? 0} frames
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">
                              {session.latency_ms} ms
                            </td>
                            <td className="py-3 px-3 text-right">
                              <ChevronRight className="w-4 h-4 text-slate-500 inline-block" />
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Micro-Telemetry Forensics Drawer */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {selectedSession ? (
                <motion.div
                  key={selectedSession.session_id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" /> Session
                      Forensics
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedSession.last_updated || "Live"}
                    </span>
                  </div>

                  {/* Applicant Details */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-100">
                        {selectedSession.applicant_name || "Anonymous Applicant"}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {selectedSession.session_id}
                      </span>
                    </div>
                  </div>

                  {/* Micro-Risk Indicator Bar */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">
                        Neural Risk Score
                      </span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          selectedSession.risk_score > 65.0
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {selectedSession.risk_score.toFixed(1)} / 100.0
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedSession.risk_score}%` }}
                        transition={{ duration: 0.4 }}
                        className={`h-full ${
                          selectedSession.risk_score > 65.0
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Real-time Session Pipeline Metadata */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-300">
                      Live Execution Metadata
                    </span>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between py-1.5 px-3 bg-slate-950/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Buffered Frames:</span>
                        <span className="text-slate-200">
                          {selectedSession.event_count ?? 0} events
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3 bg-slate-950/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Inference Latency:</span>
                        <span className="text-indigo-400">
                          {selectedSession.latency_ms} ms
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3 bg-slate-950/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Classification:</span>
                        <span
                          className={
                            selectedSession.is_anomalous
                              ? "text-rose-400 font-semibold"
                              : "text-emerald-400 font-semibold"
                          }
                        >
                          {selectedSession.is_anomalous
                            ? "ANOMALOUS_IMPOSTER"
                            : "NORMAL_HUMAN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Anomaly Badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-300">
                      Triggered Anomaly Rules
                    </span>
                    <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                      {selectedSession.triggers.length > 0 ? (
                        selectedSession.triggers.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[10px] rounded"
                          >
                            ⚠️ {t}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded">
                          ✓ NO_ANOMALIES_DETECTED
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">
                  Select an active session from the live stream table to view forensics
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
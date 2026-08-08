"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBehavioralTracker } from "@/hooks/useBehavioralTracker";
import { TrackedInput } from "@/components/apply/TrackedInput";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Wifi,
  WifiOff,
  User,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function LoanApplicationPage() {
  // Fix Hydration Mismatch: Initialize sessionId on client-side mount only
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const generatedId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    setSessionId(generatedId);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    ssn: "",
    annualIncome: "",
    loanAmount: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pass applicant's name dynamically into behavioral tracker
  const { recordEvent, riskData, isConnected } = useBehavioralTracker(
    sessionId,
    formData.fullName
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const riskScore = riskData?.risk_score ?? 5.0;
  const isHighRisk = riskScore > 65.0;
  const isMediumRisk = riskScore > 35.0 && riskScore <= 65.0;

  // Ambient glow color based on ML risk evaluation
  const glowColor = isHighRisk
    ? "bg-rose-600/20"
    : isMediumRisk
    ? "bg-amber-600/15"
    : "bg-indigo-600/15";

  // SVG Gauge calculations
  const CIRCUMFERENCE = 440;
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * riskScore) / 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic Ambient Glow */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] ${glowColor} blur-[140px] pointer-events-none rounded-full transition-colors duration-700`}
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
        {/* Left Column: Loan Application Form (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl hover:border-slate-700/60 transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <Lock className="w-4 h-4" />
                </span>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Apex Commercial Credit
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Instant Qualification Assessment with Real-Time Behavioral Security
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 rounded-full border border-slate-800 text-xs font-mono">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">WS Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-slate-500">Connecting</span>
                </>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                <TrackedInput
                  label="Full Legal Name"
                  fieldId="full_name"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  recordEvent={recordEvent}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />

                <TrackedInput
                  label="Social Security Number (SSN)"
                  fieldId="ssn"
                  placeholder="XXX-XX-XXXX"
                  type="password"
                  value={formData.ssn}
                  recordEvent={recordEvent}
                  onChange={(e) =>
                    setFormData({ ...formData, ssn: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TrackedInput
                    label="Annual Income ($)"
                    fieldId="annual_income"
                    placeholder="125,000"
                    isNumericOnly={true}
                    value={formData.annualIncome}
                    recordEvent={recordEvent}
                    onChange={(e) =>
                      setFormData({ ...formData, annualIncome: e.target.value })
                    }
                    required
                  />

                  <TrackedInput
                    label="Requested Loan ($)"
                    fieldId="loan_amount"
                    placeholder="25,000"
                    isNumericOnly={true}
                    value={formData.loanAmount}
                    recordEvent={recordEvent}
                    onChange={(e) =>
                      setFormData({ ...formData, loanAmount: e.target.value })
                    }
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="mt-4 w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Submit Instant Application</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center gap-4"
              >
                {isHighRisk ? (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 shadow-lg shadow-rose-500/10">
                    <ShieldAlert className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                )}
                <h2 className="text-xl font-bold">
                  {isHighRisk
                    ? "Identity Verification Required"
                    : "Loan Pre-Approved!"}
                </h2>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  {isHighRisk
                    ? "Our behavioral security engine detected input interaction anomalies. Please upload a government ID to finalize evaluation."
                    : "Your behavioral profile confirmed genuine user intent in real time without friction. Funds disburse within 24 hours."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Column: Real-Time Telemetry HUD Overlay (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col gap-4"
        >
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full hover:border-slate-700/60 transition-all duration-300">
            <div>
              {/* HUD Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" /> Live
                  Risk Scoring HUD
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {sessionId || "Initializing..."}
                </span>
              </div>

              {/* Applicant Identity Card */}
              <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                    Tracked Applicant
                  </span>
                  <span className="text-xs font-medium text-slate-200">
                    {formData.fullName.trim() || "Anonymous Applicant"}
                  </span>
                </div>
              </div>

              {/* Animated Risk Gauge Display */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-44 h-44 -rotate-90 transform">
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-800/80"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={CIRCUMFERENCE}
                      initial={{ strokeDashoffset: CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: strokeDashoffset }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      strokeLinecap="round"
                      className={`transition-colors duration-500 ${
                        isHighRisk
                          ? "text-rose-500"
                          : isMediumRisk
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <motion.span
                      key={riskScore.toFixed(0)}
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-mono text-4xl font-extrabold tracking-tight text-slate-100"
                    >
                      {riskScore.toFixed(0)}
                    </motion.span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                      Risk Index
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Security Trigger Badges */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-400">
                  Triggered Anomaly Flags:
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                  {riskData?.triggers && riskData.triggers.length > 0 ? (
                    riskData.triggers.map((trigger) => (
                      <motion.span
                        key={trigger}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[10px] rounded-md font-medium"
                      >
                        ⚠️ {trigger}
                      </motion.span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded-md">
                      ✓ BEHAVIORAL_PATTERN_NORMAL
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-10ms Inference Latency Readout */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>FastAPI Inference Latency:</span>
              <span className="text-indigo-400 font-semibold">
                {riskData?.latency_ms ? `${riskData.latency_ms} ms` : "< 1.0 ms"}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
"use client";

import React, { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useBehavioralTracker } from "@/hooks/useBehavioralTracker";
import { TrackedInput } from "@/components/apply/TrackedInput";
import { RiskHUD } from "@/components/apply/RiskHUD";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { riskTier } from "@/lib/utils";

export default function LoanApplicationPage() {
  // useId is stable across SSR + hydration (unlike Math.random / Date.now)
  const reactId = useId();
  const sessionId = useMemo(
    () => `sess_${reactId.replace(/:/g, "")}`,
    [reactId],
  );

  const [formData, setFormData] = useState({
    fullName: "",
    ssn: "",
    annualIncome: "",
    loanAmount: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const { recordEvent, riskData, isConnected } = useBehavioralTracker(
    sessionId,
    formData.fullName,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const riskScore = riskData?.risk_score ?? 5.0;
  const tier = riskTier(riskScore);
  const ambientVariant =
    tier === "high"
      ? "risk-high"
      : tier === "medium"
        ? "risk-medium"
        : "risk-low";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground variant={ambientVariant} />
      <Navbar compact />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Form column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <GlassCard intensity="strong" className="p-6 sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <h1 className="text-xl font-bold tracking-tight text-slate-100">
                      Apex Commercial Credit
                    </h1>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Instant qualification with continuous behavioral security
                  </p>
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
                    data-lenis-prevent
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TrackedInput
                        label="Annual Income ($)"
                        fieldId="annual_income"
                        placeholder="125,000"
                        isNumericOnly
                        value={formData.annualIncome}
                        recordEvent={recordEvent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            annualIncome: e.target.value,
                          })
                        }
                        required
                      />

                      <TrackedInput
                        label="Requested Loan ($)"
                        fieldId="loan_amount"
                        placeholder="25,000"
                        isNumericOnly
                        value={formData.loanAmount}
                        recordEvent={recordEvent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loanAmount: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                      type="submit"
                      className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 outline-none hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 active:bg-indigo-700"
                    >
                      <span>Submit Instant Application</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.button>

                    <p className="text-center text-[11px] text-slate-600">
                      Typing streams zero-PII telemetry to the ONNX scoring engine.
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="submitted"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-14 text-center"
                  >
                    {tier === "high" ? (
                      <div className="rounded-full border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 shadow-lg shadow-rose-500/10">
                        <ShieldAlert className="h-12 w-12" />
                      </div>
                    ) : (
                      <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
                        <ShieldCheck className="h-12 w-12" />
                      </div>
                    )}
                    <h2 className="text-xl font-bold">
                      {tier === "high"
                        ? "Identity Verification Required"
                        : "Loan Pre-Approved!"}
                    </h2>
                    <p className="max-w-md text-xs leading-relaxed text-slate-400">
                      {tier === "high"
                        ? "Our behavioral security engine detected input interaction anomalies. Please upload a government ID to finalize evaluation."
                        : "Your behavioral profile confirmed genuine user intent in real time without friction. Funds disburse within 24 hours."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>

          {/* HUD column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-20">
              <RiskHUD
                sessionId={sessionId}
                applicantName={formData.fullName}
                riskData={riskData}
                isConnected={isConnected}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

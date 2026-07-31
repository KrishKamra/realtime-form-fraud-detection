"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ShieldAlert,
  Activity,
  ArrowRight,
  Zap,
  Lock,
  Cpu,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-indigo-600/15 blur-[160px] pointer-events-none rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full"
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto p-6 flex items-center justify-between relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5"
        >
          <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shadow-lg shadow-indigo-500/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            SentryForm
          </span>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono text-[10px] rounded-full font-medium tracking-wide">
            ONNX Engine v1.0
          </span>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 text-xs font-medium"
        >
          <Link
            href="/apply"
            className="text-slate-400 hover:text-slate-100 transition-colors py-1 px-3 rounded-lg hover:bg-slate-900/50"
          >
            Applicant Flow
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl transition-all duration-200 shadow-md hover:shadow-indigo-500/5"
          >
            Analyst Console
          </Link>
        </motion.nav>
      </header>

      {/* Hero Content Section */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 sm:py-16 flex flex-col items-center text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-mono text-slate-300 mb-8 backdrop-blur-md shadow-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sub-10ms Neural Behavioral Biometrics</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15] max-w-3xl"
          >
            Detect Fraud Before Form Submission.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Without User Friction.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed"
          >
            SentryForm streams micro-behavioral vectors—keystroke timing,
            focus flips, and cursor trajectory jitter—over WebSockets directly into
            a vectorized C++ ONNX LightGBM inference model.
          </motion.p>

          {/* Primary Call-to-Action Grid (2 Portal Cards) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mt-12"
          >
            {/* Portal Card 1: Applicant Flow */}
            <Link href="/apply" className="group relative block text-left">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="h-full bg-slate-900/60 border border-slate-800/80 group-hover:border-indigo-500/50 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    Loan Application Flow
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Test the applicant experience. Type into the form to trigger live behavioral event tracking and instant scoring.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold">
                  <span>Launch Form</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </motion.div>
            </Link>

            {/* Portal Card 2: Analyst Command Center */}
            <Link href="/dashboard" className="group relative block text-left">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="h-full bg-slate-900/60 border border-slate-800/80 group-hover:border-emerald-500/50 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:shadow-emerald-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Fraud Operations Center
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Monitor live session feeds, review neural risk index metrics, and inspect triggered behavioral anomaly flags.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Feature Highlights Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-16 pt-12 border-t border-slate-800/80"
          >
            <div className="flex items-start gap-3 text-left p-3 rounded-xl hover:bg-slate-900/40 transition-colors">
              <div className="p-2.5 bg-slate-900 rounded-xl text-indigo-400 border border-slate-800 shadow-inner">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Sub-10ms Inference</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  LightGBM binary executed via native ONNX C++ runtime bindings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3 rounded-xl hover:bg-slate-900/40 transition-colors">
              <div className="p-2.5 bg-slate-900 rounded-xl text-indigo-400 border border-slate-800 shadow-inner">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Polars Feature Pipeline</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Vectorized microsecond timing deltas and cursor jitter math.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3 rounded-xl hover:bg-slate-900/40 transition-colors">
              <div className="p-2.5 bg-slate-900 rounded-xl text-indigo-400 border border-slate-800 shadow-inner">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Bot & Imposter Defense</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Flags paste velocity, focus switches, and automated flight speeds.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto p-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 relative z-10">
        <p>© 2026 SentryForm. Production-Grade Behavioral Security Architecture.</p>
        <div className="flex items-center gap-2 mt-2 sm:mt-0 font-mono text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>WebSocket Pipeline Active</span>
        </div>
      </footer>
    </div>
  );
}
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Lock,
  Sparkles,
} from "lucide-react";
import { NeuralField } from "./NeuralField";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/components/ui/SectionReveal";

export function Hero() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
      <NeuralField className="pointer-events-none absolute inset-0 opacity-80" />

      {/* Depth orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center"
      >
        <motion.div variants={staggerItem}>
          <Badge
            tone="mono"
            className="mb-8 gap-2 px-3.5 py-1.5 text-xs text-slate-300 shadow-xl backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Sub-10ms Neural Behavioral Biometrics
          </Badge>
        </motion.div>

        <motion.h1
          variants={staggerItem}
          className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl"
        >
          Detect Fraud Before Form Submission.{" "}
          <span className="gradient-text">Without User Friction.</span>
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-base"
        >
          SentryForm streams micro-behavioral vectors—keystroke timing, focus flips,
          and cursor trajectory jitter—over WebSockets into a vectorized C++ ONNX
          LightGBM inference model.
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <PortalCard
            href="/apply"
            accent="indigo"
            icon={<Lock className="h-5 w-5" />}
            title="Loan Application Flow"
            description="Experience the applicant side. Type to stream live behavioral events and watch risk score in real time."
            cta="Launch Form"
          />
          <PortalCard
            href="/dashboard"
            accent="emerald"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Fraud Operations Center"
            description="Monitor live sessions, neural risk index metrics, and anomaly flags as they fire."
            cta="Open Dashboard"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function PortalCard({
  href,
  accent,
  icon,
  title,
  description,
  cta,
}: {
  href: string;
  accent: "indigo" | "emerald";
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  const isIndigo = accent === "indigo";

  return (
    <Link href={href} className="group relative block text-left">
      <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        className={`shine-border glass h-full rounded-2xl p-6 shadow-xl transition-all duration-300 ${
          isIndigo
            ? "group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10"
            : "group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/10"
        } group-hover:shadow-2xl`}
      >
        <div
          className={`mb-4 w-fit rounded-xl border p-3 transition-colors ${
            isIndigo
              ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
          }`}
        >
          {icon}
        </div>
        <h2
          className={`text-lg font-bold text-slate-100 transition-colors ${
            isIndigo ? "group-hover:text-indigo-300" : "group-hover:text-emerald-300"
          }`}
        >
          {title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{description}</p>
        <div
          className={`mt-6 flex items-center gap-2 text-xs font-semibold font-mono ${
            isIndigo ? "text-indigo-400" : "text-emerald-400"
          }`}
        >
          <span>{cta}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1.5" />
        </div>
      </motion.div>
    </Link>
  );
}

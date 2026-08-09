"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const links = [
  { href: "/apply", label: "Applicant Flow" },
  { href: "/dashboard", label: "Analyst Console" },
];

type NavbarProps = {
  compact?: boolean;
};

export function Navbar({ compact = false }: NavbarProps) {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-slate-800/40 bg-slate-950/70 backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6",
          compact ? "py-3" : "py-4",
        )}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-2 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-colors group-hover:bg-indigo-500/15">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-100 sm:text-lg">
            SentryForm
          </span>
          <Badge tone="brand" className="hidden font-mono text-[10px] sm:inline-flex">
            ONNX Engine v1.0
          </Badge>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            const isConsole = link.href === "/dashboard";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-4",
                  active
                    ? isConsole
                      ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border border-indigo-500/25 bg-indigo-500/10 text-indigo-300"
                    : isConsole
                      ? "border border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700 hover:bg-slate-800"
                      : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-100",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {link.label}
                  {isConsole && !active && (
                    <ArrowRight className="hidden h-3 w-3 opacity-60 sm:inline" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}

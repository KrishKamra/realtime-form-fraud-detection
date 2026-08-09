import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "mono";
  className?: string;
  dot?: boolean;
  pulse?: boolean;
};

const tones = {
  neutral: "bg-slate-900/80 border-slate-700/60 text-slate-300",
  brand: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  danger: "bg-rose-500/10 border-rose-500/30 text-rose-300",
  mono: "bg-slate-950/80 border-slate-800 text-slate-400 font-mono",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full bg-current",
            pulse && "animate-ping",
          )}
        />
      )}
      {children}
    </span>
  );
}

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLMotionProps<"div"> & {
  intensity?: "subtle" | "default" | "strong";
  hover?: boolean;
  shine?: boolean;
};

const intensityClass = {
  subtle: "glass-subtle",
  default: "glass",
  strong: "glass-strong",
};

export function GlassCard({
  className,
  children,
  intensity = "default",
  hover = false,
  shine = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, transition: { duration: 0.25 } } : undefined}
      className={cn(
        "rounded-2xl shadow-glass",
        intensityClass[intensity],
        hover && "transition-[border-color,box-shadow] duration-300 hover:border-slate-600/60 hover:shadow-elevated",
        shine && "shine-border",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

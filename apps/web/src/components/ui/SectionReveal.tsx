"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "footer";
  once?: boolean;
};

export function SectionReveal({
  children,
  className,
  delay = 0,
  as = "div",
  once = true,
}: SectionRevealProps) {
  const Comp = motion[as];

  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-8% 0px -8% 0px", amount: 0.15 }}
      variants={{
        ...defaultVariants,
        visible: {
          ...defaultVariants.visible,
          transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
            delay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

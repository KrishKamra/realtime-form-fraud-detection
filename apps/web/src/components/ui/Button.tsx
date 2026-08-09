"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 border border-indigo-500/40 hover:scale-[1.015] active:scale-[0.985]",
  secondary:
    "bg-slate-900/80 text-slate-100 border border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 hover:scale-[1.015] active:scale-[0.985]",
  ghost:
    "bg-transparent text-slate-300 hover:bg-slate-900/60 hover:text-slate-100 border border-transparent",
  danger:
    "bg-rose-600/90 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 border border-rose-500/40 hover:scale-[1.015] active:scale-[0.985]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-sm rounded-xl",
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
};

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type AsLink = CommonProps & {
  href: string;
  external?: boolean;
};

function baseClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button(props: AsButton | AsLink) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const classes = baseClasses(variant, size, props.className);
  const { children, icon } = props;

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
          {icon}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
        {icon}
      </Link>
    );
  }

  const {
    onClick,
    disabled,
    type = "button",
    id,
    name,
    form,
    "aria-label": ariaLabel,
  } = props as AsButton;

  return (
    <button
      type={type}
      id={id}
      name={name}
      form={form}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
      {icon}
    </button>
  );
}

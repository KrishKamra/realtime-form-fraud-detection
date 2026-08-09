"use client";

import React, { forwardRef, useState } from "react";
import { TelemetryEvent } from "@/types/telemetry";
import { cn } from "@/lib/utils";

interface TrackedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  fieldId: string;
  recordEvent: (
    type: TelemetryEvent["event_type"],
    fieldId: string,
    extra?: { key_code?: string; cursor_x?: number; cursor_y?: number },
  ) => void;
  error?: string;
  isNumericOnly?: boolean;
}

export const TrackedInput = forwardRef<HTMLInputElement, TrackedInputProps>(
  (
    {
      label,
      fieldId,
      recordEvent,
      error,
      isNumericOnly,
      onChange,
      type,
      className,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumericOnly) {
        e.target.value = e.target.value.replace(/[^0-9,.]/g, "");
      }
      onChange?.(e);
    };

    return (
      <div className="flex w-full flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className={cn(
            "text-xs font-medium uppercase tracking-wider transition-colors",
            focused ? "text-indigo-300" : "text-slate-400",
          )}
        >
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={fieldId}
            type={type === "number" ? "text" : type}
            inputMode={
              isNumericOnly || type === "number" ? "numeric" : props.inputMode
            }
            onChange={handleChange}
            onKeyDown={(e) => {
              recordEvent("keydown", fieldId, { key_code: e.code });
              props.onKeyDown?.(e);
            }}
            onKeyUp={(e) => {
              recordEvent("keyup", fieldId, { key_code: e.code });
              props.onKeyUp?.(e);
            }}
            onMouseMove={(e) => {
              recordEvent("mousemove", fieldId, {
                cursor_x: e.clientX,
                cursor_y: e.clientY,
              });
              props.onMouseMove?.(e);
            }}
            onPaste={(e) => {
              recordEvent("paste", fieldId);
              props.onPaste?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              recordEvent("focus", fieldId);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              recordEvent("blur", fieldId);
              props.onBlur?.(e);
            }}
            className={cn(
              `w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-slate-100
              placeholder-slate-500 outline-none transition-all duration-200
              focus:border-indigo-500 focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/30`,
              error
                ? "border-rose-500/80 focus:ring-rose-500/40"
                : "border-slate-800 hover:border-slate-700",
              className,
            )}
          />
          {focused && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-3 my-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
            />
          )}
        </div>
        {error && <span className="mt-0.5 text-xs text-rose-400">{error}</span>}
      </div>
    );
  },
);

TrackedInput.displayName = "TrackedInput";

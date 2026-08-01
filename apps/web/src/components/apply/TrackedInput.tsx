"use client";

import React, { forwardRef } from "react";
import { TelemetryEvent } from "@/types/telemetry";

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
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumericOnly) {
        // Strip out any characters that aren't numbers, commas, or decimals
        e.target.value = e.target.value.replace(/[^0-9,.]/g, "");
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          htmlFor={fieldId}
          className="text-xs font-medium text-slate-300 uppercase tracking-wider"
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
              recordEvent("focus", fieldId);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              recordEvent("blur", fieldId);
              props.onBlur?.(e);
            }}
            className={`w-full px-4 py-3 bg-slate-900 border rounded-lg text-sm text-slate-100 placeholder-slate-500 
              transition-all duration-150 outline-none
              focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
              ${error ? "border-rose-500/80 focus:ring-rose-500/40" : "border-slate-800"}`}
          />
        </div>
        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
      </div>
    );
  },
);

TrackedInput.displayName = "TrackedInput";

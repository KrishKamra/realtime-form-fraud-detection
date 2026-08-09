"use client";

import { useId, useMemo } from "react";
import { cn, riskTier } from "@/lib/utils";

type RiskSparklineProps = {
  /** Chronological risk scores (oldest → newest) */
  points: number[];
  width?: number;
  height?: number;
  className?: string;
  /** Stroke width of the path */
  strokeWidth?: number;
};

/**
 * Tiny live risk sparkline for dashboard session rows.
 * Colors by the latest score tier; fills a soft gradient under the line.
 */
export function RiskSparkline({
  points,
  width = 72,
  height = 22,
  className,
  strokeWidth = 1.5,
}: RiskSparklineProps) {
  const uid = useId();
  const gradId = `spark-fill-${uid.replace(/:/g, "")}`;

  const { path, area, latest, tier } = useMemo(() => {
    if (!points.length) {
      return {
        path: "",
        area: "",
        latest: 0,
        tier: "low" as const,
      };
    }

    const padX = 1;
    const padY = 2;
    const w = width - padX * 2;
    const h = height - padY * 2;
    const n = points.length;
    const min = 0;
    const max = 100;

    const coords = points.map((p, i) => {
      const x = padX + (n === 1 ? w / 2 : (i / (n - 1)) * w);
      const t = (Math.max(min, Math.min(max, p)) - min) / (max - min);
      const y = padY + h - t * h;
      return [x, y] as const;
    });

    const line = coords
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

    const areaPath =
      line +
      ` L${coords[coords.length - 1][0].toFixed(1)},${(height - padY).toFixed(1)}` +
      ` L${coords[0][0].toFixed(1)},${(height - padY).toFixed(1)} Z`;

    const last = points[points.length - 1] ?? 0;
    return {
      path: line,
      area: areaPath,
      latest: last,
      tier: riskTier(last),
    };
  }, [points, width, height]);

  const stroke =
    tier === "high"
      ? "stroke-rose-400"
      : tier === "medium"
        ? "stroke-amber-400"
        : "stroke-emerald-400";

  const fillStop =
    tier === "high"
      ? "rgb(244 63 94)"
      : tier === "medium"
        ? "rgb(245 158 11)"
        : "rgb(52 211 153)";

  if (points.length < 2) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center font-mono text-[9px] text-slate-600",
          className,
        )}
        style={{ width, height }}
        title="Collecting risk history…"
      >
        ···
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-label={`Risk trend, latest ${latest.toFixed(1)}`}
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillStop} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fillStop} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Mid guide */}
      <line
        x1={1}
        x2={width - 1}
        y1={height / 2}
        y2={height / 2}
        className="stroke-slate-700/50"
        strokeWidth={0.5}
        strokeDasharray="2 3"
      />
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        className={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest point */}
      {points.length > 0 && (
        <circle
          cx={width - 2}
          cy={
            2 +
            (height - 4) *
              (1 - Math.max(0, Math.min(100, latest)) / 100)
          }
          r={2}
          className={cn(
            tier === "high"
              ? "fill-rose-400"
              : tier === "medium"
                ? "fill-amber-400"
                : "fill-emerald-400",
          )}
        />
      )}
    </svg>
  );
}

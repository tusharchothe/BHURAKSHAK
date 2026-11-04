import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: LucideIcon;
  iconColor?: string;   // e.g. "#3b82f6"
  iconBg?: string;      // e.g. "#eff6ff"
  trend?: { direction: "up" | "down" | "flat"; text: string };
  className?: string;
  valueClassName?: string;
  /** Reduces padding, icon, and text sizes — useful on mobile grids */
  compact?: boolean;
}

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  className,
  valueClassName,
  compact = false,
}: KpiCardProps) {
  const ic = iconColor ?? "#3b82f6";
  const ib = iconBg ?? ic + "1a";

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm flex items-center hover:shadow-md transition-shadow",
        compact ? "p-3 gap-2.5" : "p-5 gap-4",
        className
      )}
    >
      {/* Icon box */}
      {Icon && (
        <div
          className={cn(
            "shrink-0 flex items-center justify-center rounded-lg",
            compact ? "size-8" : "size-12"
          )}
          style={{ backgroundColor: ib }}
        >
          <Icon
            className={compact ? "size-4" : "size-6"}
            style={{ color: ic }}
            aria-hidden
          />
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "font-semibold uppercase tracking-wider text-gray-500 truncate",
          compact ? "text-[9px]" : "text-xs"
        )}>
          {label}
        </p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span
            className={cn(
              "font-mono font-extrabold text-gray-800 tracking-tight",
              compact ? "text-lg" : "text-2xl",
              valueClassName
            )}
          >
            {value}
          </span>
          {unit && (
            <span className={cn("font-semibold text-gray-400", compact ? "text-xs" : "text-sm")}>
              {unit}
            </span>
          )}
        </div>
        {(hint || trend) && (
          <div className={cn("text-gray-400 truncate", compact ? "text-[9px] mt-0" : "text-xs mt-1")}>
            {trend ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]",
                  trend.direction === "up"
                    ? "bg-amber-50 text-amber-600"
                    : trend.direction === "down"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "■"} {trend.text}
              </span>
            ) : (
              hint
            )}
          </div>
        )}
      </div>
    </div>
  );
}

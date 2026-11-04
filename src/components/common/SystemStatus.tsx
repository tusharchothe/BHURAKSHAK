import type { SystemStatusInfo } from "@/types";
import { StatusBadge, type StatusTone } from "./StatusBadge";
import { cn } from "@/lib/utils";

const tone: Record<SystemStatusInfo["ingestion"], StatusTone> = {
  nominal: "safe",
  degraded: "caution",
  down: "critical",
};

export function SystemStatus({
  status,
  compact = false,
  className,
}: {
  status: SystemStatusInfo;
  compact?: boolean;
  className?: string;
}) {
  const items = [
    { label: "Ingestion", value: status.ingestion },
    { label: "Model service", value: status.modelService },
  ] as const;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {!compact && <span className="label-caps">{item.label}</span>}
          <StatusBadge label={compact ? `${item.label}: ${item.value}` : item.value} tone={tone[item.value]} />
        </div>
      ))}
      <span className="numeric-readout text-xs text-muted-foreground">
        Last sync {new Date(status.lastSyncAt).toLocaleTimeString()}
      </span>
    </div>
  );
}

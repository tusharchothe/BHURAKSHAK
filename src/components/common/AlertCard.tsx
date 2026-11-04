import { AlertTriangle } from "lucide-react";
import type { Alert } from "@/types";
import { StatusBadge, type StatusTone } from "./StatusBadge";
import { cn } from "@/lib/utils";

const severityTone: Record<Alert["severity"], StatusTone> = {
  info: "info",
  advisory: "caution",
  warning: "warning",
  critical: "critical",
};

interface AlertCardProps {
  alert: Alert;
  className?: string;
}

export function AlertCard({ alert, className }: AlertCardProps) {
  return (
    <article className={cn("rounded-md border bg-card p-4", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={alert.severity} tone={severityTone[alert.severity]} />
            <StatusBadge label={alert.status} tone="neutral" dot={false} />
            <span className="numeric-readout ml-auto text-xs text-muted-foreground">
              {new Date(alert.raisedAt).toLocaleString()}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{alert.title}</h3>
          <ul className="mt-2 space-y-1 border-l-2 border-border pl-3 text-xs text-muted-foreground">
            {alert.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

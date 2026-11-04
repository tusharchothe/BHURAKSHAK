import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadge = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        safe: "border-safe/30 bg-safe/10 text-safe",
        caution: "border-caution/40 bg-caution/15 text-caution-foreground",
        warning: "border-warning/35 bg-warning/12 text-warning",
        critical: "border-critical/35 bg-critical/12 text-critical",
        info: "border-navy/25 bg-navy/8 text-navy",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type StatusTone = NonNullable<VariantProps<typeof statusBadge>["tone"]>;

interface StatusBadgeProps extends VariantProps<typeof statusBadge> {
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone, dot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadge({ tone }), className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

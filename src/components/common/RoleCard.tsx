import { Link } from "@tanstack/react-router";
import { ArrowRight, HardHat, Map, ShieldCheck } from "lucide-react";
import type { RoleDefinition, UserRole } from "@/types";

const roleIcon = { operator: HardHat, planner: Map, regulator: ShieldCheck } as const;

export function RoleCard({ role }: { role: RoleDefinition }) {
  const Icon = roleIcon[role.id as UserRole];
  return (
    <Link
      to={role.route}
      className="group flex flex-col rounded-md border bg-card p-5 transition-colors hover:border-navy/40 hover:bg-accent/40"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-sm bg-navy text-navy-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <h3 className="text-base font-semibold text-foreground">{role.title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{role.summary}</p>
      <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        {role.priorities.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-saffron" />
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-navy">
        Enter workspace
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

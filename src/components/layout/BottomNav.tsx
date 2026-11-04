/**
 * BottomNav.tsx
 * Mobile-only bottom navigation bar (md:hidden).
 * Shows ≤5 role-specific tabs with icon + label.
 * Fixed to bottom, respects iOS safe-area.
 */

import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
}

/** Max 5 items shown in the bottom bar per role. */
const BOTTOM_NAV_ITEMS: Record<UserRole, string[]> = {
  operator:  ["overview", "live", "alerts", "sensors", "ai"],
  planner:   ["overview", "map", "history", "trends", "intelligence"],
  regulator: ["overview", "portfolio", "review", "health", "reports"],
};

interface BottomNavProps {
  role: UserRole;
  items: NavItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  accent?: string;
}

export function BottomNav({
  role,
  items,
  activeTab,
  onTabChange,
  accent = "#3b82f6",
}: BottomNavProps) {
  const allowedIds = BOTTOM_NAV_ITEMS[role] ?? [];
  const visible = items.filter((item) => allowedIds.includes(item.id));

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a2035] border-t border-white/10 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {visible.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange?.(item.id)}
            aria-current={isActive ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-colors"
            style={
              isActive
                ? { color: accent }
                : { color: "rgba(255,255,255,0.5)" }
            }
          >
            <item.icon
              className="size-5 shrink-0"
              aria-hidden
            />
            <span
              className="text-[9px] font-semibold uppercase tracking-wider leading-tight truncate max-w-full px-1"
              style={isActive ? { color: accent } : undefined}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className="absolute bottom-0 h-0.5 w-8 rounded-t-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

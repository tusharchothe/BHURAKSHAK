import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid } from "lucide-react";
import type { UserRole } from "@/types";
import { getRole } from "@/data";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
}

export function Sidebar({
  role,
  items,
  activeTab,
  onTabChange,
  accent,
}: {
  role: UserRole;
  items: NavItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  accent?: string;
}) {
  const definition = getRole(role);
  const activeColor = accent ?? "#3b82f6";

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col bg-[#1a2035] text-white lg:flex border-r border-white/5">
      {/* Workspace label */}
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Workspace
        </p>
        <p className="mt-1 text-sm font-bold text-white">{definition.title}</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm transition-all"
              style={
                isActive
                  ? {
                      color: activeColor,
                      borderLeft: `3px solid ${activeColor}`,
                      paddingLeft: "9px",
                      fontWeight: 600,
                    }
                  : {
                      color: "rgba(255,255,255,0.6)",
                      borderLeft: "3px solid transparent",
                      paddingLeft: "9px",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.9)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-2">
        <Link
          to="/system"
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-white/50 hover:bg-white/6 hover:text-white/80 transition-colors"
          style={{ borderLeft: "3px solid transparent", paddingLeft: "9px" }}
        >
          <LayoutGrid className="size-4 shrink-0" aria-hidden />
          Switch role
        </Link>
      </div>
    </aside>
  );
}

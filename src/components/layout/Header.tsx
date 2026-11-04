import { Link } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";
import type { UserRole } from "@/types";

export function Header({
  role,
  accent,
  roleLabel,
}: {
  role?: UserRole;
  accent?: string;
  roleLabel?: string;
}) {
  return (
    <header className="border-b border-[#1a2035] bg-[#1a2035] text-white z-20 relative">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-full overflow-hidden ring-2 ring-white/20 bg-white shrink-0">
            <img
              src="/Logo.png"
              alt="BHURAKSHAK"
              className="size-9 object-contain"
            />
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-sm tracking-[0.16em] text-white">BHURAKSHAK</span>
            <span className="block text-[10px] uppercase tracking-[0.12em] text-white/60 hidden sm:block">
              Mine Safety Sentinel
            </span>
          </span>
        </Link>

        <span className="hidden rounded border border-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60 md:inline">
          Prototype · demo data
        </span>

        <div className="ml-auto flex items-center gap-3">
          {roleLabel && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: (accent ?? "#3b82f6") + "33", border: `1px solid ${accent ?? "#3b82f6"}55` }}
            >
              <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: accent ?? "#3b82f6" }}
              />
              {roleLabel}
            </span>
          )}
          <button className="relative p-2 rounded hover:bg-white/10 transition-colors">
            <Bell className="size-4 text-white/70" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
          </button>
          {/* User avatar — navigates to role switcher (acts as logout/profile on mobile) */}
          <Link
            to="/system"
            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
            title="Switch role"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold">
              <User className="size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

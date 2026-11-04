import type { ReactNode } from "react";
import type { UserRole } from "@/types";
import { demoSystemStatus, getRole } from "@/data";
import { Header } from "./Header";
import { Sidebar, type NavItem } from "./Sidebar";
import { FloatingAIChat } from "./FloatingAIChat";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardShell({
  role,
  nav,
  title,
  subtitle,
  children,
  activeTab,
  onTabChange,
}: {
  role: UserRole;
  nav: NavItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}) {
  const definition = getRole(role);

  const roleAccent: Record<UserRole, string> = {
    operator: "#ef4444",
    planner: "#3b82f6",
    regulator: "#8b5cf6",
  };

  const accent = roleAccent[role] ?? "#3b82f6";

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fa] font-sans text-foreground">
      <Header role={role} accent={accent} roleLabel={definition.title} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} items={nav} activeTab={activeTab} onTabChange={onTabChange} accent={accent} />
        <main className="min-w-0 flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Page header bar */}
          <div
            className="flex flex-wrap items-center gap-3 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm z-10 relative"
            style={{ borderLeft: `4px solid ${accent}` }}
          >
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-800">{title}</h1>
              {subtitle && <p className="text-xs font-medium text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {/* Live status pill */}
            <div className="ml-auto flex items-center gap-2 bg-gray-100 rounded px-3 py-1.5 text-xs font-semibold text-gray-600">
              <span
                className="inline-block size-2 rounded-full animate-pulse"
                style={{ backgroundColor: demoSystemStatus.overall === "ok" ? "#22c55e" : "#ef4444" }}
              />
              {demoSystemStatus.overall === "ok" ? "All Systems Nominal" : "System Alert"}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 sm:p-6 pb-20 md:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab || title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating AI chat — visible on every page */}
      <FloatingAIChat />
      <BottomNav
        role={role}
        items={nav}
        activeTab={activeTab}
        onTabChange={onTabChange}
        accent={accent}
      />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Globe2, Briefcase, Map, ClipboardCheck, HeartPulse, FileText } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NationalOverviewTab } from "@/components/regulator/NationalOverviewTab";
import { MinePortfolioTab } from "@/components/regulator/MinePortfolioTab";
import { MineDetailTab } from "@/components/regulator/MineDetailTab";
import { ReviewCenterTab } from "@/components/regulator/ReviewCenterTab";
import { MonitoringHealthTab } from "@/components/regulator/MonitoringHealthTab";
import { RegulatorReportsTab } from "@/components/regulator/RegulatorReportsTab";

export const Route = createFileRoute("/regulator")({
  head: () => ({
    meta: [
      { title: "Regulator workspace — BHURAKSHAK" },
      { name: "description", content: "Multi-mine monitoring oversight and evidence-based review." },
    ],
  }),
  component: RegulatorPage,
});

const nav = [
  { id: "overview", label: "National Overview", icon: Globe2 },
  { id: "portfolio", label: "Mine Portfolio", icon: Briefcase },
  { id: "detail", label: "Mine Detail", icon: Map },
  { id: "review", label: "Review Center", icon: ClipboardCheck },
  { id: "health", label: "Monitoring Health", icon: HeartPulse },
  { id: "reports", label: "Reports", icon: FileText },
];

function RegulatorPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return <NationalOverviewTab />;
      case "portfolio": return <MinePortfolioTab />;
      case "detail": return <MineDetailTab />;
      case "review": return <ReviewCenterTab />;
      case "health": return <MonitoringHealthTab />;
      case "reports": return <RegulatorReportsTab />;
      default: return <NationalOverviewTab />;
    }
  };

  const currentNav = nav.find(n => n.id === activeTab);

  return (
    <DashboardShell
      role="regulator"
      nav={nav}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={currentNav?.label || "National Overview"}
      subtitle="Safety Oversight & Institutional Review"
    >
      {renderTabContent()}
    </DashboardShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Map, LineChart, TrendingUp, ShieldAlert, Layers, BrainCircuit, FileText } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PlanningOverviewTab } from "@/components/planner/PlanningOverviewTab";
import { MinePanelMapTab } from "@/components/planner/MinePanelMapTab";
import { DeformationHistoryTab } from "@/components/planner/DeformationHistoryTab";
import { RiskTrendsTab } from "@/components/planner/RiskTrendsTab";
import { MonitoringCoverageTab } from "@/components/planner/MonitoringCoverageTab";
import { PanelComparisonTab } from "@/components/planner/PanelComparisonTab";
import { PlanningIntelligenceTab } from "@/components/planner/PlanningIntelligenceTab";
import { ReportsTab } from "@/components/planner/ReportsTab";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner workspace — BHURAKSHAK" },
      { name: "description", content: "Long-term ground-risk intelligence and monitoring planning." },
    ],
  }),
  component: PlannerPage,
});

const nav = [
  { id: "overview", label: "Planning Overview", icon: LayoutDashboard },
  { id: "map", label: "Mine & Panel Map", icon: Map },
  { id: "history", label: "Deformation History", icon: LineChart },
  { id: "trends", label: "Risk Trends", icon: TrendingUp },
  { id: "coverage", label: "Monitoring Coverage", icon: ShieldAlert },
  { id: "comparison", label: "Panel Comparison", icon: Layers },
  { id: "intelligence", label: "Planning Intelligence", icon: BrainCircuit },
  { id: "reports", label: "Reports", icon: FileText },
];

function PlannerPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return <PlanningOverviewTab />;
      case "map": return <MinePanelMapTab />;
      case "history": return <DeformationHistoryTab />;
      case "trends": return <RiskTrendsTab />;
      case "coverage": return <MonitoringCoverageTab />;
      case "comparison": return <PanelComparisonTab />;
      case "intelligence": return <PlanningIntelligenceTab />;
      case "reports": return <ReportsTab />;
      default: return <PlanningOverviewTab />;
    }
  };

  const currentNav = nav.find(n => n.id === activeTab);

  return (
    <DashboardShell
      role="planner"
      nav={nav}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={currentNav?.label || "Planning Overview"}
      subtitle="Demo Colliery Alpha · Long-Term Strategic View"
    >
      {renderTabContent()}
    </DashboardShell>
  );
}

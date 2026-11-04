import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Bell, Gauge, Radio, LineChart, Server, FileText, Settings, Bot } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OverviewTab } from "@/components/operator/OverviewTab";
import { LiveMonitoringTab } from "@/components/operator/LiveMonitoringTab";
import { AlertCenterTab } from "@/components/operator/AlertCenterTab";
import { AnalyticsTab } from "@/components/operator/AnalyticsTab";
import { SensorNetworkTab } from "@/components/operator/SensorNetworkTab";
import { ManagementTab } from "@/components/operator/ManagementTab";
import { ReportsTab } from "@/components/operator/ReportsTab";
import { BhurakshakAITab } from "@/components/operator/BhurakshakAITab";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Operator workspace — BHURAKSHAK" },
      { name: "description", content: "Shift-level surface sensor monitoring and alert response for mine operators." },
    ],
  }),
  component: OperatorPage,
});

const nav = [
  { id: "overview",    label: "Overview",                  icon: Gauge    },
  { id: "live",        label: "Live Monitoring",            icon: Activity },
  { id: "sensors",     label: "Sensor Network",             icon: Radio    },
  { id: "alerts",      label: "Alerts",                     icon: Bell     },
  { id: "analytics",   label: "Analytics & Prediction",     icon: LineChart },
  { id: "management",  label: "Mine / Panel Management",    icon: Server   },
  { id: "reports",     label: "Reports",                    icon: FileText },
  { id: "ai",          label: "BHURAKSHAK AI",              icon: Bot      },
  { id: "settings",    label: "System Settings",            icon: Settings },
];

function OperatorPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":   return <OverviewTab />;
      case "live":       return <LiveMonitoringTab />;
      case "sensors":    return <SensorNetworkTab />;
      case "alerts":     return <AlertCenterTab />;
      case "analytics":  return <AnalyticsTab />;
      case "management": return <ManagementTab />;
      case "reports":    return <ReportsTab />;
      case "ai":         return <BhurakshakAITab />;
      case "settings":   return <div className="p-8 text-center text-muted-foreground">System Settings Placeholder</div>;
      default:           return <OverviewTab />;
    }
  };

  const currentNav = nav.find(n => n.id === activeTab);

  return (
    <DashboardShell
      role="operator"
      nav={nav}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={currentNav?.label || "Live operations overview"}
      subtitle="Demo Colliery Alpha · synthetic demo data"
    >
      {renderTabContent()}
    </DashboardShell>
  );
}

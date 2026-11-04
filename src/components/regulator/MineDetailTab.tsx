import { useState } from "react";
import { ArrowLeft, Map, Activity, Clock, FileText, Download } from "lucide-react";
import { MapCore } from "@/components/gis/MapCore";
import { minePortfolio, reviewCases } from "@/data/regulatorMocks";
import { demoOperatorAlerts } from "@/data/operatorMocks"; // Reusing for timeline

export function MineDetailTab() {
  const mine = minePortfolio[0]; // Colliery Alpha for demo
  const siteCases = reviewCases.filter(c => c.mine === mine.name);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{mine.name}</h2>
            <span className="px-2 py-1 bg-warning/20 text-warning text-[10px] font-bold uppercase rounded">
              {mine.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{mine.company} · {mine.coalfield}, {mine.state} · ID: {mine.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main GIS and Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden h-[280px] sm:h-[500px] relative">
            <MapCore />
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur border p-2 rounded text-xs font-bold uppercase tracking-wider">
              Site GIS Explorer
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock className="size-4" /> Recent Alert Timeline
              </h3>
            </div>
            
            <div className="space-y-4">
              {demoOperatorAlerts.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-border"></div>}
                  <div className={`mt-1 size-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    alert.severity === 'critical' ? 'bg-critical/20 text-critical border border-critical/50' : 'bg-warning/20 text-warning border border-warning/50'
                  }`}>
                    <Activity className="size-3" />
                  </div>
                  <div className="bg-muted p-4 rounded-lg flex-1 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm">{alert.type}</h4>
                      <span className="text-xs text-muted-foreground font-mono">{alert.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{alert.description}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono bg-background px-2 py-1 rounded border">Node: {alert.nodeId}</span>
                      <span className="text-[10px] font-mono bg-background px-2 py-1 rounded border">Loc: {alert.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Site Metrics</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Active Alerts</span>
                <span className="font-bold text-warning">{mine.activeAlerts}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">High Risk Zones</span>
                <span className="font-bold text-critical">{mine.highRiskZones}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unresolved Alerts</span>
                <span className="font-bold text-warning">{mine.unresolvedAlerts}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">System Health</span>
                <span className="font-mono text-safe">{mine.health}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Last Data Sync</span>
                <span className="font-mono">{mine.lastSync}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Last Review</span>
                <span>{mine.lastReview}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Active Review Cases</h3>
            <div className="space-y-3">
              {siteCases.map(c => (
                <div key={c.id} className="p-3 bg-warning/5 border border-warning/30 rounded-lg cursor-pointer hover:bg-warning/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warning">{c.reviewStatus}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{c.issue}</p>
                  <p className="text-xs text-muted-foreground">Detected: {c.detected}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Available Evidence</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm text-left">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-primary" />
                  <span>30-Day Deformation Report</span>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm text-left">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-primary" />
                  <span>Sensor Coverage Audit</span>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

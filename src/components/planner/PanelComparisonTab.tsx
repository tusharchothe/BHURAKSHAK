import { Layers, ArrowRight } from "lucide-react";
import { plannerPanelComparison } from "@/data/plannerMocks";

export function PanelComparisonTab() {
  const panelA = plannerPanelComparison[0];
  const panelB = plannerPanelComparison[1];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Panel Comparison</h2>
        <p className="text-sm text-muted-foreground mt-1">Side-by-side risk and structural analysis</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        
        {/* Panel A */}
        <div className="flex-1 rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              Panel {panelA.id}
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-primary/20 text-primary rounded">
              {panelA.status}
            </span>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Structural Context</span>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground block">Depth</span><span className="font-mono font-medium">{panelA.depth}</span></div>
                <div><span className="text-muted-foreground block">Seam</span><span className="font-medium">{panelA.seam}</span></div>
                <div><span className="text-muted-foreground block">Method</span><span className="font-medium">{panelA.method}</span></div>
                <div><span className="text-muted-foreground block">Sensors</span><span className="font-mono font-medium">{panelA.sensorCount} nodes</span></div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Risk Assessment</span>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Risk Level</span>
                  <span className="font-bold text-warning">{panelA.currentRisk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Historical Risk</span>
                  <span className="font-medium">{panelA.historicalRisk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Deformation Trend (30D)</span>
                  <span className="font-mono font-bold text-warning">{panelA.deformationTrend}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Alert Frequency</span>
                  <span className="font-medium text-warning">{panelA.alertFrequency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="hidden lg:flex items-center justify-center shrink-0">
          <div className="size-10 rounded-full border bg-muted flex items-center justify-center font-bold text-muted-foreground">
            VS
          </div>
        </div>

        {/* Panel B */}
        <div className="flex-1 rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Layers className="size-5 text-chart-2" />
              Panel {panelB.id}
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-chart-2/20 text-chart-2 rounded">
              {panelB.status}
            </span>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Structural Context</span>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground block">Depth</span><span className="font-mono font-medium">{panelB.depth}</span></div>
                <div><span className="text-muted-foreground block">Seam</span><span className="font-medium">{panelB.seam}</span></div>
                <div><span className="text-muted-foreground block">Method</span><span className="font-medium">{panelB.method}</span></div>
                <div><span className="text-muted-foreground block">Sensors</span><span className="font-mono font-medium">{panelB.sensorCount} nodes</span></div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Risk Assessment</span>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Risk Level</span>
                  <span className="font-bold text-caution">{panelB.currentRisk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Historical Risk</span>
                  <span className="font-medium">{panelB.historicalRisk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Deformation Trend (30D)</span>
                  <span className="font-mono font-bold text-caution">{panelB.deformationTrend}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Alert Frequency</span>
                  <span className="font-medium text-safe">{panelB.alertFrequency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div className="mt-4 p-4 rounded-xl border bg-muted flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <h4 className="font-semibold text-sm">Analytical Summary</h4>
          <p className="text-xs text-muted-foreground mt-1">Panel P-12 exhibits significantly higher deformation rates and alert frequencies compared to P-11, despite similar active extraction status.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded flex items-center gap-2">
          Export Comparison <ArrowRight className="size-3.5" />
        </button>
      </div>

    </div>
  );
}

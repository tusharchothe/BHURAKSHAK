import { useState } from "react";
import { Layers, Search } from "lucide-react";
import { MapCore } from "@/components/gis/MapCore";

export function MinePanelMapTab() {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  // For the planner Mine & Panel Map, we hide real-time risk markers and focus on structure
  const plannerLayers = {
    boundary: true,
    panels: true,
    infrastructure: true,
    sdn: false,
    hmn: false,
    meg: false,
    gnss: true,
    riskZones: false,
    vectors: false,
    heatmap: false,
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 rounded-xl border bg-card shadow-sm overflow-hidden relative">
        <MapCore 
          initialLayers={plannerLayers}
          onPanelClick={(id) => setSelectedPanel(id)} 
        />
        
        {/* Search Overlay */}
        <div className="absolute top-4 left-32 bg-background border p-2 rounded-lg shadow-sm flex items-center gap-2 w-64 z-10">
          <Search className="size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search panels or zones..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* Detail Panel */}
      {selectedPanel && (
        <div className="w-full md:w-80 shrink-0 rounded-xl border bg-card p-4 shadow-sm animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h3 className="font-bold flex items-center gap-2">
              <Layers className="size-4" /> 
              Panel {selectedPanel}
            </h3>
            <button onClick={() => setSelectedPanel(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Structural Context</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-muted p-2 rounded">
                  <span className="text-[10px] text-muted-foreground block">Depth</span>
                  <span className="font-mono font-bold">180m</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-[10px] text-muted-foreground block">Seam</span>
                  <span className="font-mono font-bold">Seam-III</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-2">Historical Risk Profile</span>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/80">Average Subsidence</span>
                  <span className="font-mono font-bold">42 mm</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/80">Alerts (YTD)</span>
                  <span className="font-mono font-bold">14</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded py-2 text-xs font-semibold uppercase tracking-wider mt-4 transition-colors border border-primary/20">
              View Detailed Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

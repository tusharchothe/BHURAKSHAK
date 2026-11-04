import { Radio, Server, Cloud, Cpu, ArrowDown } from "lucide-react";

export function SensorNetworkGraph() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-lg border border-border relative overflow-hidden p-6 min-h-[400px]">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      
      <div className="relative flex flex-col items-center w-full max-w-2xl">
        
        {/* Layer 1: SDN */}
        <div className="flex flex-col items-center w-full">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-semibold">Standard Distributed Nodes (SDN)</h4>
          <div className="flex justify-around w-full max-w-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="size-10 rounded-full border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Radio className="size-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">SDN-{i}</span>
              </div>
            ))}
          </div>
        </div>

        <ArrowDown className="text-slate-600 size-6 my-4 opacity-50" />

        {/* Layer 2: HMN */}
        <div className="flex flex-col items-center w-full">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-semibold">Hotspot Monitoring Node (HMN)</h4>
          <div className="flex justify-center w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 rounded-full border-2 border-purple-500 bg-purple-500/20 flex items-center justify-center text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Cpu className="size-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400">HMN-01</span>
            </div>
          </div>
        </div>

        <ArrowDown className="text-slate-600 size-6 my-4 opacity-50" />

        {/* Layer 3: MEG */}
        <div className="flex flex-col items-center w-full">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-semibold">Main Edge Gateway (MEG)</h4>
          <div className="flex justify-center w-full">
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-32 h-16 rounded border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center text-amber-500 gap-3 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Server className="size-6" />
                <span className="font-bold">MEG</span>
              </div>
            </div>
          </div>
        </div>

        <ArrowDown className="text-slate-600 size-6 my-4 opacity-50" />

        {/* Layer 4: Cloud */}
        <div className="flex flex-col items-center w-full">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-semibold">BhuRakshak Cloud Intelligence</h4>
          <div className="flex justify-center w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-40 h-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary gap-3 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Cloud className="size-6" />
                <span className="font-bold">Platform</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <div className="absolute bottom-4 left-4 bg-background/80 p-3 rounded text-xs border text-muted-foreground max-w-[200px]">
        <strong>Note:</strong> Selected GNSS reference points provide absolute location validation but are not placed on every node.
      </div>
    </div>
  );
}

import { BrainCircuit, AlertTriangle, Cloud, CloudOff, ArrowRight, ShieldAlert, Cpu } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const mockPipelineData = [
  { time: '10:00', risk: 15 },
  { time: '10:05', risk: 18 },
  { time: '10:10', risk: 24 },
  { time: '10:15', risk: 45 },
  { time: '10:20', risk: 68 },
  { time: '10:25', risk: 85 }, // WARNING threshold crossed
];

export function AnalyticsTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Prototype Intelligence Pipeline</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            Demonstrating analytical workflow for early warning anomaly detection.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="size-4" /> BhuRakshak AI (PROTOTYPE)
        </div>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg text-sm flex items-start gap-3">
        <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-warning mb-1">Scientific Disclaimer</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            There is currently no scientifically validated, deterministic subsidence prediction model. The BhuRakshak platform functions as an <strong>early-warning anomaly detection system</strong>. It does not predict structural failure or "collapse". It identifies anomalous data patterns requiring engineering investigation.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-2">
        {/* The Pipeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Analytical Workflow Example: Sensor SDN-1042</h3>
          
          <div className="space-y-3">
            <PipelineStep 
              step="1" title="Data Validation" status="Passed" 
              desc="Sensor health normal (Battery: 85%, Signal: 92%). Data packet integrity verified."
            />
            <PipelineStep 
              step="2" title="Anomaly Detection" status="Flagged" 
              desc="Current tilt value deviates > 3σ from rolling 7-day baseline." highlight
            />
            <PipelineStep 
              step="3" title="Temporal Analysis" status="Flagged" 
              desc="Abnormal rate of change persisting for 18 consecutive minutes." highlight
            />
            <PipelineStep 
              step="4" title="Spatial Corroboration" status="Flagged" 
              desc="3 out of 4 neighbouring sensors within 50m radius show correlating increasing trends." highlight
            />
            <PipelineStep 
              step="5" title="Risk Assessment" status="Elevated" 
              desc="Multi-variate anomaly score exceeds threshold. Upgrading state to WATCH." highlight
            />
            <div className="ml-4 pl-4 border-l-2 border-primary/30 py-2">
              <div className="bg-card border-2 border-warning/50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="size-5 text-warning" />
                  <h4 className="font-bold">Explainable Alert Generated</h4>
                </div>
                <p className="text-sm">"Zone Z-04 requires investigation. Multiple neighbouring sensors show persistent abnormal behaviour while hardware health remains normal."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics and Edge Architecture */}
        <div className="space-y-6 flex flex-col">
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Anomaly Score Visualization</h3>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="risk" stroke="var(--color-warning)" fill="url(#riskGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
             <p className="text-[10px] text-center text-muted-foreground mt-2">DEMO: Aggregated risk score rising based on spatial/temporal flags.</p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex-1">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Hybrid Edge / Cloud Architecture</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2 text-safe font-semibold text-sm">
                  <Cloud className="size-4" /> ONLINE WORKFLOW
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1"><Cpu className="size-3" /> Local Gateway</span>
                  <ArrowRight className="size-3" />
                  <span className="flex items-center gap-1">Data Stream</span>
                  <ArrowRight className="size-3" />
                  <span className="flex items-center gap-1"><Cloud className="size-3" /> Cloud Intelligence</span>
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2 text-warning font-semibold text-sm">
                  <CloudOff className="size-4" /> OFFLINE WORKFLOW (EDGE FALLBACK)
                </div>
                <div className="flex flex-col gap-2 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 shrink-0"><Cpu className="size-3" /> Local Gateway</span>
                    <ArrowRight className="size-3 shrink-0" />
                    <span>Local Storage & Temporal Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="size-3 shrink-0 opacity-0" />
                    <ArrowRight className="size-3 shrink-0 text-warning" />
                    <span className="text-warning">Generate Local Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="size-3 shrink-0 opacity-0" />
                    <ArrowRight className="size-3 shrink-0" />
                    <span>Cloud Sync (When restored)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function PipelineStep({ step, title, status, desc, highlight = false }: { step: string, title: string, status: string, desc: string, highlight?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
          highlight ? 'bg-warning/20 text-warning border border-warning/50' : 'bg-muted text-muted-foreground'
        }`}>
          {step}
        </div>
        <div className="w-0.5 h-full bg-border mt-2"></div>
      </div>
      <div className={`flex-1 pb-4 ${highlight ? 'text-foreground' : 'text-muted-foreground'}`}>
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-sm">{title}</h4>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
            highlight ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
          }`}>{status}</span>
        </div>
        <p className="text-xs">{desc}</p>
      </div>
    </div>
  );
}

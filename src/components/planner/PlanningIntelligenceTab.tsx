import { BrainCircuit, Info, AlertTriangle, Lightbulb } from "lucide-react";
import { plannerScenarios } from "@/data/plannerMocks";

export function PlanningIntelligenceTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Planning Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1">Scenario-oriented insights based on historical baselines and risk trends</p>
        </div>
        <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-primary/20">
          <BrainCircuit className="size-4" /> Prototype AI Active
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        
        {/* Insights Feed */}
        <div className="lg:col-span-2 space-y-4">
          {plannerScenarios.map((scenario) => (
            <div key={scenario.id} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    scenario.severity === 'high' ? 'bg-warning/20 text-warning' : 'bg-caution/20 text-caution'
                  }`}>
                    {scenario.severity === 'high' ? <AlertTriangle className="size-5" /> : <Lightbulb className="size-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{scenario.title}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{scenario.id} · Generated {scenario.date}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                  scenario.severity === 'high' ? 'bg-warning/10 text-warning' : 'bg-caution/10 text-caution'
                }`}>
                  {scenario.severity} Priority
                </span>
              </div>
              
              <div className="space-y-4 sm:ml-14 ml-0">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observation</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed border-l-2 border-muted pl-3 py-1">
                    {scenario.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommendation</h4>
                  <p className="text-sm text-primary font-medium leading-relaxed border-l-2 border-primary/50 pl-3 py-1">
                    {scenario.recommendation}
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button className="px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded text-xs font-semibold transition-colors">
                    View Associated Data
                  </button>
                  <button className="px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded text-xs font-semibold transition-colors">
                    Dismiss Insight
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence Context */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Intelligence Parameters</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-foreground/80">Site-Specific Thresholds</span>
                <span className="font-medium text-safe">Calibrated</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-foreground/80">Historical Baseline</span>
                <span className="font-mono text-muted-foreground">3 Yrs Data</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-foreground/80">SCAMP Reference</span>
                <span className="font-medium text-primary">Active</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-foreground/80">Confidence Interval</span>
                <span className="font-mono font-bold">95%</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-warning">
              <Info className="size-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">System Disclaimer</h3>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              BhuRakshak provides analytical insights and structural recommendations based on sensor data and historical trends. 
              <strong> The system does not automatically approve or reject mine plans.</strong> All intelligence should be reviewed by a certified mining engineer or geologist before altering extraction sequences.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

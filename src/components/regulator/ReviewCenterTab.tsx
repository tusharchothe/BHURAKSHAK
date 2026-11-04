import { useState } from "react";
import { ClipboardCheck, MessageSquare, AlertTriangle, FileText, Download, CheckCircle, ExternalLink } from "lucide-react";
import { reviewCases } from "@/data/regulatorMocks";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { plannerDeformationHistory } from "@/data/plannerMocks";

export function ReviewCenterTab() {
  const [activeCaseId, setActiveCaseId] = useState(reviewCases[0].id);
  
  const activeCase = reviewCases.find(c => c.id === activeCaseId) || reviewCases[0];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review Center</h2>
        <p className="text-sm text-muted-foreground mt-1">Investigate and process elevated safety incidents across the portfolio.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2 h-full">
        
        {/* Case Queue */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="bg-background border rounded-lg shadow-sm flex items-center justify-between p-2">
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-muted rounded text-xs font-semibold">Open</button>
              <button className="px-3 py-1 text-muted-foreground hover:bg-muted rounded text-xs font-semibold">Resolved</button>
            </div>
            <span className="text-xs text-muted-foreground mr-2">2 Cases</span>
          </div>
          
          <div className="flex-1 overflow-auto space-y-3">
            {reviewCases.map(c => (
              <div 
                key={c.id} 
                onClick={() => setActiveCaseId(c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  activeCaseId === c.id ? 'bg-card border-primary ring-1 ring-primary shadow-md' : 'bg-card hover:border-primary/50 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    c.severity === 'High' ? 'bg-critical/20 text-critical' : 'bg-warning/20 text-warning'
                  }`}>
                    {c.severity} Severity
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                </div>
                <h4 className="font-bold text-sm mb-1">{c.mine}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.issue}</p>
                <div className="mt-3 pt-3 border-t text-[10px] flex justify-between text-muted-foreground">
                  <span>Detected: {c.detected}</span>
                  <span className="text-foreground font-semibold">{c.reviewStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Detail Workspace */}
        <div className="flex-1 rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{activeCase.mine}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-mono">Case: {activeCase.id}</span>
                  <span>·</span>
                  <span>Panel: {activeCase.panel}</span>
                  <span>·</span>
                  <span>Detected: {activeCase.detected}</span>
                </div>
              </div>
              <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border ${
                activeCase.status === 'Open' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-safe/10 text-safe border-safe/20'
              }`}>
                Status: {activeCase.status}
              </span>
            </div>
            
            <div className="bg-background border rounded-lg p-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Issue Description</span>
              <p className="text-sm font-medium">{activeCase.issue}</p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded transition-colors hover:bg-primary/90">
                <CheckCircle className="size-4" /> Mark Reviewed
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground border text-xs font-bold uppercase tracking-wider rounded transition-colors hover:bg-muted/80">
                <MessageSquare className="size-4" /> Request Info
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground border text-xs font-bold uppercase tracking-wider rounded transition-colors hover:bg-muted/80 ml-auto">
                <ExternalLink className="size-4" /> View in GIS
              </button>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-auto space-y-6">
            
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Evidence & Analytics</h4>
              <div className="h-64 border rounded-lg p-4 bg-background">
                {/* Reusing planner mock data for chart */}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plannerDeformationHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
                    <ReferenceLine y={40} stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'top', value: 'Threshold (40mm)', fill: 'var(--color-warning)', fontSize: 10 }} />
                    <Line type="monotone" dataKey="panelA" name="Subsidence" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2 px-1">
                Chart depicts accelerated subsidence over the last 30 days corroborating the automated alert.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Automated Evidence</span>
                <div className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded">
                  <AlertTriangle className="size-4 text-warning mt-0.5 shrink-0" />
                  <span>{activeCase.evidence}</span>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Attached Reports</span>
                <button className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm text-left">
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-primary" />
                    <span>Auto-generated Incident Log</span>
                  </div>
                  <Download className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Review Log</h4>
              <div className="space-y-4 border-l-2 border-border ml-2 pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                  <p className="text-sm font-medium">{activeCase.lastAction}</p>
                  <span className="text-xs text-muted-foreground">System Admin · {activeCase.detected}</span>
                </div>
                <div className="relative opacity-70">
                  <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-muted-foreground ring-4 ring-background"></div>
                  <p className="text-sm font-medium">Case automatically generated</p>
                  <span className="text-xs text-muted-foreground">BhuRakshak AI · {activeCase.detected}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

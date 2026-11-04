import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { plannerDeformationHistory } from "@/data/plannerMocks";

export function RiskTrendsTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Long-Term Risk Trends</h2>
        <p className="text-sm text-muted-foreground mt-1">Aggregated AI risk scores over time</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm flex-1 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Historical Risk Profile (P-12)</h3>
        </div>

        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={plannerDeformationHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
              
              <Area type="monotone" dataKey="panelA" stroke="var(--color-warning)" fill="url(#riskGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <p className="text-sm text-muted-foreground max-w-2xl">
            <TrendingUp className="inline size-4 mr-2" />
            Risk score has steadily climbed over the last 14 days, correlating with an accelerating deformation rate in the northwest quadrant of P-12.
          </p>
          <button className="bg-muted px-4 py-2 rounded text-sm font-semibold">Generate Trend Report</button>
        </div>
      </div>
    </div>
  );
}

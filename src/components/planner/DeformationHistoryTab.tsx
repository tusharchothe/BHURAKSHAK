import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { CalendarRange, Filter } from "lucide-react";
import { plannerDeformationHistory } from "@/data/plannerMocks";

export function DeformationHistoryTab() {
  const [timeRange, setTimeRange] = useState("30D");

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Long-Term Deformation History</h2>
          <p className="text-sm text-muted-foreground mt-1">Comparing strata subsidence across active extraction zones</p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg sm:ml-auto">
          {["7D", "30D", "3M", "6M", "1Y"].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === range ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm flex-1 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary" />
              <span>Panel P-12 (Active)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-chart-2" />
              <span>Panel P-11 (Active)</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
            <Filter className="size-3.5" /> Filter Panels
          </button>
        </div>

        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={plannerDeformationHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Subsidence (mm)', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-muted-foreground)', fontSize: 12 } }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
              
              <ReferenceLine y={40} stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'top', value: 'Safety Threshold (40mm)', fill: 'var(--color-warning)', fontSize: 10 }} />
              
              <Line type="monotone" dataKey="panelA" name="Panel P-12" stroke="var(--color-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="panelB" name="Panel P-11" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">Max Subsidence (30D)</span>
            <span className="font-mono font-bold text-lg">45.2 mm</span> <span className="text-muted-foreground">in P-12</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">Average Rate</span>
            <span className="font-mono font-bold text-lg">+0.8 mm/d</span> <span className="text-muted-foreground">in P-12</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">Baseline Deviation</span>
            <span className="font-mono font-bold text-lg text-warning">+12.4%</span> <span className="text-muted-foreground">vs historical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

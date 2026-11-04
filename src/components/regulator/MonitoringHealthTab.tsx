import { HeartPulse, Radio, Wifi, Server, Database, AlertTriangle } from "lucide-react";

export function MonitoringHealthTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Global Monitoring Health</h2>
        <p className="text-sm text-muted-foreground mt-1">Portfolio-wide telemetry and system availability.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm border-t-4 border-t-safe">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Gateway Availability</span>
            <Server className="size-5 text-safe" />
          </div>
          <span className="text-3xl font-bold font-mono">98.2%</span>
          <p className="text-xs text-muted-foreground mt-2">14/15 Gateways Online</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm border-t-4 border-t-safe">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Node Availability</span>
            <Radio className="size-5 text-safe" />
          </div>
          <span className="text-3xl font-bold font-mono">94.7%</span>
          <p className="text-xs text-muted-foreground mt-2">2,104 Total Nodes</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm border-t-4 border-t-safe">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Data Freshness</span>
            <Database className="size-5 text-safe" />
          </div>
          <span className="text-3xl font-bold font-mono">{'<'}2m</span>
          <p className="text-xs text-muted-foreground mt-2">Average latency across fleet</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm border-t-4 border-t-warning">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Comm. Health</span>
            <Wifi className="size-5 text-warning" />
          </div>
          <span className="text-3xl font-bold font-mono text-warning">82%</span>
          <p className="text-xs text-muted-foreground mt-2">Elevated packet loss in Jharia</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-4">
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">Current Offline Systems</h3>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Project Gamma (M-305)</h4>
                <p className="text-xs text-muted-foreground">MEG-04 Unreachable</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-critical block">Offline: 14h 22m</span>
                <button className="text-[10px] uppercase font-bold text-primary hover:underline mt-1">Investigate</button>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Delta Seam (M-112)</h4>
                <p className="text-xs text-muted-foreground">Panel B Mesh Disconnected</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-warning block">Offline: 0h 45m</span>
                <button className="text-[10px] uppercase font-bold text-primary hover:underline mt-1">Investigate</button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">Fleet Firmware Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1 text-sm">
                <span className="font-medium">Up to Date (v2.4)</span>
                <span className="font-bold font-mono">1,842</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-safe w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1 text-sm">
                <span className="font-medium">Pending Update (v2.3)</span>
                <span className="font-bold font-mono text-warning">262</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[15%]" />
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-muted p-4 rounded-lg flex gap-3 text-sm">
            <AlertTriangle className="size-5 text-muted-foreground shrink-0" />
            <p className="text-muted-foreground">
              OTA updates for the remaining 262 nodes are scheduled during the next maintenance window. No immediate risk to monitoring capability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

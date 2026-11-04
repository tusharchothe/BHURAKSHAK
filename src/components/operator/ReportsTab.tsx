import { FileText, Download, ShieldCheck, Activity } from "lucide-react";

export function ReportsTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Operational Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate and export compliance and safety documentation</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col cursor-pointer group">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Daily Safety Monitoring</h3>
          <p className="text-sm text-muted-foreground flex-1">Complete summary of sensor health, network uptime, and flagged zones across the mine over the last 24 hours.</p>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2">
              <Download className="size-3.5" /> PDF
            </button>
            <button className="flex-1 bg-muted text-foreground text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2">
              <Download className="size-3.5" /> CSV
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col cursor-pointer group">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <Activity className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Panel Risk Report</h3>
          <p className="text-sm text-muted-foreground flex-1">Detailed deformation analytics, anomaly scores, and sensor evidence for a specific extraction panel.</p>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2">
              <Download className="size-3.5" /> PDF
            </button>
            <button className="flex-1 bg-muted text-foreground text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2">
              <Download className="size-3.5" /> CSV
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col cursor-pointer group">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <FileText className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Alert History</h3>
          <p className="text-sm text-muted-foreground flex-1">Log of all generated warnings, acknowledgement times, assigned investigations, and resolution notes.</p>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2">
              <Download className="size-3.5" /> PDF
            </button>
            <button className="flex-1 bg-muted text-foreground text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2">
              <Download className="size-3.5" /> CSV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

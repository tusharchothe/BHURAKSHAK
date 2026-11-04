import { FileText, Download, Target, LineChart, ShieldAlert } from "lucide-react";

export function RegulatorReportsTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Regulator Documentation</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate multi-mine safety and compliance evidence reports.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col cursor-pointer group">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <LineChart className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Mine Safety Monitoring Summary</h3>
          <p className="text-sm text-muted-foreground flex-1">Aggregated macro-level review of all monitored coalfields, highlighting risk trends and systemic issues.</p>
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
            <Target className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Monitoring Availability Report</h3>
          <p className="text-sm text-muted-foreground flex-1">Detailed audit of sensor mesh uptime, gateway connectivity, and identified monitoring gaps across the portfolio.</p>
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
            <ShieldAlert className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Mine Review Evidence Report</h3>
          <p className="text-sm text-muted-foreground flex-1">Compile sensor trends, spatial corroboration, and historical alerts into a formal evidence package for a specific mine.</p>
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

import { FileText, Download, Target, LineChart } from "lucide-react";

export function ReportsTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Planning Documentation</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate structural and analytical reports for mine planning</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col cursor-pointer group">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <LineChart className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Long-Term Deformation Report</h3>
          <p className="text-sm text-muted-foreground flex-1">Aggregated subsidence and deformation metrics across all instrumented panels spanning a 1-year historical window.</p>
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
          <h3 className="font-bold text-lg mb-2 text-foreground">Monitoring Strategy Assessment</h3>
          <p className="text-sm text-muted-foreground flex-1">Analysis of current sensor mesh topology, identified structural coverage gaps, and AI-driven deployment recommendations.</p>
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
          <h3 className="font-bold text-lg mb-2 text-foreground">Panel Risk Audit (P-12)</h3>
          <p className="text-sm text-muted-foreground flex-1">Focused documentation on Panel P-12, highlighting escalating risk scores, spatial corroboration evidence, and historical baselines.</p>
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

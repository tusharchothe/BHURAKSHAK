import { demoPanels } from "@/data/operatorMocks";

export function ManagementTab() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Mine & Panel Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Colliery Alpha active extraction zones and monitoring coverage</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Panel ID</th>
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Status</th>
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Depth</th>
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Seam</th>
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Mining Method</th>
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Coverage</th>
              <th className="h-12 px-4 align-middle font-semibold uppercase tracking-wider">Current Risk</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {demoPanels.map((panel) => (
              <tr key={panel.id} className="border-b transition-colors hover:bg-muted/30">
                <td className="p-4 align-middle font-mono font-bold text-foreground">{panel.id}</td>
                <td className="p-4 align-middle">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                    panel.status === 'Active Extraction' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {panel.status}
                  </span>
                </td>
                <td className="p-4 align-middle font-mono">{panel.depth}</td>
                <td className="p-4 align-middle">{panel.seam}</td>
                <td className="p-4 align-middle">{panel.method}</td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden w-24">
                      <div className="h-full bg-safe" style={{ width: panel.coverage }} />
                    </div>
                    <span className="font-mono text-xs">{panel.coverage}</span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span className={`font-bold uppercase tracking-widest text-[10px] ${
                    panel.currentRisk === 'WARNING' ? 'text-warning' :
                    panel.currentRisk === 'WATCH' ? 'text-caution' : 'text-safe'
                  }`}>
                    {panel.currentRisk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

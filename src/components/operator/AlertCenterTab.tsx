import { useState } from "react";
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, FileText, ArrowRight, Map } from "lucide-react";
import { demoOperatorAlerts } from "@/data/operatorMocks";

export function AlertCenterTab() {
  const [alerts, setAlerts] = useState(demoOperatorAlerts);
  const [selectedAlert, setSelectedAlert] = useState(demoOperatorAlerts[0]?.id);

  const activeAlert = alerts.find(a => a.id === selectedAlert);

  const handleAction = (id: string, newStatus: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Alert List */}
      <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-4 overflow-auto pb-4">
        <h2 className="text-lg font-semibold text-foreground px-1">Alert Inbox</h2>
        
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            onClick={() => setSelectedAlert(alert.id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedAlert === alert.id 
                ? 'bg-muted border-primary shadow-sm' 
                : 'bg-card hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                alert.severity === 'warning' ? 'bg-warning/20 text-warning' : 'bg-caution/20 text-caution'
              }`}>
                {alert.severity}
              </span>
              <span className="text-xs text-muted-foreground">{alert.time}</span>
            </div>
            <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-foreground">{alert.title}</h4>
            <p className="text-xs text-muted-foreground">{alert.location}</p>
            
            <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs">
              <span className={`font-semibold uppercase tracking-wider ${
                alert.status === 'open' ? 'text-warning' : 
                alert.status === 'resolved' ? 'text-safe' : 'text-primary'
              }`}>
                {alert.status}
              </span>
              <span className="font-mono text-muted-foreground">{alert.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Details Workflow */}
      {activeAlert && (
        <div className="flex-1 rounded-xl border bg-card p-6 shadow-sm overflow-auto flex flex-col">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  activeAlert.severity === 'warning' ? 'bg-warning text-warning-foreground' : 'bg-caution text-caution-foreground'
                }`}>
                  <AlertTriangle className="size-3.5" />
                  {activeAlert.severity}
                </span>
                <span className="font-mono text-muted-foreground text-sm">{activeAlert.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{activeAlert.title}</h2>
              <p className="text-muted-foreground mt-1">{activeAlert.location} · Detected {activeAlert.time}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Evidence Panel</h3>
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-foreground/80">Corroborating Sensors</span>
                  <span className="font-mono font-medium">{activeAlert.evidence.sensors} nodes</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-foreground/80">Signal Persistence</span>
                  <span className="font-medium text-warning">{activeAlert.evidence.persistence}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-foreground/80">Tilt Trend</span>
                  <span className="font-medium">{activeAlert.evidence.tiltTrend}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-foreground/80">Displacement Trend</span>
                  <span className="font-medium">{activeAlert.evidence.displacement}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Workflow State</h3>
              
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${activeAlert.status === 'open' ? 'bg-warning/10 border-warning/30' : 'bg-muted'}`}>
                  <div className={`size-6 rounded-full flex items-center justify-center ${activeAlert.status !== 'open' ? 'bg-safe text-safe-foreground' : 'bg-warning text-warning-foreground'}`}>
                    {activeAlert.status !== 'open' ? <CheckCircle2 className="size-4" /> : <span className="text-xs font-bold">1</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Acknowledge Alert</p>
                  </div>
                  {activeAlert.status === 'open' && (
                    <button 
                      onClick={() => handleAction(activeAlert.id, 'acknowledged')}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${activeAlert.status === 'acknowledged' ? 'bg-primary/10 border-primary/30' : 'bg-muted'}`}>
                  <div className={`size-6 rounded-full flex items-center justify-center ${activeAlert.status === 'investigating' || activeAlert.status === 'resolved' ? 'bg-safe text-safe-foreground' : 'bg-muted-foreground/30'}`}>
                    {activeAlert.status === 'investigating' || activeAlert.status === 'resolved' ? <CheckCircle2 className="size-4" /> : <span className="text-xs font-bold">2</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Investigate Zone</p>
                  </div>
                  {activeAlert.status === 'acknowledged' && (
                    <button 
                      onClick={() => handleAction(activeAlert.id, 'investigating')}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded"
                    >
                      Assign
                    </button>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${activeAlert.status === 'investigating' ? 'bg-primary/10 border-primary/30' : 'bg-muted'}`}>
                  <div className={`size-6 rounded-full flex items-center justify-center ${activeAlert.status === 'resolved' ? 'bg-safe text-safe-foreground' : 'bg-muted-foreground/30'}`}>
                    {activeAlert.status === 'resolved' ? <CheckCircle2 className="size-4" /> : <span className="text-xs font-bold">3</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Resolve & Record</p>
                  </div>
                  {activeAlert.status === 'investigating' && (
                    <button 
                      onClick={() => handleAction(activeAlert.id, 'resolved')}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-auto border-t pt-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
              <Map className="size-4" /> View on Map
            </button>
            <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
              <FileText className="size-4" /> Generate Incident Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

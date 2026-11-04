import { useState } from "react";
import { AlertTriangle, Activity, Bell, Info, ShieldAlert, Cpu, BrainCircuit } from "lucide-react";
import { demoOperatorAlerts } from "@/data/operatorMocks";

export function AlertsTab() {
  const [selectedAlertId, setSelectedAlertId] = useState(demoOperatorAlerts[0].id);
  const selectedAlert = demoOperatorAlerts.find(a => a.id === selectedAlertId) || demoOperatorAlerts[0];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Explainable Alerts (PROTOTYPE)</h2>
        <p className="text-sm text-muted-foreground mt-1">Investigate anomalous events and review corroborating evidence.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2 h-full">
        {/* Alert Queue */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex-1 overflow-auto space-y-3 pr-2">
            {demoOperatorAlerts.map(alert => (
              <div 
                key={alert.id} 
                onClick={() => setSelectedAlertId(alert.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedAlertId === alert.id ? 'bg-card border-primary ring-1 ring-primary shadow-md' : 'bg-card hover:border-primary/50 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    alert.severity === 'critical' ? 'bg-critical/20 text-critical' : 'bg-warning/20 text-warning'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{alert.time}</span>
                </div>
                <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-muted-foreground">{alert.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability Evidence Panel */}
        <div className="flex-1 rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`p-2 rounded-lg ${
                    selectedAlert.severity === 'critical' ? 'bg-critical/20 text-critical' : 'bg-warning/20 text-warning'
                  }`}>
                    <AlertTriangle className="size-5" />
                  </span>
                  <h3 className="text-xl font-bold">{selectedAlert.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-mono">{selectedAlert.id}</span>
                  <span>·</span>
                  <span>{selectedAlert.location}</span>
                  <span>·</span>
                  <span>Detected {selectedAlert.time}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-auto space-y-6">
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
              <h4 className="flex items-center gap-2 font-bold text-primary mb-3">
                <BrainCircuit className="size-5" /> AI Explainability Summary
              </h4>
              <p className="text-sm leading-relaxed">
                "{selectedAlert.location} has been flagged because {selectedAlert.evidence.sensors} neighbouring sensors show {selectedAlert.evidence.persistence} of abnormal behaviour. The primary driver is a {selectedAlert.evidence.tiltTrend.toLowerCase()}, while {selectedAlert.evidence.health.toLowerCase()}."
              </p>
              <div className="mt-4 pt-4 border-t border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider">
                Recommendation: Requires Engineering Investigation
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Corroborating Evidence Matrix</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="border rounded-lg p-4 bg-card">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-2">
                    <Activity className="size-4" /> Spatial Agreement
                  </span>
                  <p className="text-sm font-medium">{selectedAlert.evidence.sensors} nodes confirming anomaly</p>
                </div>
                
                <div className="border rounded-lg p-4 bg-card">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-2">
                    <Activity className="size-4" /> Temporal Persistence
                  </span>
                  <p className="text-sm font-medium">{selectedAlert.evidence.persistence}</p>
                </div>

                <div className="border rounded-lg p-4 bg-card">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-2">
                    <Activity className="size-4" /> Deformation Trend
                  </span>
                  <p className="text-sm font-medium text-warning">{selectedAlert.evidence.tiltTrend}</p>
                </div>

                <div className="border rounded-lg p-4 bg-card">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-2">
                    <Cpu className="size-4" /> Hardware Health
                  </span>
                  <p className="text-sm font-medium text-safe">{selectedAlert.evidence.health}</p>
                </div>

              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
              <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This evidence matrix was generated by the prototype multi-variate anomaly detection model running on the Main Edge Gateway. It correlates spatial nodes within a 50m radius and applies a dynamic temporal baseline to reduce false positives.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

import { Activity, Bell, Radio, ShieldAlert, Wifi, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { MapContainer } from "@/components/common/Panels";
import { MapCore } from "@/components/gis/MapCore";
import { useLiveKpi, useLiveAlerts, useKmlSensorNodes } from "@/hooks/useLiveMonitoring";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const severityBadge: Record<string, string> = {
  warning: "bg-red-100 text-red-700",
  watch:   "bg-amber-100 text-amber-700",
  info:    "bg-green-100 text-green-700",
};

const statusBadge: Record<string, string> = {
  open:         "bg-red-100 text-red-700",
  acknowledged: "bg-blue-100 text-blue-700",
  resolved:     "bg-green-100 text-green-700",
};

export function OverviewTab() {
  const { data: kpi,     loading: kpiLoading   } = useLiveKpi();
  const { data: alerts,  loading: alertLoading  } = useLiveAlerts();
  const { data: nodes,   loading: nodesLoading  } = useKmlSensorNodes();

  // Compact cards on mobile (below sm = 640px)
  const isMobile = !useMediaQuery("(min-width: 640px)");

  // Top 8 nodes for the table
  const topNodes = nodes.slice(0, 8);

  // Derive mine risk from live data
  const warningCount = nodes.filter((n) => n.status === "Warning").length;
  const mineRisk     = warningCount > 5 ? "WARNING" : warningCount > 0 ? "WATCH" : "NORMAL";
  const riskColor    = mineRisk === "WARNING" ? "#ef4444" : mineRisk === "WATCH" ? "#f59e0b" : "#22c55e";
  const riskBg       = mineRisk === "WARNING" ? "#fef2f2" : mineRisk === "WATCH" ? "#fffbeb" : "#f0fdf4";
  const riskText     = mineRisk === "WARNING" ? "text-red-600" : mineRisk === "WATCH" ? "text-amber-600" : "text-green-600";

  const activeWarnings = alerts.filter((a) => a.severity === "warning").length;
  const latestAlert    = alerts[0];

  return (
    <div className="space-y-5">

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      {/* Mobile: 2-col compact; sm+: 4-col full size */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <KpiCard
          label="Current Mine Risk"
          value={kpiLoading ? "—" : mineRisk}
          icon={AlertTriangle}
          hint={kpiLoading ? "Loading…" : `${warningCount} nodes in warning`}
          iconColor={riskColor}
          iconBg={riskBg}
          valueClassName={riskText}
          compact={isMobile}
        />
        <KpiCard
          label="Active Warnings"
          value={alertLoading ? "—" : activeWarnings}
          icon={Bell}
          hint="Requires acknowledgment"
          iconColor="#ef4444"
          iconBg="#fef2f2"
          valueClassName="text-red-600"
          compact={isMobile}
        />
        <KpiCard
          label="High-Risk Zones"
          value={kpiLoading ? "—" : kpi.activeAlertZones}
          icon={ShieldAlert}
          hint="From live anomaly data"
          iconColor="#ef4444"
          iconBg="#fef2f2"
          valueClassName="text-red-600"
          compact={isMobile}
        />
        <KpiCard
          label="Latest Alert"
          value={alertLoading || !latestAlert ? "None" : latestAlert.time}
          icon={Clock}
          hint={latestAlert ? latestAlert.location : "All clear"}
          iconColor="#6366f1"
          iconBg="#eef2ff"
          compact={isMobile}
        />
        <KpiCard
          label="Sensor Nodes Online"
          value={kpiLoading ? "—" : kpi.activeNodes}
          icon={Radio}
          hint={kpiLoading ? "—" : `of ${kpi.deployedNodes} deployed`}
          iconColor="#22c55e"
          iconBg="#f0fdf4"
          valueClassName="text-green-600"
          compact={isMobile}
        />
        <KpiCard
          label="Nodes Offline"
          value={kpiLoading ? "—" : kpi.offlineSensors}
          icon={Radio}
          hint="Status: Warning"
          iconColor="#64748b"
          iconBg="#f8fafc"
          compact={isMobile}
        />
        <KpiCard
          label="Network Health"
          value={kpiLoading ? "—" : `${kpi.networkHealth}%`}
          icon={Wifi}
          hint={kpiLoading ? "—" : kpi.networkHealth > 95 ? "Excellent" : kpi.networkHealth > 85 ? "Good" : "Degraded"}
          iconColor="#22c55e"
          iconBg="#f0fdf4"
          valueClassName="text-green-600"
          compact={isMobile}
        />
        <KpiCard
          label="Principal Nodes"
          value={kpiLoading ? "—" : kpi.principalNodes}
          icon={Activity}
          hint="PN1 – PN4 all online"
          iconColor="#3b82f6"
          iconBg="#eff6ff"
          compact={isMobile}
        />
      </div>

      {/* ── Map + Alerts row ─────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <MapContainer
            title="Mine Overview"
            description="GIS map — live KML layers: boundary, panels, risk zones, sensor nodes."
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            heightClassName="h-[300px] sm:h-[480px]"
          >
            <MapCore />
          </MapContainer>
        </div>

        {/* Recent Alerts — live from Supabase */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Recent Alerts</h3>
            <div className="flex items-center gap-2">
              {alertLoading && <RefreshCw className="size-3 text-blue-400 animate-spin" />}
              <span className="text-xs text-gray-400">{alerts.length} active</span>
            </div>
          </div>
          <div className="flex-1 divide-y divide-gray-100 overflow-auto">
            {alerts.length === 0 && !alertLoading && (
              <div className="px-5 py-6 text-center text-xs text-gray-400">No active alerts</div>
            )}
            {alerts.map((alert) => (
              <div key={alert.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{alert.id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityBadge[alert.severity] ?? "bg-gray-100 text-gray-600"}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 leading-snug">{alert.title}</p>
                <p className="text-xs text-gray-400 mt-1">{alert.location} · {alert.time}</p>
                <div className="mt-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusBadge[alert.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KML Sensor Node table (live from Supabase) ───────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Sensor Network Status</h3>
          <div className="flex items-center gap-2">
            {nodesLoading && <RefreshCw className="size-3 text-blue-400 animate-spin" />}
            <span className="text-xs text-gray-400">
              Showing {topNodes.length} of {nodes.length} nodes
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 text-left">Node ID</th>
                <th className="px-5 py-3 text-left">Principal Node</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-right">Reading</th>
                <th className="px-5 py-3 text-right">Battery %</th>
                <th className="px-5 py-3 text-right">Signal %</th>
                <th className="px-5 py-3 text-left">Last Update</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nodesLoading && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-xs text-gray-400">
                    <RefreshCw className="size-4 animate-spin inline mr-2 text-blue-400" />
                    Loading live sensor data…
                  </td>
                </tr>
              )}
              {!nodesLoading && topNodes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-xs text-gray-400">
                    No sensor data — run seed_v2.sql in Supabase dashboard.
                  </td>
                </tr>
              )}
              {topNodes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-gray-700">{s.id}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {s.pnId}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{s.type}</td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700">
                    {s.latestReading.toFixed(2)} {s.unit}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-mono font-semibold ${s.batteryPct < 20 ? "text-red-600" : "text-gray-700"}`}>
                      {s.batteryPct}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700">{s.signalPct}%</td>
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{s.lastReadingAt}</td>
                  <td className="px-5 py-3 text-center">
                    {s.status === "Normal" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-700">
                        <CheckCircle className="size-3" /> Normal
                      </span>
                    ) : s.status === "Warning" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                        <XCircle className="size-3" /> Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        <AlertTriangle className="size-3" /> Watch
                      </span>
                    )}
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

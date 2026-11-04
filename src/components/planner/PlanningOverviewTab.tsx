import { Layers, Map, TrendingUp, AlertTriangle, ShieldAlert, Target, CheckCircle } from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { MapContainer } from "@/components/common/Panels";
import { plannerKpis, plannerPanelComparison, plannerScenarios } from "@/data/plannerMocks";
import { MapCore } from "@/components/gis/MapCore";

const riskBadge: Record<string, string> = {
  WARNING: "bg-red-100 text-red-700",
  WATCH: "bg-amber-100 text-amber-700",
  NORMAL: "bg-green-100 text-green-700",
};

const severityBadge: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export function PlanningOverviewTab() {
  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Panels Monitored"
          value={plannerKpis.panelsMonitored}
          icon={Layers}
          hint="Active and sealed"
          iconColor="#3b82f6"
          iconBg="#eff6ff"
        />
        <KpiCard
          label="Monitoring Coverage"
          value={plannerKpis.coverage}
          unit="%"
          icon={Map}
          hint="Total mine surface"
          iconColor="#22c55e"
          iconBg="#f0fdf4"
          valueClassName="text-green-600"
        />
        <KpiCard
          label="Increasing Risk Panels"
          value={plannerKpis.panelsIncreasingRisk}
          icon={TrendingUp}
          hint="P-12 and P-11"
          iconColor="#f59e0b"
          iconBg="#fffbeb"
          valueClassName="text-amber-600"
        />
        <KpiCard
          label="Historical Alerts"
          value={plannerKpis.historicalAlerts}
          icon={AlertTriangle}
          hint="YTD Total"
          iconColor="#6366f1"
          iconBg="#eef2ff"
        />
        <KpiCard
          label="Sensor Coverage Gaps"
          value={plannerKpis.sensorGaps}
          icon={ShieldAlert}
          hint="Identified unmonitored zones"
          iconColor="#f59e0b"
          iconBg="#fffbeb"
          valueClassName="text-amber-600"
        />
        <KpiCard
          label="Priority Review Areas"
          value={plannerKpis.priorityReviewAreas}
          icon={Target}
          hint="Action required"
          iconColor="#ef4444"
          iconBg="#fef2f2"
          valueClassName="text-red-600"
        />
      </div>

      {/* Map + Scenarios */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapContainer
            title="Strategic Mine Overview"
            description="Showing structural gaps and historical risk zones."
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            heightClassName="h-[300px] sm:h-[420px]"
          >
            <MapCore />
          </MapContainer>
        </div>

        {/* Planning Scenarios */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Planning Scenarios</h3>
            <p className="text-xs text-gray-400 mt-0.5">AI-generated risk intelligence</p>
          </div>
          <div className="flex-1 divide-y divide-gray-100 overflow-auto">
            {plannerScenarios.map((sc) => (
              <div key={sc.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400">{sc.id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityBadge[sc.severity] ?? "bg-gray-100 text-gray-600"}`}>
                    {sc.severity}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 leading-snug">{sc.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sc.description}</p>
                <div className="mt-3 p-2.5 bg-blue-50 rounded text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">Recommendation: </span>{sc.recommendation}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">{sc.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel comparison table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Panel Comparison</h3>
          <p className="text-xs text-gray-400 mt-0.5">Risk and monitoring status across all panels</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 text-left">Panel</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-right">Depth</th>
                <th className="px-5 py-3 text-right">Sensors</th>
                <th className="px-5 py-3 text-right">Coverage</th>
                <th className="px-5 py-3 text-right">Deformation</th>
                <th className="px-5 py-3 text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plannerPanelComparison.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-gray-800">{p.id}</td>
                  <td className="px-5 py-3 text-gray-600">{p.status}</td>
                  <td className="px-5 py-3 text-gray-600">{p.method}</td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700">{p.depth}</td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700">{p.sensorCount}</td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700">{p.coverage}</td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700">{p.deformationTrend}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${riskBadge[p.currentRisk] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.currentRisk}
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

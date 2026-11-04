import { useState } from "react";
import {
  Layers,
  ChevronDown,
  MoreHorizontal,
  Wifi,
  Clock,
  AlertTriangle,
  Activity,
  ExternalLink,
  Network,
  RefreshCw,
  MapPin,
  Zap,
  Radio,
} from "lucide-react";import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  RadialBarChart,
  RadialBar,
  Cell,
} from "recharts";
import {
  demoAlertZones,
  demoRecentEvents,
  demoElevationProfile,
} from "@/data/operatorMocks";
import { MapCore } from "@/components/gis/MapCore";
import {
  useLiveKpi,
  usePrincipleNodes,
  useDeformationChart,
  useLiveAlerts,
  useLiveAnomalies,
  useSensorHealth,
  fetchNodeDetail,
  type PrincipleNode,
  type SelectedNodeData,
} from "@/hooks/useLiveMonitoring";
import { useHighRiskZone, classifyRisk } from "@/hooks/useHighRiskZone";

/* ─────────────────────────────────────────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────────────────────────────────────────── */

/** Thin coloured progress bar */
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Inline status dot */
function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. KPI STRIP — 5 cards
───────────────────────────────────────────────────────────────────────────── */

function KpiStrip() {
  const { data: k, loading, error, refetch } = useLiveKpi();

  const cards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="size-7 shrink-0" fill="none" stroke="#2563eb" strokeWidth={1.8}>
          <circle cx="9" cy="7" r="2" /><circle cx="15" cy="7" r="2" />
          <circle cx="6" cy="17" r="2" /><circle cx="12" cy="17" r="2" /><circle cx="18" cy="17" r="2" />
          <line x1="9" y1="9" x2="6" y2="15" /><line x1="9" y1="9" x2="12" y2="15" />
          <line x1="15" y1="9" x2="12" y2="15" /><line x1="15" y1="9" x2="18" y2="15" />
        </svg>
      ),
      iconBg: "#eff6ff",
      value: loading ? "—" : String(k.activeNodes),
      label: "Active Nodes",
      sub: loading ? "Loading…" : `/ ${k.deployedNodes} Deployed`,
      bar: { pct: loading ? 0 : (k.activeNodes / Math.max(k.deployedNodes, 1)) * 100, color: "#2563eb" },
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="size-7 shrink-0" fill="none" stroke="#059669" strokeWidth={1.8}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      iconBg: "#ecfdf5",
      value: loading ? "—" : String(k.principalNodes),
      label: "Principal Nodes",
      sub: "PN1 – PN4",
      bar: { pct: 100, color: "#059669" },
    },
    {
      icon: <Activity className="size-7 shrink-0 text-emerald-500" />,
      iconBg: "#f0fdf4",
      value: loading ? "—" : `${k.networkHealth}%`,
      label: "Network Health",
      sub: loading ? "—" : (k.networkHealth > 95 ? "Excellent" : k.networkHealth > 85 ? "Good" : "Degraded"),
      bar: { pct: loading ? 0 : k.networkHealth, color: "#10b981" },
    },
    {
      icon: <Clock className="size-7 shrink-0 text-blue-500" />,
      iconBg: "#eff6ff",
      value: loading ? "—" : `${k.avgLatencyMs} ms`,
      label: "Avg. Latency",
      sub: "Mesh Network",
      bar: { pct: loading ? 0 : Math.max(0, 100 - k.avgLatencyMs * 3), color: "#3b82f6" },
    },
    {
      icon: <AlertTriangle className="size-7 shrink-0 text-red-500" />,
      iconBg: "#fef2f2",
      value: loading ? "—" : String(k.activeAlertZones),
      label: "Active Alert Zones",
      sub: loading ? "—" : (k.activeAlertZones > 0 ? "Requires attention" : "All clear"),
      bar: { pct: loading ? 0 : (k.activeAlertZones / 5) * 100, color: "#ef4444" },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, idx) => (
        <div
          key={c.label}
          className={`bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-start gap-3 hover:shadow-md transition-shadow${
            /* On mobile (2-col), 5 cards → last card is alone; span it full width */
            idx === 4 ? " col-span-2 sm:col-span-1" : ""
          }`}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ backgroundColor: c.iconBg }}>
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-extrabold text-gray-800 font-mono leading-tight tracking-tight">
              {c.value}
            </p>
            <p className="text-[11px] font-semibold text-gray-700 leading-tight mt-0.5">{c.label}</p>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{c.sub}</p>
            <ProgressBar pct={c.bar.pct} color={c.bar.color} />
          </div>
        </div>
      ))}
      {error && (
        <div className="col-span-full flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Live data unavailable — showing last known values.</span>
          <button onClick={refetch} className="ml-auto flex items-center gap-1 font-semibold hover:text-amber-900">
            <RefreshCw className="size-3" /> Retry
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. MAP LEGEND
───────────────────────────────────────────────────────────────────────────── */

const MAP_LEGEND_ITEMS = [
  { symbol: "dot",    color: "#3b82f6", label: "Sensor Node (Online)"          },
  { symbol: "dot",    color: "#9ca3af", label: "Sensor Node (Offline)"         },
  { symbol: "wifi",   color: "#10b981", label: "Principal Node (PN1 – PN4)"    },
  { symbol: "line",   color: "#60a5fa", label: "Mesh Link (Communication)"     },
  { symbol: "rect",   color: "#1e293b", label: "Mine Boundary"                 },
  { symbol: "circle", color: "#f59e0b", label: "Alert Zone (Anomaly)"          },
  { symbol: "circle", color: "#ef4444", label: "Alert Zone (High Risk)"        },
  { symbol: "rect",   color: "#374151", label: "Satellite Imagery (Base Map)"  },
];

function LegendSymbol({ symbol, color }: { symbol: string; color: string }) {
  if (symbol === "dot")
    return <span className="inline-block size-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />;
  if (symbol === "wifi")
    return (
      <span
        className="inline-flex items-center justify-center size-4 rounded-full shrink-0 border-2"
        style={{ borderColor: color, backgroundColor: color + "22" }}
      >
        <Wifi className="size-2.5" style={{ color }} />
      </span>
    );
  if (symbol === "line")
    return <span className="inline-block w-4 h-0.5 rounded shrink-0" style={{ backgroundColor: color }} />;
  if (symbol === "circle")
    return (
      <span
        className="inline-block size-3 rounded-full shrink-0 border-2 opacity-80"
        style={{ borderColor: color, backgroundColor: color + "33" }}
      />
    );
  // rect
  return <span className="inline-block w-3.5 h-2.5 rounded-sm shrink-0 border" style={{ borderColor: color, backgroundColor: color + "22" }} />;
}

function MapLegend({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-bold text-gray-800">Map Legend</span>
        <ChevronDown
          className="size-3.5 text-gray-400 transition-transform duration-200"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        />
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2 border-t border-gray-100">
          {MAP_LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <LegendSymbol symbol={item.symbol} color={item.color} />
              <span className="text-[11px] text-gray-600 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. SELECTED NODE PANEL  (rich graphical version)
───────────────────────────────────────────────────────────────────────────── */

/** Radial gauge — fills a circle segment from bottom-left to bottom-right */
function RadialGauge({
  pct,
  color,
  size = 80,
  label,
  value,
}: {
  pct: number;
  color: string;
  size?: number;
  label: string;
  value: string;
}) {
  const data = [{ value: Math.min(Math.max(pct, 0), 100) }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <RadialBarChart
          width={size}
          height={size}
          innerRadius={size * 0.34}
          outerRadius={size * 0.48}
          data={data}
          startAngle={210}
          endAngle={-30}
          barSize={size * 0.14}
        >
          {/* Track */}
          <RadialBar dataKey="value" background={{ fill: "#f1f5f9" }} cornerRadius={99} isAnimationActive={false} data={[{ value: 100 }]}>
            <Cell fill="#e2e8f0" />
          </RadialBar>
          {/* Fill */}
          <RadialBar dataKey="value" cornerRadius={99} isAnimationActive>
            <Cell fill={color} />
          </RadialBar>
        </RadialBarChart>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: 6 }}>
          <span className="text-[13px] font-extrabold leading-none tabular-nums" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

/** Segmented horizontal bar */
function SegBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  const segments = 20;
  const filled = Math.round((pct / 100) * segments);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">{label}</span>
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{pct}%</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-[2px] transition-all duration-500"
            style={{ backgroundColor: i < filled ? color : "#e5e7eb" }}
          />
        ))}
      </div>
    </div>
  );
}

/** Signal strength tower bars */
function SignalTower({ pct }: { pct: number }) {
  const bars   = pct > 80 ? 5 : pct > 60 ? 4 : pct > 40 ? 3 : pct > 20 ? 2 : 1;
  const dbm    = Math.round((pct / 100) * 70 - 100);
  const color  = pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";
  const label  = pct > 60 ? "Strong" : pct > 30 ? "Moderate" : "Weak";
  return (
    <div className="flex items-end gap-1.5">
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4, 5].map((b) => (
          <div
            key={b}
            className="w-2 rounded-[2px] transition-colors"
            style={{ height: `${b * 5 + 4}px`, backgroundColor: b <= bars ? color : "#e5e7eb" }}
          />
        ))}
      </div>
      <div className="mb-0.5">
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{dbm} dBm</span>
        <span className="text-[10px] text-gray-400 ml-1">· {label}</span>
      </div>
    </div>
  );
}

function SelectedNodePanel({ node, polygons }: { node: SelectedNodeData | null; polygons: import("geojson").Feature[] }) {
  const n = node ?? {
    id: "—", label: "—", type: "—", status: "—",
    lat: 0, lon: 0, pnId: "—",
    batteryPct: 0, signalPct: 0,
    latestReading: 0, unit: "—",
    connectedNodes: 0, networkRole: "—", lastUpdate: "—",
  };

  const battColor = n.batteryPct > 50 ? "#22c55e" : n.batteryPct > 20 ? "#f59e0b" : "#ef4444";
  const sigColor  = n.signalPct  > 60 ? "#3b82f6" : n.signalPct  > 30 ? "#f59e0b" : "#ef4444";
  const risk      = node ? classifyRisk(node.lat, node.lon, polygons) : "none";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="size-3 text-blue-500" />
          <span className="text-xs font-bold text-gray-700 tracking-tight">Selected Node</span>
        </div>
        <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
          <MoreHorizontal className="size-3.5 text-gray-400" />
        </button>
      </div>

      {!node ? (
        /* ── Empty state ─────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-8 px-4 gap-2 text-center">
          <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Wifi className="size-5 text-gray-300" />
          </div>
          <p className="text-xs font-semibold text-gray-400">No node selected</p>
          <p className="text-[10px] text-gray-300 leading-relaxed">Click any node on the map</p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 scrollbar-thin">

          {/* ── Identity ─────────────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className={`flex size-10 items-center justify-center rounded-lg shrink-0 ${
                (n.status === "Online" || n.status === "Normal") ? "bg-green-100"  :
                (n.status === "Degraded" || n.status === "Watch") ? "bg-amber-100" : "bg-red-100"
              }`}>
                <Wifi className={`size-4.5 ${
                  (n.status === "Online" || n.status === "Normal") ? "text-green-600"  :
                  (n.status === "Degraded" || n.status === "Watch") ? "text-amber-600" : "text-red-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-gray-900 font-mono leading-tight truncate">{n.id}</p>
                <p className="text-[10px] text-gray-400 leading-tight truncate">{n.label}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                (n.status === "Online" || n.status === "Normal")
                  ? "text-green-700 bg-green-50 border-green-200"
                  : (n.status === "Degraded" || n.status === "Watch")
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : "text-red-700 bg-red-50 border-red-200"
              }`}>
                <span className={`size-1.5 rounded-full shrink-0 ${
                  (n.status === "Online" || n.status === "Normal") ? "bg-green-500 animate-pulse"
                  : (n.status === "Degraded" || n.status === "Watch") ? "bg-amber-500"
                  : "bg-red-500"
                }`} />
                {n.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{n.type}</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{n.networkRole}</span>
            </div>
          </div>

          {/* ── Risk Zone Banner ─────────────────────────────────── */}
          {risk !== "none" && (
            <div className={`mx-3 mt-2.5 flex items-start gap-2 rounded-lg px-3 py-2 border ${
              risk === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}>
              <AlertTriangle className={`size-3.5 shrink-0 mt-0.5 ${risk === "high" ? "text-red-500" : "text-amber-500"}`} />
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-wide ${risk === "high" ? "text-red-700" : "text-amber-700"}`}>
                  {risk === "high" ? "High Risk Zone" : "Anomaly Zone"}
                </p>
                <p className={`text-[10px] leading-snug mt-0.5 ${risk === "high" ? "text-red-500" : "text-amber-500"}`}>
                  {risk === "high"
                    ? "Critical subsidence area. Immediate inspection advised."
                    : "Anomaly zone. Elevated monitoring recommended."}
                </p>
              </div>
            </div>
          )}

          {/* ── Gauges row ───────────────────────────────────────── */}
          <div className="px-4 pt-3 pb-3 border-b border-gray-100">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Live Metrics</p>
            <div className="flex items-start justify-around gap-1">
              <RadialGauge pct={n.batteryPct} color={battColor} label="Battery" value={`${n.batteryPct}%`} size={80} />
              <RadialGauge pct={n.signalPct}  color={sigColor}  label="Signal"  value={`${n.signalPct}%`}  size={80} />
              {n.connectedNodes > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="size-[80px] flex flex-col items-center justify-center rounded-full border-4 border-purple-100 bg-purple-50">
                    <span className="text-xl font-extrabold text-purple-600 leading-none">{n.connectedNodes}</span>
                    <span className="text-[9px] text-purple-400 font-bold mt-0.5">sensors</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Nodes</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Bar metrics ──────────────────────────────────────── */}
          <div className="px-4 pt-2.5 pb-2.5 border-b border-gray-100 space-y-2.5">
            <SegBar pct={n.batteryPct} color={battColor} label="Battery Level" />
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500">Signal Strength</span>
              <SignalTower pct={n.signalPct} />
            </div>
          </div>

          {/* ── Info rows ────────────────────────────────────────── */}
          <div className="px-4 py-2.5 space-y-2">
            {/* Location — full width */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
              <MapPin className="size-3 text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-gray-400 leading-none">Location</p>
                <p className="text-[11px] font-bold font-mono text-gray-700 truncate">{n.lat.toFixed(5)}, {n.lon.toFixed(5)}</p>
              </div>
            </div>
            {/* Last Seen + PN Group side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <Clock className="size-3 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-400 leading-none">Last Seen</p>
                  <p className="text-[10px] font-bold text-gray-700 truncate">{n.lastUpdate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <Network className="size-3 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-400 leading-none">PN Group</p>
                  <p className="text-[10px] font-bold font-mono text-gray-700 truncate">{n.pnId}</p>
                </div>
              </div>
            </div>
            {/* Latest reading if present */}
            {n.latestReading !== 0 && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2.5 py-1.5">
                <Zap className="size-3 text-blue-400 shrink-0" />
                <div>
                  <p className="text-[9px] text-blue-400 leading-none">Latest Reading</p>
                  <p className="text-[11px] font-bold font-mono text-blue-700">{n.latestReading} {n.unit}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. FULL MAP SECTION (map + right sidebar)
───────────────────────────────────────────────────────────────────────────── */

function MapSection() {
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const { data: pnNodes } = usePrincipleNodes();
  const { isInRisk, polygons } = useHighRiskZone();

  const handleNodeClick = async (nodeId: string) => {
    const data = await fetchNodeDetail(nodeId);
    if (data) setSelectedNode(data);
  };

  return (
    /* Stack vertically on mobile, side-by-side on lg+ */
    <div className="flex flex-col lg:flex-row gap-3 lg:min-h-[520px]">

      {/* ── Map — 360px on mobile, fills full height on desktop ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-w-0 lg:flex-1 h-[360px] lg:h-auto">
        <div className="relative flex-1 h-full">
          <MapCore
            onPanelClick={handleNodeClick}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* ── Right panel — full width on mobile, fixed 288px on desktop ── */}
      <div className="flex flex-col gap-2 lg:w-72 lg:shrink-0 lg:h-[520px]">

        {/* Principal Nodes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2.5 shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Principal Nodes</p>
          {/* Mobile: 2-col grid. Desktop: single column list */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
            {pnNodes.map((pn) => {
              const risk = classifyRisk(pn.lat, pn.lon, polygons);
              return (
                <button
                  key={pn.id}
                  onClick={() => handleNodeClick(pn.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedNode?.id === pn.id
                      ? "bg-blue-50 border border-blue-200"
                      : risk !== "none"
                      ? "bg-red-50 border border-red-100 hover:bg-red-100"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span className="font-bold text-gray-700 font-mono flex items-center gap-1 shrink-0">
                    {risk !== "none" && (
                      <AlertTriangle className={`size-2.5 shrink-0 ${risk === "high" ? "text-red-500" : "text-amber-500"}`} />
                    )}
                    {pn.id}
                  </span>
                  <span className="text-gray-400 text-[10px] flex-1 text-center">{pn.connectedSensors} nodes</span>
                  {risk !== "none" ? (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      risk === "high"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-amber-100 text-amber-700 border border-amber-300"
                    }`}>
                      {risk === "high" ? "🔴 High" : "🟡 Watch"}
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      pn.status === "Online" ? "bg-green-50 text-green-700"
                      : pn.status === "Degraded" ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                    }`}>
                      <Dot color={pn.status === "Online" ? "#22c55e" : pn.status === "Degraded" ? "#f59e0b" : "#ef4444"} />
                      {pn.status}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected node panel */}
        <SelectedNodePanel node={selectedNode} polygons={polygons} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. ELEVATION PROFILE
───────────────────────────────────────────────────────────────────────────── */

function DeformationChart() {
  const { data, loading, error } = useDeformationChart();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[360px]">
      <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Live Deformation Trend</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Per Principal Node — last 60 min</p>
        </div>
        {loading && <RefreshCw className="size-3.5 text-blue-400 animate-spin" />}
        {error  && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Fallback data</span>}
      </div>
      {/* Chart fills all remaining height */}
      <div className="flex-1 min-h-0 px-2 pt-3 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {[
                {id:"pn1",color:"#3b82f6"},
                {id:"pn2",color:"#10b981"},
                {id:"pn3",color:"#f59e0b"},
                {id:"pn4",color:"#ef4444"},
              ].map(({id,color}) => (
                <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" tick={{fontSize:9,fill:"#94a3b8"}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize:9,fill:"#94a3b8"}} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{fontSize:11,borderRadius:8,border:"1px solid #e2e8f0"}}
              labelStyle={{fontWeight:700,color:"#374151"}}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10,paddingTop:4}} />
            {[
              {key:"pn1",color:"#3b82f6",name:"PN1"},
              {key:"pn2",color:"#10b981",name:"PN2"},
              {key:"pn3",color:"#f59e0b",name:"PN3"},
              {key:"pn4",color:"#ef4444",name:"PN4"},
            ].map(({key,color,name}) => (
              <Area key={key} type="monotone" dataKey={key} name={name}
                stroke={color} strokeWidth={1.5}
                fill={`url(#grad-${key})`}
                dot={false} activeDot={{r:3,strokeWidth:0,fill:color}}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. LIVE ALERTS TABLE  — warnings float to top with pulsing indicator
───────────────────────────────────────────────────────────────────────────── */

type AlertSevCfg = { bg: string; border: string; text: string; dot: string; label: string; leftBar: string };

const ALERT_SEV_CFG: Record<string, AlertSevCfg> = {
  warning: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444", label: "WARNING", leftBar: "#ef4444" },
  watch:   { bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b", label: "WATCH",   leftBar: "#f59e0b" },
  info:    { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e", label: "INFO",    leftBar: "#22c55e" },
};
const ALERT_DEF_SEV: AlertSevCfg = { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e", label: "INFO", leftBar: "#22c55e" };

function LiveAlertsTable() {
  const { data: alerts, loading, refetch } = useLiveAlerts();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll,  setShowAll]  = useState(false);

  // Already sorted by hook: open-warning → open-watch → open-info → acknowledged
  const openWarnings = alerts.filter((a) => a.status === "open" && a.severity === "warning");
  const openOthers   = alerts.filter((a) => a.status === "open" && a.severity !== "warning");
  const acked        = alerts.filter((a) => a.status !== "open");
  const allSorted    = [...openWarnings, ...openOthers, ...acked];
  const visible      = showAll ? allSorted : allSorted.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[360px]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-red-500" />
          <h3 className="text-sm font-bold text-gray-800">Live Alerts</h3>

          {/* Pulsing red badge for open warnings */}
          {openWarnings.length > 0 && (
            <span className="relative flex size-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex items-center justify-center rounded-full size-4 bg-red-500 text-white text-[9px] font-extrabold leading-none">
                {openWarnings.length}
              </span>
            </span>
          )}
          {/* Amber badge for other open alerts (no warnings present) */}
          {openWarnings.length === 0 && openOthers.length > 0 && (
            <span className="text-[10px] font-extrabold bg-amber-400 text-white px-1.5 py-0.5 rounded-full leading-none">
              {openOthers.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {loading && <RefreshCw className="size-3 text-blue-400 animate-spin" />}
          <button
            onClick={refetch}
            title="Refresh"
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="size-3 text-gray-400 hover:text-blue-500 transition-colors" />
          </button>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showAll ? "Show Less" : "View All"} <ExternalLink className="size-3" />
          </button>
        </div>
      </div>

      {/* ── Alert list ─────────────────────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100">

        {/* Empty / loading states */}
        {loading && alerts.length === 0 && (
          <div className="flex items-center justify-center py-8 gap-2">
            <RefreshCw className="size-4 text-blue-400 animate-spin" />
            <span className="text-xs text-gray-400">Loading live alerts…</span>
          </div>
        )}
        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <span className="text-2xl">✅</span>
            <p className="text-xs font-semibold text-gray-400">No active alerts</p>
            <p className="text-[10px] text-gray-300">All zones operating normally</p>
          </div>
        )}

        {visible.map((a) => {
          const s         = ALERT_SEV_CFG[a.severity] ?? ALERT_DEF_SEV;
          const isOpen    = a.status === "open";
          const isWarning = a.severity === "warning" && isOpen;
          const isExp     = expanded === a.id;

          return (
            <div
              key={a.id}
              className={`cursor-pointer transition-all ${!isOpen ? "opacity-70 hover:opacity-100" : ""}`}
              style={{ borderLeft: `3px solid ${isOpen ? s.leftBar : s.leftBar + "66"}` }}
              onClick={() => setExpanded(isExp ? null : a.id)}
            >
              {/* ── Row ── */}
              <div className={`px-4 py-3 hover:bg-gray-50/70 transition-colors ${isWarning ? "bg-red-50/50" : ""}`}>

                {/* Severity badge + status + time */}
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border"
                    style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                  >
                    {isWarning ? (
                      /* Pulsing dot inside badge for high-risk open warnings */
                      <span className="relative flex size-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: s.dot }} />
                        <span className="relative inline-flex size-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      </span>
                    ) : (
                      <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                    )}
                    {s.label}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOpen ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 uppercase tracking-wide">
                        Open
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                        Ack
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-mono">{a.time}</span>
                    <ChevronDown
                      className="size-3 text-gray-400 transition-transform duration-150"
                      style={{ transform: isExp ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </div>
                </div>

                {/* Title */}
                <p className={`text-[12px] font-semibold leading-snug ${isWarning ? "text-red-800" : "text-gray-800"}`}>
                  {a.title}
                </p>

                {/* Location */}
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 truncate">
                  <MapPin className="size-2.5 shrink-0" />
                  {a.location}
                </p>
              </div>

              {/* ── Expanded detail ── */}
              {isExp && (
                <div
                  className="mx-4 mb-3 rounded-lg border px-3 py-2.5 space-y-1.5 text-[11px]"
                  style={{ backgroundColor: s.bg, borderColor: s.border }}
                >
                  <div className="flex justify-between">
                    <span className="text-gray-500">Alert ID</span>
                    <span className="font-mono font-bold text-gray-700">{a.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-semibold text-gray-700 text-right max-w-[160px]">{a.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Severity</span>
                    <span className="font-extrabold uppercase" style={{ color: s.text }}>{s.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-bold ${isOpen ? "text-red-600" : "text-blue-600"}`}>
                      {isOpen ? "Open — Action required" : "Acknowledged"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Detected</span>
                    <span className="font-mono text-gray-700">{a.time}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer — show more */}
        {!showAll && allSorted.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2.5 text-[11px] text-blue-600 font-semibold hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            +{allSorted.length - 5} more alerts — View All
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. RECENT EVENTS TABLE
───────────────────────────────────────────────────────────────────────────── */

const EVENT_HIGHLIGHT: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  red:   { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", icon: "🔴" },
  amber: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "🟡" },
};

function RecentEventsTable() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAll,  setShowAll]  = useState(false);

  const visible = showAll ? demoRecentEvents : demoRecentEvents.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[360px]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-800">Recent Events</h3>
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showAll ? "Show Less" : "View All"} <ExternalLink className="size-3" />
        </button>
      </div>

      {/* Event card list */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
        {visible.map((e, i) => {
          const hl        = e.highlight ? EVENT_HIGHLIGHT[e.highlight] : null;
          const isPN      = e.nodeId.startsWith("PN");
          const isExpanded = expanded === i;
          return (
            <div
              key={i}
              className="cursor-pointer transition-all"
              style={{ borderLeft: `3px solid ${hl ? (e.highlight === "red" ? "#ef4444" : "#f59e0b") : "#e5e7eb"}` }}
              onClick={() => setExpanded(isExpanded ? null : i)}
            >
              {/* Collapsed row */}
              <div className="px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded ${
                    isPN ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className={`size-1.5 rounded-full inline-block ${isPN ? "bg-blue-500" : "bg-emerald-500"}`} />
                    {e.nodeId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400">{e.time}</span>
                    <ChevronDown className={`size-3 text-gray-400 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {hl ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded border"
                    style={{ backgroundColor: hl.bg, color: hl.text, borderColor: hl.border }}>
                    {hl.icon} {e.event}
                  </span>
                ) : (
                  <p className="text-[11px] font-semibold text-gray-700">{e.event}</p>
                )}

                <div className="flex items-center justify-between mt-1 gap-2">
                  <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                    <MapPin className="size-2.5 shrink-0" />{e.zone}
                  </p>
                  <span className="text-[10px] font-mono text-gray-500 shrink-0">{e.details}</span>
                </div>
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="mx-4 mb-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Node</span>
                    <span className={`font-mono font-bold ${isPN ? "text-blue-700" : "text-emerald-700"}`}>{e.nodeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event Type</span>
                    <span className="font-semibold text-gray-700">{e.event}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zone / Location</span>
                    <span className="font-semibold text-gray-700 text-right max-w-[160px]">{e.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reading / Detail</span>
                    <span className="font-mono font-bold text-gray-800">{e.details}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timestamp</span>
                    <span className="font-mono text-gray-700">{e.time}</span>
                  </div>
                  {hl && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Priority</span>
                      <span className="font-bold" style={{ color: hl.text }}>
                        {e.highlight === "red" ? "High — Immediate review" : "Elevated — Monitor closely"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer hint */}
        {!showAll && demoRecentEvents.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-[11px] text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
          >
            +{demoRecentEvents.length - 5} more events — View All
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */

export function LiveMonitoringTab() {
  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      {/* Row 1 — KPI strip */}
      <KpiStrip />
      {/* Row 2 — Map + sidebar */}
      <MapSection />
      {/* Row 3 — Charts & tables, all fixed 360px height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        <DeformationChart />
        <LiveAlertsTable />
        <RecentEventsTable />
      </div>
    </div>
  );
}

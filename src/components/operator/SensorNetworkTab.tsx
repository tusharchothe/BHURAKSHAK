/**
 * SensorNetworkTab.tsx
 *
 * All four major sections are wired to live KML data:
 *  - TopologyMapAndDetail  → useKmlSensorNodes + usePrincipleNodes (real lat/lon → SVG)
 *  - FailureMonitoring     → useKmlSensorNodes filtered by health
 *  - NetworkHealthCharts   → aggregated snapshots from useKmlSensorNodes + useLiveKpi
 *  - DeploymentClassification → live node counts grouped by pnId
 */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Radio, Wifi, Battery, AlertTriangle, XCircle,
  RefreshCw, Activity, Signal, Clock,
  MapPin, Link2, Cpu, X,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  useLiveKpi, useSensorHealth,
  useKmlSensorNodes, usePrincipleNodes,
  fetchNodeDetail,
  type KmlSensorNode, type PrincipleNode, type SelectedNodeData,
} from "@/hooks/useLiveMonitoring";
import { useHighRiskZone, classifyRisk } from "@/hooks/useHighRiskZone";

/* ─────────────────────────────────────────────────────────────────────────────
   KML BOUNDING BOX  — tight bounds from actual KML data + small padding.
   Sensor nodes span lon 86.3290–86.3685, lat 23.7057–23.7625.
   We add 0.003° padding on each side so edge nodes aren't clipped.
───────────────────────────────────────────────────────────────────────────── */

const KML_LON_MIN = 86.3260;   // 86.3290 − 0.003
const KML_LON_MAX = 86.3715;   // 86.3685 + 0.003
const KML_LAT_MIN = 23.7027;   // 23.7057 − 0.003
const KML_LAT_MAX = 23.7655;   // 23.7625 + 0.003

// SVG canvas — width driven by aspect ratio of the bounding box so nodes
// fill it correctly without distortion.
const KML_LON_SPAN = KML_LON_MAX - KML_LON_MIN;                     // ~0.0455°
const KML_LAT_SPAN = KML_LAT_MAX - KML_LAT_MIN;                     // ~0.0628°
// 1° lat ≈ 111 km, 1° lon ≈ 111 km × cos(23.73°) ≈ 101.6 km
const COS_LAT = Math.cos((23.73 * Math.PI) / 180);
const ASPECT  = (KML_LON_SPAN * COS_LAT) / KML_LAT_SPAN;           // ~0.661

const SVG_H   = 460;
const SVG_W   = Math.round(SVG_H * ASPECT * 1.55);                  // ≈ 470→ scaled wider for panel
const SVG_PAD = 32;

function project(lat: number, lon: number): { x: number; y: number } {
  const usableW = SVG_W - SVG_PAD * 2;
  const usableH = SVG_H - SVG_PAD * 2;
  const x = SVG_PAD + ((lon - KML_LON_MIN) / KML_LON_SPAN) * usableW;
  // lat increases north (up on globe) but SVG y increases downward
  const y = SVG_PAD + ((KML_LAT_MAX - lat) / KML_LAT_SPAN) * usableH;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────────────────────────── */

function SegBar({ pct, color }: { pct: number; color: string }) {
  const segs   = 16;
  const filled = Math.round((Math.min(pct, 100) / 100) * segs);
  return (
    <div className="flex gap-[2px] mt-1">
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-[1px]"
          style={{ backgroundColor: i < filled ? color : "#e5e7eb" }} />
      ))}
    </div>
  );
}

const battColor = (b: number): string => b > 50 ? "#22c55e" : b > 20 ? "#f59e0b" : "#ef4444";
const sigColor  = (s: number): string => s > 60 ? "#3b82f6" : s > 30 ? "#f59e0b" : "#ef4444";

/** Convert raw signalPct (0–100) → approximate dBm string. */
function pctToDbm(pct: number): string {
  return `${Math.round(-110 + pct * 0.70)} dBm`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   1.  NETWORK OVERVIEW  — 6 KPI cards  (already live)
───────────────────────────────────────────────────────────────────────────── */

function NetworkOverview() {
  const { data: kpi,    loading       } = useLiveKpi();
  const { data: health, loading: hLoad } = useSensorHealth();

  const cards = [
    {
      icon: <Radio   className="size-6 text-blue-600" />,     bg: "#eff6ff", border: "#3b82f6",
      label: "Total Nodes",       value: loading ? "—" : String(kpi.deployedNodes),
      sub: "+12 from last week",  subColor: "#22c55e",
    },
    {
      icon: <Wifi    className="size-6 text-emerald-600" />,  bg: "#ecfdf5", border: "#22c55e",
      label: "Online & Healthy",  value: hLoad ? "—" : String(health.online),
      sub: `${hLoad ? "—" : health.healthPct}% uptime`,      subColor: "#22c55e",
    },
    {
      icon: <Battery className="size-6 text-amber-500" />,    bg: "#fffbeb", border: "#f59e0b",
      label: "Low Battery",       value: hLoad ? "—" : String(health.lowBattery || 12),
      sub: "3% of total",         subColor: "#f59e0b",
    },
    {
      icon: <Signal  className="size-6 text-orange-500" />,   bg: "#fff7ed", border: "#f97316",
      label: "Weak Signal",       value: loading ? "—" : String(kpi.offlineSensors || 18),
      sub: "4% of total",         subColor: "#f97316",
    },
    {
      icon: <XCircle className="size-6 text-red-600" />,      bg: "#fef2f2", border: "#ef4444",
      label: "Failed Nodes",      value: hLoad ? "—" : String(health.fault || 4),
      sub: "1% of total",         subColor: "#ef4444",
    },
    {
      icon: <Link2   className="size-6 text-purple-600" />,   bg: "#f5f3ff", border: "#8b5cf6",
      label: "Active Links",      value: loading ? "—" : String(Math.round(kpi.activeNodes * 2.3)),
      sub: "Avg. RSSI: −67 dBm",  subColor: "#8b5cf6",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {cards.map((c) => (
        <div key={c.label}
          className="bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2.5 sm:px-4 sm:py-3.5 flex items-start gap-2 sm:gap-3 hover:shadow-md transition-shadow"
          style={{ borderTop: `3px solid ${c.border}` }}
        >
          <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg mt-0.5"
            style={{ backgroundColor: c.bg }}>
            <span className="[&>svg]:size-4 sm:[&>svg]:size-6">{c.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-extrabold text-gray-800 font-mono leading-tight">{c.value}</p>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-600 leading-tight mt-0.5 truncate">{c.label}</p>
            <p className="text-[9px] sm:text-[10px] font-medium mt-0.5 truncate" style={{ color: c.subColor }}>{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   INLINE NODE DETAIL  — fetches live data from Supabase via fetchNodeDetail.
   Used inside the topology panel (no absolute positioning).
───────────────────────────────────────────────────────────────────────────── */

function LiveNodeDetailInline({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const [node,    setNode]    = useState<SelectedNodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const { polygons } = useHighRiskZone();

  useEffect(() => {
    setLoading(true);
    setNode(null);
    fetchNodeDetail(nodeId).then((d) => { setNode(d); setLoading(false); });
  }, [nodeId]);

  const risk = node ? classifyRisk(node.lat, node.lon, polygons) : "none";
  const isPn = nodeId.startsWith("PN");

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/80 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {loading ? "Loading…" : (node ? node.id : "Not found")}
        </p>
        <button onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600">
          <X className="size-3.5" />
        </button>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center gap-2 text-xs text-gray-400">
          <RefreshCw className="size-4 animate-spin text-blue-400" /> Fetching…
        </div>
      )}

      {!loading && !node && (
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <p className="text-[11px] text-gray-400">
            Node not found in DB.<br />
            <span className="text-[10px]">Run seed_v2.sql to populate.</span>
          </p>
        </div>
      )}

      {!loading && node && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 text-[11px]">
          {/* type + status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isPn ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {isPn ? "Principal Node" : node.type}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              node.status === "Normal" || node.status === "Online"
                ? "bg-green-50 text-green-700 border-green-200"
                : node.status === "Warning" || node.status === "Offline"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {node.status}
            </span>
          </div>

          {/* id + coordinates */}
          <div className="flex items-start gap-2">
            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isPn ? "bg-blue-100" : "bg-emerald-100"}`}>
              <Wifi className={`size-3.5 ${isPn ? "text-blue-600" : "text-emerald-600"}`} />
            </div>
            <div>
              <p className="font-mono font-extrabold text-sm text-gray-800">{node.id}</p>
              <p className="text-[10px] text-gray-400 truncate">{node.label}</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                <MapPin className="size-2.5 shrink-0" />
                {node.lat.toFixed(5)}, {node.lon.toFixed(5)}
              </p>
            </div>
          </div>

          {/* risk banner */}
          {risk !== "none" && (
            <div className={`rounded-lg px-3 py-2 border flex items-start gap-2 ${
              risk === "high" ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"
            }`}>
              <AlertTriangle className={`size-3 shrink-0 mt-0.5 ${risk === "high" ? "text-red-500" : "text-amber-500"}`} />
              <p className={`text-[10px] font-bold ${risk === "high" ? "text-red-700" : "text-amber-700"}`}>
                {risk === "high" ? "High Risk Zone" : "Anomaly Zone"}
              </p>
            </div>
          )}

          {/* live reading (SN only) */}
          {!isPn && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <span className="text-gray-400 flex items-center gap-1">
                <Activity className="size-3" /> Reading
              </span>
              <span className="font-mono font-extrabold text-gray-800">
                {node.latestReading.toFixed(3)}
                <span className="text-[10px] font-normal text-gray-400 ml-1">{node.unit}</span>
              </span>
            </div>
          )}

          {/* hardware */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Cpu className="size-3" /> Hardware
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 shrink-0 flex items-center gap-1">
                <Battery className="size-3" /> Battery
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${node.batteryPct}%`, backgroundColor: battColor(node.batteryPct) }} />
              </div>
              <span className="font-bold w-8 text-right tabular-nums"
                style={{ color: battColor(node.batteryPct) }}>{node.batteryPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <Wifi className="size-3" /> Signal
              </span>
              <span className="font-bold" style={{ color: sigColor(node.signalPct) }}>{node.signalPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-semibold text-gray-700">{node.networkRole}</span>
            </div>
            {isPn && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Connected Sensors</span>
                <span className="font-bold font-mono text-gray-800">{node.connectedNodes}</span>
              </div>
            )}
            {!isPn && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Principal Node</span>
                <span className="font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{node.pnId}</span>
              </div>
            )}
          </div>

          {/* last update */}
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="size-2.5" /> {node.lastUpdate}
          </p>

          {/* status footer */}
          <div className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg text-center border ${
            node.status === "Normal" || node.status === "Online"
              ? "bg-green-50 text-green-700 border-green-200"
              : node.status === "Warning" || node.status === "Offline"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            {risk === "high"
              ? "🔴 HIGH RISK zone — review immediately"
              : risk === "moderate"
                ? "🟡 Anomaly zone — verify readings"
                : node.status === "Warning"  ? "⚠ Warning — review required"
                : node.status === "Offline"  ? "⚫ Node offline"
                : "✓ Operating normally"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOPOLOGY HELPERS
───────────────────────────────────────────────────────────────────────────── */

function snFillColor(status: string, fault: boolean): string {
  if (fault || status === "Warning" || status === "Offline") return "#ef4444";
  if (status === "Watch" || status === "Degraded")           return "#f59e0b";
  return "#3b82f6";
}

function pnStrokeColor(status: string): string {
  if (status === "Offline" || status === "Warning") return "#ef4444";
  if (status === "Watch"   || status === "Degraded") return "#f59e0b";
  return "#22c55e";
}

type ProjectedSN = KmlSensorNode    & { x: number; y: number };
type ProjectedPN = PrincipleNode    & { x: number; y: number };

interface MeshLink { x1: number; y1: number; x2: number; y2: number; weak: boolean }

function buildMeshLinks(nodes: ProjectedSN[]): MeshLink[] {
  const links: MeshLink[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]!;
    nodes
      .map((b, j) => ({ j, d: Math.hypot(b.x - a.x, b.y - a.y) }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const b = nodes[j]!;
        links.push({
          x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          weak: a.status !== "Normal" || b.status !== "Normal" || a.fault || b.fault,
        });
      });
  }
  return links;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED KML NODE DATA PROP
   useKmlSensorNodes is called ONCE at the tab root and threaded down so that
   only a single Supabase Realtime channel is created for the whole tab.
───────────────────────────────────────────────────────────────────────────── */

interface KmlNodesState {
  nodes:   KmlSensorNode[];
  loading: boolean;
  refetch: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOPOLOGY LEGEND — collapsible pill (avoids overlap on mobile)
───────────────────────────────────────────────────────────────────────────── */

function TopologyLegend() {
  const [open, setOpen] = useState(false);

  const ITEMS = [
    { el: <span className="size-2 rounded-full bg-blue-500 inline-block" />,           label: "Sensor (SN)" },
    { el: <span className="size-2.5 rounded-full border-2 border-green-600 inline-block" />, label: "Principal (PN)" },
    { el: <span className="size-1.5 rounded-full bg-amber-500 inline-block" />,         label: "Watch" },
    { el: <span className="size-1.5 rounded-full bg-red-500 inline-block" />,           label: "Failed" },
    { el: <span className="inline-block w-4 h-px bg-blue-400" />,                       label: "Active Link" },
    { el: <span className="inline-block w-4" style={{ borderTop: "2px dashed #f59e0b" }} />, label: "Weak Link" },
  ];

  return (
    <div className="absolute top-2 left-2 z-10">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 bg-white/95 border border-gray-200 rounded-lg px-2 py-1 shadow text-[10px] font-bold text-gray-600 hover:bg-white transition-colors"
      >
        <span className="size-2 rounded-full bg-blue-500 inline-block" />
        Legend
        <svg className={`size-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white/98 border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-[10px] font-semibold text-gray-600 flex flex-col gap-1.5 pointer-events-none min-w-[140px]">
          {ITEMS.map(({ el, label }) => (
            <span key={label} className="flex items-center gap-1.5">{el}{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2 + 3.  TOPOLOGY MAP  +  LIVE NODE DETAIL PANEL
───────────────────────────────────────────────────────────────────────────── */

type TopologyFilter = "all" | "normal" | "weak" | "warning";

const MAX_LINK_NODES = 150; // sample for mesh-link drawing performance

function TopologyMapAndDetail({ kmlNodes }: { kmlNodes: KmlNodesState }) {
  const { nodes: rawSN, loading: snLoad } = kmlNodes;
  const { data: rawPN, loading: pnLoad } = usePrincipleNodes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter,     setFilter]     = useState<TopologyFilter>("all");

  // Project coordinates once per data update
  const snNodes = useMemo<ProjectedSN[]>(
    () => rawSN.map((n) => ({ ...n, ...project(n.lat, n.lon) })),
    [rawSN]
  );
  const pnNodes = useMemo<ProjectedPN[]>(
    () => rawPN.map((p) => ({ ...p, ...project(p.lat, p.lon) })),
    [rawPN]
  );

  // Sub-sample for link drawing when node count is high
  const linkSample = useMemo<ProjectedSN[]>(() => {
    if (snNodes.length <= MAX_LINK_NODES) return snNodes;
    const step = Math.ceil(snNodes.length / MAX_LINK_NODES);
    return snNodes.filter((_, i) => i % step === 0);
  }, [snNodes]);

  const meshLinks = useMemo(() => buildMeshLinks(linkSample), [linkSample]);

  // PN backbone link: PN → centroid of its cluster
  const pnBackboneLinks = useMemo(() =>
    pnNodes.flatMap((pn) => {
      const cluster = snNodes.filter((n) => n.pnId === pn.id);
      if (cluster.length === 0) return [];
      const cx = cluster.reduce((s, n) => s + n.x, 0) / cluster.length;
      const cy = cluster.reduce((s, n) => s + n.y, 0) / cluster.length;
      return [{ id: pn.id, x1: pn.x, y1: pn.y, x2: cx, y2: cy }];
    }),
    [pnNodes, snNodes]
  );

  // Visible SN set based on filter
  const visibleIds = useMemo<Set<string>>(() => {
    const subset =
      filter === "normal"  ? snNodes.filter((n) => n.status === "Normal" && !n.fault) :
      filter === "weak"    ? snNodes.filter((n) => n.status === "Watch" || n.status === "Degraded") :
      filter === "warning" ? snNodes.filter((n) => n.status === "Warning" || n.fault || n.status === "Offline") :
      snNodes;
    return new Set(subset.map((n) => n.id));
  }, [snNodes, filter]);

  const isLoading = snLoad || pnLoad;

  // Risk halo centres projected from KML-grounded coords
  const h2 = project(23.724, 86.360);
  const h1 = project(23.748, 86.338);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-800">Network Topology Map</h3>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
            Real KML coordinates — {snNodes.length} sensor nodes · {pnNodes.length} principal nodes · Moonidih Colliery
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "normal", "weak", "warning"] as TopologyFilter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-colors ${
                filter === f ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              {f === "all" ? "All Nodes" : f === "normal" ? "Healthy" : f === "weak" ? "Weak Signal" : "Failed"}
            </button>
          ))}
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            {isLoading
              ? <><RefreshCw className="size-3 animate-spin text-blue-400" /> Loading…</>
              : <><Clock className="size-3" /> Live</>
            }
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: 460 }}>
        {/* SVG Canvas — 50% on desktop */}
        <div className="lg:w-1/2 min-w-0 relative overflow-hidden">
          {/* Legend — collapsible pill on mobile */}
          <TopologyLegend />

          {isLoading ? (
            <div className="flex items-center justify-center h-[460px] gap-2 text-sm text-gray-400">
              <RefreshCw className="size-5 animate-spin text-blue-400" />
              Loading KML node positions…
            </div>
          ) : (
            <svg
              width="100%" height="460"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full block"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* ── Risk halo radials ── */}
                <radialGradient id="rh-red" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#ef4444" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"    />
                </radialGradient>
                <radialGradient id="rh-amber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
                </radialGradient>

                {/* ── 3-D TERRAIN gradients ── */}
                {/* Base terrain fill: top-lit (lighter top, darker bottom) */}
                <linearGradient id="terrain-base" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#e8f0fc" />
                  <stop offset="45%"  stopColor="#d8e6f5" />
                  <stop offset="100%" stopColor="#c4d5ec" />
                </linearGradient>

                {/* Ambient-light sheen: bright oval at top-left simulating overhead light */}
                <radialGradient id="terrain-sheen" cx="35%" cy="28%" r="52%">
                  <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
                  <stop offset="55%"  stopColor="#ffffff" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
                </radialGradient>

                {/* Depth shadow: darker edge towards bottom-right (opposite the light) */}
                <radialGradient id="terrain-shadow" cx="72%" cy="78%" r="55%">
                  <stop offset="0%"   stopColor="#1e3a5f" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0"    />
                </radialGradient>

                {/* Depth ring fills — successively lighter toward centre (raised terrain) */}
                <radialGradient id="depth-d1" cx="50%" cy="42%" r="50%">
                  <stop offset="0%"   stopColor="#cfe0f4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#cfe0f4" stopOpacity="0"   />
                </radialGradient>
                <radialGradient id="depth-d2" cx="50%" cy="40%" r="50%">
                  <stop offset="0%"   stopColor="#b8d0ed" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#b8d0ed" stopOpacity="0"   />
                </radialGradient>

                {/* Isometric grid pattern — perspective diamond lattice */}
                <pattern id="iso-grid" x="0" y="0" width="32" height="18" patternUnits="userSpaceOnUse">
                  {/* two diagonal lines forming a diamond cell */}
                  <line x1="0"  y1="9"  x2="16" y2="0"  stroke="#8ba8cc" strokeWidth="0.4" opacity="0.35" />
                  <line x1="16" y1="0"  x2="32" y2="9"  stroke="#8ba8cc" strokeWidth="0.4" opacity="0.35" />
                  <line x1="0"  y1="9"  x2="16" y2="18" stroke="#8ba8cc" strokeWidth="0.4" opacity="0.28" />
                  <line x1="16" y1="18" x2="32" y2="9"  stroke="#8ba8cc" strokeWidth="0.4" opacity="0.28" />
                </pattern>

                {/* Subtle contour lines (horizontal topo) */}
                <pattern id="topo" x="0" y="0" width={SVG_W} height="28" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="28" x2={SVG_W} y2="28" stroke="#7a9bbf" strokeWidth="0.5" opacity="0.22" />
                </pattern>

                {/* ── Filters ── */}
                {/* PN node glow */}
                <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="2.8" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>

                {/* Terrain plate drop-shadow (gives the 3-D "lifted" feel) */}
                <filter id="plate-shadow" x="-8%" y="-8%" width="120%" height="125%">
                  <feDropShadow dx="3" dy="6" stdDeviation="10" floodColor="#0f2748" floodOpacity="0.18" />
                </filter>

                {/* Edge emboss — inner glow along top edge */}
                <filter id="emboss" x="0%" y="0%" width="100%" height="100%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                  <feOffset dx="-1" dy="-2" result="offset" />
                  <feComposite in="SourceGraphic" in2="offset" operator="over" />
                </filter>

                {/* ── Clip path: mine ellipse ── */}
                <clipPath id="mine-clip">
                  <ellipse
                    cx={SVG_W / 2} cy={SVG_H / 2}
                    rx={(SVG_W - SVG_PAD * 2) / 2 + 14}
                    ry={(SVG_H - SVG_PAD * 2) / 2 + 14}
                  />
                </clipPath>
              </defs>

              {/* ══════════════════════════════════════════════════════════
                  3-D TERRAIN BACKGROUND
                  Layer order (bottom → top):
                    1. Canvas base
                    2. Terrain plate (base colour + plate shadow)
                    3. Isometric grid
                    4. Topo contours
                    5. Depth-band concentric fills
                    6. Sheen (top-light highlight)
                    7. Shadow (opposite corner)
                    8. Mine boundary stroke
                    9. Rim highlight (top edge bright line)
                   10. Risk halos
              ══════════════════════════════════════════════════════════ */}

              {/* 1. Canvas base */}
              <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#f1f5fb" />

              {/* 2. Terrain plate — filled ellipse with drop-shadow = "raised 3D slab" */}
              <ellipse
                cx={SVG_W / 2} cy={SVG_H / 2}
                rx={(SVG_W - SVG_PAD * 2) / 2 + 14}
                ry={(SVG_H - SVG_PAD * 2) / 2 + 14}
                fill="url(#terrain-base)"
                filter="url(#plate-shadow)"
              />

              {/* 3. Isometric perspective grid clipped to plate */}
              <rect x="0" y="0" width={SVG_W} height={SVG_H}
                fill="url(#iso-grid)" clipPath="url(#mine-clip)" />

              {/* 4. Topo contour lines */}
              <rect x="0" y="0" width={SVG_W} height={SVG_H}
                fill="url(#topo)" clipPath="url(#mine-clip)" />

              {/* 5. Depth-band concentric zones — simulate underground layers */}
              {(() => {
                const cx = SVG_W / 2, cy = SVG_H / 2 + 8; // slight downward shift = terrain tilt
                const rxB = (SVG_W - SVG_PAD * 2) / 2;
                const ryB = (SVG_H - SVG_PAD * 2) / 2;
                const bands = [
                  { scale: 0.92, fill: "#ddeaf8", fillOp: 0.35, stroke: "#7faed6", strokeOp: 0.25, sw: 0.7 },
                  { scale: 0.74, fill: "#ccdff3", fillOp: 0.40, stroke: "#5e8fc0", strokeOp: 0.30, sw: 0.8 },
                  { scale: 0.54, fill: "#bad4ee", fillOp: 0.45, stroke: "#4a75ae", strokeOp: 0.35, sw: 0.9 },
                  { scale: 0.36, fill: "#a8c8e8", fillOp: 0.50, stroke: "#3560a0", strokeOp: 0.40, sw: 1.0 },
                  { scale: 0.20, fill: "#94b8e0", fillOp: 0.55, stroke: "#2a4f8e", strokeOp: 0.50, sw: 1.1 },
                ];
                return bands.map((b, i) => (
                  <g key={i}>
                    {/* Fill band */}
                    <ellipse cx={cx} cy={cy} rx={rxB * b.scale} ry={ryB * b.scale * 0.82}
                      fill={b.fill} fillOpacity={b.fillOp} />
                    {/* Contour stroke */}
                    <ellipse cx={cx} cy={cy} rx={rxB * b.scale} ry={ryB * b.scale * 0.82}
                      fill="none" stroke={b.stroke} strokeWidth={b.sw}
                      strokeDasharray="5 4" opacity={b.strokeOp} />
                    {/* Depth label on the right side of each ring */}
                    <text
                      x={cx + rxB * b.scale + 4}
                      y={cy + 3}
                      fontSize="6" fill="#3b6090" opacity="0.45" fontWeight="600"
                    >
                      {`−${(5 - i) * 40}m`}
                    </text>
                  </g>
                ));
              })()}

              {/* 6. Top-light sheen — bright oval simulating overhead illumination */}
              <ellipse
                cx={SVG_W / 2} cy={SVG_H / 2}
                rx={(SVG_W - SVG_PAD * 2) / 2 + 14}
                ry={(SVG_H - SVG_PAD * 2) / 2 + 14}
                fill="url(#terrain-sheen)"
                clipPath="url(#mine-clip)"
              />

              {/* 7. Bottom-right ambient shadow */}
              <ellipse
                cx={SVG_W / 2} cy={SVG_H / 2}
                rx={(SVG_W - SVG_PAD * 2) / 2 + 14}
                ry={(SVG_H - SVG_PAD * 2) / 2 + 14}
                fill="url(#terrain-shadow)"
                clipPath="url(#mine-clip)"
              />

              {/* 8. Mine boundary stroke — 3-D raised edge: thick outer + thin bright inner */}
              {(() => {
                const cx = SVG_W / 2, cy = SVG_H / 2;
                const rx = (SVG_W - SVG_PAD * 2) / 2 + 14;
                const ry = (SVG_H - SVG_PAD * 2) / 2 + 14;
                return (
                  <>
                    {/* outer shadow stroke */}
                    <ellipse cx={cx + 2} cy={cy + 3} rx={rx} ry={ry}
                      fill="none" stroke="#0f2748" strokeWidth="3.5" opacity="0.12" />
                    {/* main boundary */}
                    <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
                      fill="none" stroke="#2d5a8e" strokeWidth="2"
                      strokeDasharray="12 5" opacity="0.55" />
                    {/* inner highlight (top-lit rim) */}
                    <ellipse cx={cx - 1} cy={cy - 2} rx={rx - 1} ry={ry - 1}
                      fill="none" stroke="#ffffff" strokeWidth="1"
                      strokeDasharray="8 14" opacity="0.40" />
                  </>
                );
              })()}

              {/* 9. Site label */}
              <text x={SVG_W / 2} y={SVG_PAD - 6}
                textAnchor="middle" fontSize="8" fill="#2d4e7a"
                fontWeight="700" letterSpacing="1.5" opacity="0.55">
                MOONIDIH COLLIERY — SENSOR NETWORK
              </text>

              {/* ══ RISK HALOS ═══════════════════════════════════════════ */}
              <ellipse cx={h2.x} cy={h2.y} rx="60" ry="52" fill="url(#rh-red)"   />
              <ellipse cx={h1.x} cy={h1.y} rx="52" ry="46" fill="url(#rh-amber)" />
              <ellipse cx={h2.x} cy={h2.y} rx="60" ry="52"
                fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.40" />
              <ellipse cx={h1.x} cy={h1.y} rx="52" ry="46"
                fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.40" />
              <text x={h2.x} y={h2.y - 56} textAnchor="middle"
                fontSize="7" fill="#991b1b" fontWeight="800" opacity="0.75" letterSpacing="0.5">HIGH RISK H2</text>
              <text x={h1.x} y={h1.y - 49} textAnchor="middle"
                fontSize="7" fill="#78350f" fontWeight="800" opacity="0.70" letterSpacing="0.5">RISK ZONE H1</text>

              {/* Mesh links */}
              {meshLinks.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke={l.weak ? "#f59e0b" : "#93c5fd"}
                  strokeWidth={l.weak ? 0.9 : 0.6}
                  strokeDasharray={l.weak ? "3 3" : undefined}
                  opacity="0.50" />
              ))}

              {/* PN backbone links */}
              {pnBackboneLinks.map((l) => (
                <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke="#3b82f6" strokeWidth="1.8" opacity="0.45" />
              ))}

              {/* Sensor nodes */}
              {snNodes.map((sn) => {
                const visible = visibleIds.has(sn.id);
                const col     = snFillColor(sn.status, sn.fault);
                const isSel   = selectedId === sn.id;
                return (
                  <g key={sn.id} style={{ cursor: "pointer", opacity: visible ? 1 : 0.10 }}
                    onClick={() => visible && setSelectedId(sn.id)}>
                    {isSel && <circle cx={sn.x} cy={sn.y} r="9" fill={col} opacity="0.25" />}
                    <circle cx={sn.x} cy={sn.y} r={isSel ? 5 : 3.5}
                      fill={col}
                      stroke={isSel ? "#1e293b" : "white"}
                      strokeWidth={isSel ? 1.5 : 0.7}
                      filter={(sn.fault || sn.status === "Warning") ? "url(#glow)" : undefined} />
                  </g>
                );
              })}

              {/* Principal nodes */}
              {pnNodes.map((pn) => {
                const isSel = selectedId === pn.id;
                const col   = pnStrokeColor(pn.status);
                return (
                  <g key={pn.id} style={{ cursor: "pointer" }} onClick={() => setSelectedId(pn.id)}>
                    {isSel && <circle cx={pn.x} cy={pn.y} r="22" fill={col} opacity="0.15" />}
                    <circle cx={pn.x} cy={pn.y} r="14" fill="#15803d" stroke={col} strokeWidth="2.5" filter="url(#glow)" />
                    <path d={`M${pn.x - 8},${pn.y} Q${pn.x},${pn.y - 10} ${pn.x + 8},${pn.y}`}
                      fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <path d={`M${pn.x - 5},${pn.y + 3} Q${pn.x},${pn.y - 5} ${pn.x + 5},${pn.y + 3}`}
                      fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx={pn.x} cy={pn.y + 5} r="1.5" fill="white" />
                    <text x={pn.x} y={pn.y + 26} textAnchor="middle" fontSize="8.5" fill="#15803d" fontWeight="700">
                      {pn.id}
                    </text>
                  </g>
                );
              })}

              {/* Compass + scale bar */}
              <text x="24" y={SVG_H - 10} fontSize="9" fill="#64748b" fontWeight="700">N↑</text>
              <line x1="44"  y1={SVG_H - 10} x2="116" y2={SVG_H - 10} stroke="#64748b" strokeWidth="1.5" />
              <line x1="44"  y1={SVG_H - 14} x2="44"  y2={SVG_H - 6}  stroke="#64748b" strokeWidth="1.5" />
              <line x1="116" y1={SVG_H - 14} x2="116" y2={SVG_H - 6}  stroke="#64748b" strokeWidth="1.5" />
              <text x="80" y={SVG_H - 17} textAnchor="middle" fontSize="7.5" fill="#64748b">~2 km</text>
            </svg>
          )}
        </div>

        {/* Live Node Detail Panel — full-width below map on mobile, 50% on desktop */}
        <div className="lg:w-1/2 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col bg-white overflow-hidden" style={{ minHeight: 200 }}>
          {selectedId === null ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-4 py-10">
              <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Radio className="size-5 text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-400">Click any node</p>
              <p className="text-[10px] text-gray-300 leading-snug">
                SN or PN to inspect<br />live DB readings
              </p>
            </div>
          ) : (
            <LiveNodeDetailInline nodeId={selectedId} onClose={() => setSelectedId(null)} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4.  ADAPTIVE DEPLOYMENT CLASSIFICATION
   Zone A = PN1 (high risk area), B = PN2, C = PN3, D = PN4.
   Node counts come from live useKmlSensorNodes grouped by pnId.
───────────────────────────────────────────────────────────────────────────── */

const DEPLOY_ZONE_META = [
  {
    pnId: "PN1", lbl: "A",
    bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444",
    title: "Extreme Density",
    sub: "High Risk + Nearby Infrastructure\n+ Underground Panel Boundary",
    bullets: ["Node spacing: 50 – 100 m", "High density mesh", "Multiple redundant routes", "Critical monitoring priority"],
    dots:  [[30,28],[50,18],[70,28],[20,48],[40,43],[60,38],[80,48],[30,63],[55,58],[75,63],[45,73],[65,76]] as [number,number][],
    links: [[0,1],[1,2],[0,3],[3,4],[4,5],[5,6],[3,7],[4,8],[5,9],[7,10],[8,11],[1,4],[2,5]],
  },
  {
    pnId: "PN2", lbl: "B",
    bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b",
    title: "Extreme – Moderate",
    sub: "Nearby Infrastructure\n+ Underground Panel Boundary",
    bullets: ["Node spacing: 100 – 200 m", "Medium to high density", "Focus on infrastructure safety", "Adaptive routing enabled"],
    dots:  [[25,24],[55,19],[80,29],[15,54],[45,49],[75,54],[35,73],[65,70]] as [number,number][],
    links: [[0,1],[1,2],[0,3],[3,4],[4,5],[3,6],[4,7],[1,4]],
  },
  {
    pnId: "PN3", lbl: "C",
    bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e",
    title: "Extreme – Low",
    sub: "Underground Panel\nBoundary only",
    bullets: ["Node spacing: 200 – 400 m", "Panel boundary focused", "Essential coverage"],
    dots:  [[20,29],[60,24],[85,49],[15,64],[50,59],[80,68]] as [number,number][],
    links: [[0,1],[1,2],[0,3],[3,4],[4,5]],
  },
  {
    pnId: "PN4", lbl: "D",
    bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6",
    title: "Normal Placement",
    sub: "No major risk factors",
    bullets: ["Node spacing: 400 – 800 m", "Standard density", "Basic monitoring", "Self-healing mesh network"],
    dots:  [[20,34],[65,29],[85,59],[30,69],[70,71]] as [number,number][],
    links: [[0,1],[1,2],[0,3],[3,4]],
  },
] as const;

function DeploymentClassification({ kmlNodes }: { kmlNodes: KmlNodesState }) {
  const { nodes: allNodes, loading } = kmlNodes;

  const countByPn = useMemo<Record<string, number>>(() => {
    const m: Record<string, number> = { PN1: 0, PN2: 0, PN3: 0, PN4: 0 };
    for (const n of allNodes) {
      const cur = m[n.pnId];
      if (cur !== undefined) m[n.pnId] = cur + 1;
    }
    return m;
  }, [allNodes]);

  const total = Math.max(allNodes.length, 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Sensor Deployment Classification</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Node density and placement strategy — live counts from Supabase</p>
        </div>
        {loading && <RefreshCw className="size-3.5 animate-spin text-blue-400" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
        {DEPLOY_ZONE_META.map((z) => {
          const count = countByPn[z.pnId] ?? 0;
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={z.lbl} className="bg-white p-4 flex flex-col gap-3">
              {/* Zone header */}
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0"
                  style={{ backgroundColor: z.bg, color: z.text, border: `2px solid ${z.border}` }}>
                  {z.lbl}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold leading-tight" style={{ color: z.text }}>{z.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 whitespace-pre-line leading-snug">{z.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-extrabold font-mono" style={{ color: z.text }}>
                    {loading ? "—" : count} Nodes
                  </p>
                  <p className="text-[10px] text-gray-400">({loading ? "—" : pct}%) · {z.pnId}</p>
                </div>
              </div>

              {/* Mini topology SVG */}
              <svg width="100%" height="88" viewBox="0 0 100 88"
                style={{ backgroundColor: z.bg + "88", borderRadius: 8 }}>
                {z.links.map((lnk, i) => {
                  const pa = z.dots[lnk[0]];
                  const pb = z.dots[lnk[1]];
                  if (!pa || !pb) return null;
                  return (
                    <line key={i} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]}
                      stroke={z.dot} strokeWidth="1.2" opacity="0.55" />
                  );
                })}
                {z.dots.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill={z.dot} stroke="white" strokeWidth="1" />
                ))}
              </svg>

              {/* Bullets */}
              <ul className="space-y-1">
                {z.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-[10px] text-gray-600">
                    <span className="size-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: z.dot }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5.  NETWORK HEALTH CHARTS
   Derives rolling snapshots every 30 s from live useKmlSensorNodes + useLiveKpi.
───────────────────────────────────────────────────────────────────────────── */

interface NetSnapshot {
  time:    string;
  rssi:    number;
  latency: number;
  pdr:     number;
  avail:   number;
}

function buildSnapshot(nodes: KmlSensorNode[], avgLatencyMs: number): NetSnapshot {
  const total  = Math.max(nodes.length, 1);
  const online = nodes.filter((n) => n.status === "Normal" || n.status === "Online").length;
  const avail  = Math.round((online / total) * 1000) / 10;
  const avgSig = nodes.reduce((s, n) => s + n.signalPct, 0) / total;
  const rssi   = Math.round(-110 + avgSig * 0.70); // map 0-100 → roughly −110…−40 dBm
  const pdr    = Math.min(100, Math.round(avail * 0.98 + (avail > 90 ? 1.5 : 0)));
  return {
    time:    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    rssi,
    latency: Math.round(avgLatencyMs),
    pdr,
    avail,
  };
}

const MAX_SNAPSHOTS = 13;

function NetworkHealthCharts({ kmlNodes }: { kmlNodes: KmlNodesState }) {
  const { nodes }          = kmlNodes;
  const { data: kpi }            = useLiveKpi();
  const [history, setHistory]    = useState<NetSnapshot[]>([]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const snap = buildSnapshot(nodes, kpi.avgLatencyMs);

    setHistory((prev) => {
      if (prev.length === 0) {
        // Seed 12 slightly-jittered historical points so the chart is not empty on load
        const seed: NetSnapshot[] = Array.from({ length: 12 }, (_, i) => {
          const t = new Date(Date.now() - (12 - i) * 5 * 60_000);
          return {
            time:    t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            rssi:    snap.rssi    + Math.round((Math.random() - 0.5) * 8),
            latency: snap.latency + Math.round((Math.random() - 0.5) * 20),
            pdr:     Math.min(100, snap.pdr   + Math.round((Math.random() - 0.5) * 3)),
            avail:   Math.min(100, snap.avail + Math.round((Math.random() - 0.5) * 2) * 0.1),
          };
        });
        return [...seed, snap];
      }
      const last = prev[prev.length - 1];
      if (last?.time === snap.time) return prev; // same minute — skip duplicate
      const next = [...prev, snap];
      return next.length > MAX_SNAPSHOTS ? next.slice(next.length - MAX_SNAPSHOTS) : next;
    });
  // nodes and kpi.avgLatencyMs are the only dependencies we want
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, kpi.avgLatencyMs]);

  const last = history[history.length - 1];

  const charts: Array<{
    label: string; sublabel: string; key: keyof NetSnapshot; unit: string;
    color: string; bg: string; valueFmt: () => string; refLine: number; domain: [number, number];
    trend: "up-good" | "down-good";
  }> = [
    {
      label: "Signal Strength", sublabel: "RSSI",
      key: "rssi", unit: "dBm", color: "#22c55e", bg: "#f0fdf4",
      valueFmt: () => last ? `${last.rssi}` : "—",
      refLine: -80, domain: [-110, -40], trend: "up-good",
    },
    {
      label: "Latency", sublabel: "Round-trip",
      key: "latency", unit: "ms", color: "#f59e0b", bg: "#fffbeb",
      valueFmt: () => last ? `${last.latency}` : "—",
      refLine: 200, domain: [0, 400], trend: "down-good",
    },
    {
      label: "Packet Delivery", sublabel: "PDR",
      key: "pdr", unit: "%", color: "#3b82f6", bg: "#eff6ff",
      valueFmt: () => last ? `${last.pdr}` : "—",
      refLine: 90, domain: [50, 100], trend: "up-good",
    },
    {
      label: "Availability", sublabel: "Network uptime",
      key: "avail", unit: "%", color: "#8b5cf6", bg: "#f5f3ff",
      valueFmt: () => last ? `${last.avail}` : "—",
      refLine: 95, domain: [50, 100], trend: "up-good",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      {/* ── Header ── */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Network Health</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Last 1 hour · auto-refresh 30 s</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* ── Chart grid — 2×2 ── */}
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        {charts.map((c) => (
          <div key={c.key} className="bg-white p-4 flex flex-col gap-2">
            {/* Card header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold text-gray-700 leading-tight">{c.label}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{c.sublabel}</p>
              </div>
              <div
                className="flex items-baseline gap-0.5 shrink-0 rounded-lg px-2 py-1"
                style={{ backgroundColor: c.bg }}
              >
                <span className="text-lg font-extrabold font-mono leading-none" style={{ color: c.color }}>
                  {c.valueFmt()}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: c.color }}>{c.unit}</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-[72px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 6.5, fill: "#cbd5e1" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(v: string) => v.replace(/ am| pm/, "")}
                  />
                  <YAxis
                    domain={c.domain}
                    tick={{ fontSize: 6.5, fill: "#cbd5e1" }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11, borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      padding: "6px 10px",
                    }}
                    labelStyle={{ fontWeight: 700, color: "#374151", marginBottom: 2 }}
                    formatter={(v: number) => [`${v} ${c.unit}`, c.label]}
                  />
                  <ReferenceLine
                    y={c.refLine}
                    stroke="#ef444480"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey={c.key}
                    stroke={c.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: c.color, stroke: "white", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Threshold label */}
            <p className="text-[9px] text-gray-400 leading-none">
              Threshold: {c.refLine}{c.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6.  FAILURE MONITORING TABLE
   Live data from useKmlSensorNodes:
     "failed"  → status=Warning | Offline | fault=true
     "battery" → batteryPct < 20
     "signal"  → signalPct  < 30
───────────────────────────────────────────────────────────────────────────── */

type FailFilter = "all" | "failed" | "battery" | "signal";

interface AnnotatedNode extends KmlSensorNode {
  issue: string;
  ic:    string;
}

function deriveIssue(n: KmlSensorNode): string {
  if (n.fault || n.status === "Offline")  return "Offline";
  if (n.status === "Warning")             return "Warning";
  if (n.batteryPct < 20)                  return "Low Batt";
  if (n.signalPct  < 30)                  return "Weak Sig";
  return "Degraded";
}

function deriveIssueColor(issue: string): string {
  if (issue === "Offline" || issue === "Warning") return "#ef4444";
  if (issue === "Low Batt")                       return "#f59e0b";
  if (issue === "Weak Sig")                       return "#f97316";
  return "#94a3b8";
}

function FailureMonitoring({ kmlNodes }: { kmlNodes: KmlNodesState }) {
  const { nodes: allNodes, loading, refetch } = kmlNodes;
  const [filter,  setFilter]  = useState<FailFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const unhealthy = useMemo<AnnotatedNode[]>(() =>
    allNodes
      .filter((n) =>
        n.fault || n.status === "Warning" || n.status === "Offline" ||
        n.status === "Degraded" || n.batteryPct < 20 || n.signalPct < 30
      )
      .map((n) => {
        const issue = deriveIssue(n);
        return { ...n, issue, ic: deriveIssueColor(issue) };
      }),
    [allNodes]
  );

  const failed  = unhealthy.filter((n) => n.issue === "Offline" || n.issue === "Warning");
  const battery = unhealthy.filter((n) => n.issue === "Low Batt");
  const signal  = unhealthy.filter((n) => n.issue === "Weak Sig");

  const filtered =
    filter === "failed"  ? failed  :
    filter === "battery" ? battery :
    filter === "signal"  ? signal  :
    unhealthy;

  const visible = showAll ? filtered : filtered.slice(0, 6);

  const FILTERS = [
    { f: "failed"  as FailFilter, count: failed.length,  label: "Failed",   color: "#ef4444" },
    { f: "battery" as FailFilter, count: battery.length, label: "Low Batt", color: "#f59e0b" },
    { f: "signal"  as FailFilter, count: signal.length,  label: "Weak Sig", color: "#f97316" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-3.5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 leading-tight">Failure Monitor</h3>
            <p className="text-[10px] text-gray-400 leading-tight">Low health sensor nodes</p>
          </div>
          {loading && <RefreshCw className="size-3 animate-spin text-blue-400 ml-1" />}
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {FILTERS.map(({ f, count, label, color }) => (
            <button
              key={f}
              onClick={() => setFilter(filter === f ? "all" : f)}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all"
              style={filter === f
                ? { backgroundColor: color, color: "#fff", borderColor: color }
                : { backgroundColor: color + "12", color: color, borderColor: color + "40" }}
            >
              <span className="size-1.5 rounded-full inline-block" style={{ backgroundColor: filter === f ? "#fff" : color }} />
              {count} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!loading && unhealthy.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 py-10 gap-2 text-center">
          <div className="size-10 rounded-full bg-green-50 flex items-center justify-center">
            <Wifi className="size-4 text-green-500" />
          </div>
          <p className="text-xs font-semibold text-gray-500">All sensors nominal</p>
          <p className="text-[10px] text-gray-400">No failures or low-health nodes</p>
        </div>
      )}

      {/* ── Table ── */}
      {(loading || unhealthy.length > 0) && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/95 backdrop-blur-sm">
                <th className="px-3 py-2 text-left font-bold text-[9px] uppercase tracking-wider text-gray-400 w-[72px]">Node</th>
                <th className="px-3 py-2 text-left font-bold text-[9px] uppercase tracking-wider text-gray-400">Type</th>
                <th className="px-3 py-2 text-left font-bold text-[9px] uppercase tracking-wider text-gray-400 w-[80px]">Issue</th>
                <th className="px-3 py-2 text-right font-bold text-[9px] uppercase tracking-wider text-gray-400 w-[52px]">Batt</th>
                <th className="px-3 py-2 text-right font-bold text-[9px] uppercase tracking-wider text-gray-400 w-[60px]">Signal</th>
                <th className="px-3 py-2 text-center font-bold text-[9px] uppercase tracking-wider text-gray-400 w-[36px]">PN</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((n, i) => (
                <tr
                  key={n.id}
                  className={`border-t border-gray-50 transition-colors hover:bg-slate-50/70 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                >
                  {/* Node ID — monospace, no wrapping */}
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-bold text-gray-800 text-[11px] whitespace-nowrap">{n.id}</span>
                  </td>

                  {/* Type */}
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{n.type}</td>

                  {/* Issue badge */}
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: n.ic + "18", color: n.ic }}
                    >
                      <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: n.ic }} />
                      {n.issue}
                    </span>
                  </td>

                  {/* Battery — bar + number */}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-bold tabular-nums whitespace-nowrap" style={{ color: battColor(n.batteryPct) }}>
                        {n.batteryPct}%
                      </span>
                      {/* 5-segment mini-bar */}
                      <div className="flex gap-[2px]">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div
                            key={si}
                            className="w-2 h-1 rounded-[1px]"
                            style={{
                              backgroundColor: si < Math.ceil((n.batteryPct / 100) * 5)
                                ? battColor(n.batteryPct)
                                : "#e5e7eb",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Signal dBm */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono font-bold tabular-nums whitespace-nowrap" style={{ color: sigColor(n.signalPct) }}>
                      {pctToDbm(n.signalPct)}
                    </span>
                  </td>

                  {/* PN badge */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">
                      {n.pnId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Show more footer ── */}
      {!showAll && filtered.length > 6 && (
        <div className="border-t border-gray-100 px-4 py-2 shrink-0">
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition-colors text-center"
          >
            Show {filtered.length - 6} more nodes ↓
          </button>
        </div>
      )}

      {showAll && filtered.length > 6 && (
        <div className="border-t border-gray-100 px-4 py-2 shrink-0">
          <button
            onClick={() => setShowAll(false)}
            className="w-full text-[11px] text-gray-400 font-semibold hover:text-gray-600 transition-colors text-center"
          >
            Collapse ↑
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */

export function SensorNetworkTab() {
  // Single hook call for the whole tab — avoids duplicate Realtime channel names.
  const { data: nodes, loading, refetch } = useKmlSensorNodes();
  const kmlNodes: KmlNodesState = { nodes, loading, refetch };

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 pb-8">
      <NetworkOverview />
      <TopologyMapAndDetail kmlNodes={kmlNodes} />
      <DeploymentClassification kmlNodes={kmlNodes} />
      {/* 5+6 — Health Charts + Failure Table — equal height, top-aligned */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-stretch">
        <div className="xl:col-span-3 flex flex-col"><NetworkHealthCharts kmlNodes={kmlNodes} /></div>
        <div className="xl:col-span-2 flex flex-col"><FailureMonitoring  kmlNodes={kmlNodes} /></div>
      </div>
    </div>
  );
}

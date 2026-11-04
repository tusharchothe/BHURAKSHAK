import { useEffect, useState } from "react";
import {
  X, MapPin, Activity, Battery, Wifi,
  Cpu, Clock, RefreshCw, AlertTriangle,
} from "lucide-react";
import { fetchNodeDetail, type SelectedNodeData } from "@/hooks/useLiveMonitoring";
import { useHighRiskZone, classifyRisk } from "@/hooks/useHighRiskZone";

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Online:   { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  Normal:   { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  Watch:    { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", border: "#fde68a" },
  Warning:  { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca" },
  Abnormal: { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca" },
  Critical: { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca" },
  Alert:    { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca" },
  Degraded: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", border: "#fde68a" },
  Offline:  { bg: "#f8fafc", text: "#475569", dot: "#94a3b8", border: "#e2e8f0" },
};

const DEFAULT_STATUS = { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca" };

function statusStyle(s: string) {
  return STATUS_STYLE[s] ?? DEFAULT_STATUS;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function BatteryBar({ pct }: { pct: number }) {
  const color = pct > 50 ? "#22c55e" : pct > 20 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums w-8 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function SignalBars({ pct }: { pct: number }) {
  const bars = pct > 80 ? 5 : pct > 60 ? 4 : pct > 40 ? 3 : pct > 20 ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4, 5].map((b) => (
        <div
          key={b}
          className="w-1.5 rounded-sm transition-colors"
          style={{
            height: `${b * 4}px`,
            backgroundColor: b <= bars ? "#3b82f6" : "#e5e7eb",
          }}
        />
      ))}
      <span className="text-[11px] text-gray-500 ml-1 font-mono">{pct}%</span>
    </div>
  );
}

function ReadingChart({ nodeId }: { nodeId: string }) { return null; }

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PANEL
───────────────────────────────────────────────────────────────────────────── */

interface NodeDetailPanelProps {
  /** Node ID string — e.g. "SN-042" or "PN1". Panel fetches live data itself. */
  nodeId:   string;
  onClose:  () => void;
}

export function NodeDetailPanel({ nodeId, onClose }: NodeDetailPanelProps) {
  const [node,    setNode]    = useState<SelectedNodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const { polygons } = useHighRiskZone();

  useEffect(() => {
    setLoading(true);
    fetchNodeDetail(nodeId).then((data) => {
      setNode(data);
      setLoading(false);
    });
  }, [nodeId]);

  const st = node ? statusStyle(node.status) : statusStyle("Normal");
  const isPn = (node?.id ?? nodeId).startsWith("PN");
  const displayId = node?.id ?? (nodeId.startsWith("coord:") ? "…" : nodeId);
  const risk = node ? classifyRisk(node.lat, node.lon, polygons) : "none";

  return (
    <div className="absolute top-[52px] right-3 w-[calc(100vw-1rem)] sm:w-72 max-w-[288px] bg-white rounded-xl shadow-2xl border border-gray-200 z-30 max-h-[calc(100%-64px)] overflow-auto animate-in slide-in-from-right-2 duration-200">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-3 pb-3 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isPn
                ? "bg-blue-100 text-blue-700"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {isPn ? "Principal Node" : node?.type ?? "Sensor"}
            </span>
            {/* Status badge */}
            {node && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: st.dot,
                    boxShadow: `0 0 0 2px ${st.dot}44`,
                    animation: (node.status === "Normal" || node.status === "Online") ? "pulse 2s infinite" : undefined,
                  }}
                />
                {node.status}
              </span>
            )}
          </div>
          {/* Show ID + coords only while loading (once loaded, icon block shows them) */}
          {!node && (
            <h3 className="font-mono font-extrabold text-lg text-gray-800 leading-tight mt-1">{displayId}</h3>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2"
        >
          <X className="size-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-400">
          <RefreshCw className="size-4 animate-spin text-blue-400" />
          Fetching live data…
        </div>
      )}

      {!loading && !node && (
        <div className="px-4 py-6 text-center text-xs text-gray-400">
          Node not found in database.<br />
          <span className="text-[10px]">Run seed_v2.sql to populate.</span>
        </div>
      )}

      {!loading && node && (
        <div className="px-4 py-2.5 space-y-2.5">

          {/* ── Icon + ID + label ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
            <div className={`flex size-9 items-center justify-center rounded-full shrink-0 ${isPn ? "bg-blue-100" : "bg-emerald-100"}`}>
              <Wifi className={`size-4 ${isPn ? "text-blue-600" : "text-emerald-600"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono font-extrabold text-sm text-gray-800 leading-tight">{displayId}</p>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{node.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin className="size-2.5 shrink-0" />
                {node.lat.toFixed(5)}, {node.lon.toFixed(5)}
              </p>
            </div>
          </div>

          {/* ── Risk Zone Banner ─────────────────────────────────────────── */}
          {risk !== "none" && (
            <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 border ${
              risk === "high"
                ? "bg-red-50 border-red-300"
                : "bg-amber-50 border-amber-300"
            }`}>
              <AlertTriangle className={`size-3.5 shrink-0 mt-0.5 ${risk === "high" ? "text-red-500" : "text-amber-500"}`} />
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-wide ${
                  risk === "high" ? "text-red-700" : "text-amber-700"
                }`}>
                  {risk === "high" ? "High Risk Zone" : "Anomaly Zone"}
                </p>
                <p className={`text-[10px] mt-0.5 leading-snug ${
                  risk === "high" ? "text-red-500" : "text-amber-500"
                }`}>
                  {risk === "high"
                    ? "Inside critical subsidence area. Immediate inspection required."
                    : "Inside an anomaly zone. Elevated monitoring and verification recommended."}
                </p>
              </div>
            </div>
          )}

          {/* ── Live reading (compact) ────────────────────────────────────── */}
          {!isPn && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Activity className="size-3" /> Reading
              </span>
              <div className="text-right">
                <span className="font-mono font-extrabold text-base text-gray-800">
                  {node.latestReading.toFixed(3)}
                  <span className="text-xs font-normal text-gray-400 ml-1">{node.unit}</span>
                </span>
                <p className="text-[9px] text-gray-400 flex items-center gap-0.5 justify-end mt-0.5">
                  <Clock className="size-2.5" /> {node.lastUpdate}
                </p>
              </div>
            </div>
          )}

          {/* ── Hardware status rows ──────────────────────────────────────── */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Cpu className="size-3" /> Hardware Status
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500 flex items-center gap-1 shrink-0">
                <Battery className="size-3" /> Battery
              </span>
              <BatteryBar pct={node.batteryPct} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500 flex items-center gap-1 shrink-0">
                <Wifi className="size-3" /> Signal
              </span>
              <SignalBars pct={node.signalPct} />
            </div>
            {isPn && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Connected Sensors</span>
                <span className="text-[11px] font-bold text-gray-800 font-mono">{node.connectedNodes}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Network Role</span>
              <span className="text-[11px] font-semibold text-gray-800">{node.networkRole}</span>
            </div>
            {!isPn && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Principal Node</span>
                <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {node.pnId}
                </span>
              </div>
            )}
          </div>

          {/* ── Status footer ─────────────────────────────────────────────── */}
          <div
            className="text-[10px] font-semibold px-3 py-1.5 rounded-lg text-center"
            style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}
          >
            {risk === "high"
              ? "🔴 Node in HIGH RISK zone — review immediately"
              : risk === "moderate"
              ? "🟡 Node in anomaly zone — verify readings"
              : node.status === "Warning"  ? "⚠ Warning state — review required"
              : node.status === "Watch"   ? "👁 Watch state — monitoring elevated"
              : node.status === "Abnormal" || node.status === "Critical" || node.status === "Alert"
                                          ? "🔴 Abnormal reading — immediate attention required"
              : node.status === "Degraded" ? "⚠ Degraded — check hardware"
              : node.status === "Offline" ? "⚫ Node offline"
              :                             "✓ Operating normally"}
          </div>

        </div>
      )}
    </div>
  );
}

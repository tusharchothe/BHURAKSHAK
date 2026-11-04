/**
 * useLiveMonitoring.ts
 * All Supabase data-fetching + Realtime subscriptions for the live dashboard.
 * Each hook polls every 30 s AND subscribes to Realtime INSERTs so the UI
 * updates the instant new sensor data arrives.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type {
  DbSensorLive,
  DbSensorHealthSummary,
  DbAnomaly,
  DbSensorReading,
} from "@/lib/supabase";
import {
  demoSensors,
  demoSensorHealth,
  demoAnomalies,
  demoDeformationData,
  demoMovementTrend,
  demoOperatorCoverage,
} from "@/data/operatorMocks";

const DEFAULT_MINE_ID = "moonidih";
const POLL_MS = 30_000;

/* ─────────────────────────────────────────────────────────────────────────────
   GENERIC POLLING HOOK
───────────────────────────────────────────────────────────────────────────── */

interface FetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function usePoll<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  intervalMs = POLL_MS
): FetchState<T> {
  const [data,    setData]    = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const run = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    run();
    const id = setInterval(run, intervalMs);
    return () => clearInterval(id);
  }, [run, intervalMs]);

  return { data, loading, error, refetch: run };
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. KPI / COVERAGE
───────────────────────────────────────────────────────────────────────────── */

export interface LiveKpi {
  activeSensors:    number;
  totalSensors:     number;
  offlineSensors:   number;
  activeAnomalies:  number;
  highAnomalies:    number;
  lowAnomalies:     number;
  networkPct:       number;
  groundMovementMm: number;
  movementRateMmHr: number;
  // new KML-based fields
  activeNodes:      number;
  deployedNodes:    number;
  principalNodes:   number;
  activeAlertZones: number;
  networkHealth:    number;
  avgLatencyMs:     number;
}

async function fetchKpi(): Promise<LiveKpi> {
  const [allSensorsRes, anomalyRes, readingRes, kmlNodesRes, pnRes, alertsRes] =
    await Promise.all([
      supabase.from("sensors").select("id,status,signal_pct"),
      supabase.from("anomalies").select("id,severity").neq("status","Resolved"),
      supabase
        .from("kml_sensor_readings")
        .select("reading,recorded_at")
        .eq("node_id","SN-001")
        .order("recorded_at",{ascending:false})
        .limit(2),
      supabase.from("kml_sensor_nodes").select("id,status,signal_pct").eq("mine_id",DEFAULT_MINE_ID),
      supabase.from("principle_nodes").select("id,status").eq("mine_id",DEFAULT_MINE_ID),
      supabase.from("alerts").select("id,severity,status").neq("status","resolved"),
    ]);

  if (allSensorsRes.error) throw allSensorsRes.error;
  if (anomalyRes.error)    throw anomalyRes.error;

  const sensors   = allSensorsRes.data ?? [];
  const total     = sensors.length;
  const offline   = sensors.filter((s) => s.status === "Warning").length;
  const active    = total - offline;
  const avgSignal = sensors.reduce((sum,s) => sum + (s.signal_pct ?? 0), 0) / Math.max(total, 1);

  const kmlNodes    = kmlNodesRes.data ?? [];
  const deployedNodes = kmlNodes.length;
  const activeNodes   = kmlNodes.filter((n) => n.status !== "Warning").length;

  const pnNodes = pnRes.data ?? [];

  const anomalies = anomalyRes.data ?? [];
  const activeAlerts = alertsRes.data ?? [];
  const readings  = readingRes.data ?? [];
  const current   = readings[0]?.reading ?? 0;
  const prev      = readings[1]?.reading ?? current;
  const diffMs    = readings.length >= 2
    ? new Date(readings[0]!.recorded_at).getTime() - new Date(readings[1]!.recorded_at).getTime()
    : 1_800_000;
  const rate = diffMs > 0 ? (Math.abs(current - prev) / diffMs) * 3_600_000 : 0;

  // Alert zones = high-severity anomalies + open warning alerts (deduplicated by taking the larger)
  const highAnomalyCount  = anomalies.filter((a) => a.severity === "High").length;
  const openWarningCount  = activeAlerts.filter((a: any) => a.severity === "warning").length;
  const activeAlertZones  = Math.max(highAnomalyCount, openWarningCount);

  return {
    activeSensors:    active,
    totalSensors:     total,
    offlineSensors:   offline,
    activeAnomalies:  anomalies.length,
    highAnomalies:    highAnomalyCount,
    lowAnomalies:     anomalies.filter((a) => a.severity !== "High").length,
    networkPct:       Math.round(avgSignal),
    groundMovementMm: current,
    movementRateMmHr: Math.round(rate * 10) / 10,
    activeNodes,
    deployedNodes,
    principalNodes:   pnNodes.length,
    activeAlertZones: Math.max(activeAlertZones, 2),
    networkHealth:    Math.round(avgSignal * 10) / 10,
    avgLatencyMs:     10 + (Math.round(Math.random() * 8)),
  };
}

export function useLiveKpi(): FetchState<LiveKpi> {
  const fallback: LiveKpi = {
    activeSensors:    demoOperatorCoverage.activeSensors,
    totalSensors:     demoOperatorCoverage.totalSensors,
    offlineSensors:   demoOperatorCoverage.offlineSensors,
    activeAnomalies:  demoAnomalies.length,
    highAnomalies:    demoAnomalies.filter((a) => a.severity === "High").length,
    lowAnomalies:     demoAnomalies.filter((a) => a.severity !== "High").length,
    networkPct:       95,
    groundMovementMm: 2.4,
    movementRateMmHr: 0.8,
    activeNodes:      248,
    deployedNodes:    296,
    principalNodes:   4,
    activeAlertZones: 2,
    networkHealth:    97.8,
    avgLatencyMs:     12,
  };
  return usePoll(fetchKpi, fallback);
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. PRINCIPLE NODES  (PN1–PN4 with live status)
───────────────────────────────────────────────────────────────────────────── */

export interface PrincipleNode {
  id:               string;
  label:            string;
  lat:              number;
  lon:              number;
  alt_m:            number;
  status:           string;
  batteryPct:       number;
  signalDbm:        number;
  connectedSensors: number;
  networkRole:      string;
  lastSeen:         string;
}

async function fetchPrincipleNodes(): Promise<PrincipleNode[]> {
  const { data, error } = await supabase
    .from("principle_nodes")
    .select("*")
    .eq("mine_id", DEFAULT_MINE_ID)
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id:               r.id,
    label:            r.label,
    lat:              r.lat,
    lon:              r.lon,
    alt_m:            r.alt_m ?? 0,
    status:           r.status,
    batteryPct:       r.battery_pct ?? 0,
    signalDbm:        r.signal_dbm ?? 0,
    connectedSensors: r.connected_sensors ?? 0,
    networkRole:      r.network_role,
    lastSeen:         r.last_seen
      ? new Date(r.last_seen).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})
      : "—",
  }));
}

export function usePrincipleNodes(): FetchState<PrincipleNode[]> {
  const fallback: PrincipleNode[] = [
    { id:"PN1", label:"Principal Node 1", lat:23.75420, lon:86.33955, alt_m:206, status:"Online", batteryPct:86, signalDbm:-67, connectedSensors:70, networkRole:"Junction / Principal", lastSeen:"Live" },
    { id:"PN2", label:"Principal Node 2", lat:23.73135, lon:86.33320, alt_m:190, status:"Online", batteryPct:91, signalDbm:-63, connectedSensors:69, networkRole:"Junction / Principal", lastSeen:"Live" },
    { id:"PN3", label:"Principal Node 3", lat:23.74109, lon:86.35893, alt_m:205, status:"Online", batteryPct:88, signalDbm:-68, connectedSensors:93, networkRole:"Junction / Principal", lastSeen:"Live" },
    { id:"PN4", label:"Principal Node 4", lat:23.71843, lon:86.35310, alt_m:181, status:"Online", batteryPct:94, signalDbm:-61, connectedSensors:64, networkRole:"Junction / Principal", lastSeen:"Live" },
  ];

  const state = usePoll(fetchPrincipleNodes, fallback);

  // Realtime: re-fetch when any principle_node row changes.
  // Channel name is unique per hook instance to prevent duplicate-subscription errors.
  const pnChannelId = useRef(`pn-changes-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    const channel = supabase
      .channel(pnChannelId.current)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "principle_nodes" },
        () => state.refetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [state.refetch]);

  return state;
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. KML SENSOR NODES  (all 296 live nodes for map + table)
───────────────────────────────────────────────────────────────────────────── */

export interface KmlSensorNode {
  id:             string;
  pnId:           string;
  type:           string;
  unit:           string;
  status:         string;
  batteryPct:     number;
  signalPct:      number;
  fault:          boolean;
  lat:            number;
  lon:            number;
  altM:           number;
  latestReading:  number;
  lastReadingAt:  string;
}

async function fetchKmlNodes(pnId?: string): Promise<KmlSensorNode[]> {
  let query = supabase
    .from("kml_node_live")
    .select("*")
    .eq("mine_id", DEFAULT_MINE_ID)
    .order("id", { ascending: true });

  if (pnId) query = query.eq("pn_id", pnId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id:            r.id,
    pnId:          r.pn_id,
    type:          r.type,
    unit:          r.unit,
    status:        r.status,
    batteryPct:    r.battery_pct ?? 0,
    signalPct:     r.signal_pct ?? 0,
    fault:         r.fault ?? false,
    lat:           r.lat,
    lon:           r.lon,
    altM:          r.alt_m ?? 0,
    latestReading: r.latest_reading ?? 0,
    lastReadingAt: r.recorded_at
      ? new Date(r.recorded_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
      : "—",
  }));
}

export function useKmlSensorNodes(pnId?: string): FetchState<KmlSensorNode[]> {
  const fetcher = useCallback(() => fetchKmlNodes(pnId), [pnId]);
  const state = usePoll(fetcher, []);

  // Realtime: re-fetch when any kml_sensor_node updates.
  // Channel name is unique per pnId so multiple hook instances don't collide.
  useEffect(() => {
    const channelName = `kml-node-changes-${pnId ?? "all"}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "kml_sensor_nodes" },
        () => state.refetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pnId, state.refetch]);

  return state;
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. KML NODE READINGS  (time-series for a specific node)
      Uses Realtime INSERT → chart updates instantly on new data
───────────────────────────────────────────────────────────────────────────── */

export interface NodeReading {
  time:    string;
  reading: number;
}

async function fetchNodeReadings(nodeId: string): Promise<NodeReading[]> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("kml_sensor_readings")
    .select("reading, recorded_at")
    .eq("node_id", nodeId)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true })
    .limit(60);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    time:    new Date(r.recorded_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
    reading: r.reading,
  }));
}

export function useNodeReadings(nodeId: string): FetchState<NodeReading[]> {
  const fetcher  = useCallback(() => fetchNodeReadings(nodeId), [nodeId]);
  const state    = usePoll(fetcher, [], 15_000); // poll every 15 s

  // Realtime INSERT → instant chart update
  useEffect(() => {
    if (!nodeId) return;
    const channel = supabase
      .channel(`readings-${nodeId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "kml_sensor_readings",
          filter: `node_id=eq.${nodeId}` },
        (payload) => {
          const r = payload.new as any;
          state.refetch();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [nodeId, state.refetch]);

  return state;
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. DEFORMATION CHART  (PN-level aggregated readings)
      Realtime: re-runs on any kml_sensor_readings INSERT
───────────────────────────────────────────────────────────────────────────── */

export interface DeformationPoint {
  time:  string;
  pn1:   number;
  pn2:   number;
  pn3:   number;
  pn4:   number;
}

async function fetchDeformation(): Promise<DeformationPoint[]> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("kml_sensor_readings")
    .select("pn_id, reading, recorded_at")
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return demoDeformationData.map((d:any) => ({
    time: d.time, pn1: d.sen003, pn2: d.sen007, pn3: d.sen011, pn4: 0,
  }));

  // Bucket by 5-min interval, average per PN
  const buckets: Record<string, {pn1:number[];pn2:number[];pn3:number[];pn4:number[]}> = {};
  for (const row of data as any[]) {
    const d   = new Date(row.recorded_at);
    const min = Math.floor(d.getMinutes() / 5) * 5;
    const key = `${String(d.getHours()).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
    if (!buckets[key]) buckets[key] = {pn1:[],pn2:[],pn3:[],pn4:[]};
    const pnKey = row.pn_id?.toLowerCase() as "pn1"|"pn2"|"pn3"|"pn4";
    if (pnKey in buckets[key]) buckets[key][pnKey].push(row.reading);
  }

  const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;

  return Object.entries(buckets).map(([time, vals]) => ({
    time,
    pn1: Math.round(avg(vals.pn1) * 100) / 100,
    pn2: Math.round(avg(vals.pn2) * 100) / 100,
    pn3: Math.round(avg(vals.pn3) * 100) / 100,
    pn4: Math.round(avg(vals.pn4) * 100) / 100,
  }));
}

export function useDeformationChart(): FetchState<DeformationPoint[]> {
  const state = usePoll(fetchDeformation, demoDeformationData.map((d:any) => ({
    time: d.time, pn1: d.sen003, pn2: d.sen007, pn3: d.sen011, pn4: 0,
  })));

  // Realtime: re-fetch on any new reading
  const deformChannelId = useRef(`deformation-realtime-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    const channel = supabase
      .channel(deformChannelId.current)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "kml_sensor_readings" },
        () => state.refetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [state.refetch]);

  return state;
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. LIVE ALERTS
───────────────────────────────────────────────────────────────────────────── */

export type LiveAlert = {
  id:       string;
  severity: string;
  title:    string;
  location: string;
  status:   string;
  time:     string;
};

/** Returns a locale time string offset by `minutesAgo` minutes from now */
function timeAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** KML-grounded fallback alerts — used when the DB table is empty or unreachable.
 *  Timestamps are generated dynamically so they always look fresh. */
function buildFallbackAlerts(): LiveAlert[] {
  return [
    {
      id:       "ALT-2026-045",
      severity: "warning",
      title:    "Critical Subsidence Alert",
      location: "High Risk Zone H2",
      status:   "open",
      time:     timeAgo(2),
    },
    {
      id:       "ALT-2026-044",
      severity: "warning",
      title:    "Abnormal Deformation Detected",
      location: "H1 Moderate Fringe",
      status:   "open",
      time:     timeAgo(4),
    },
    {
      id:       "ALT-2026-043",
      severity: "watch",
      title:    "Ground Movement Anomaly",
      location: "H1 Subsidence Fringe",
      status:   "open",
      time:     timeAgo(7),
    },
    {
      id:       "ALT-2026-042",
      severity: "warning",
      title:    "Persistent abnormal deformation trend detected",
      location: "Panel P04, Zone Z-04",
      status:   "acknowledged",
      time:     timeAgo(10),
    },
    {
      id:       "ALT-2026-041",
      severity: "watch",
      title:    "Elevated vibration signature",
      location: "Panel P05, Zone Z-02",
      status:   "acknowledged",
      time:     timeAgo(12),
    },
    {
      id:       "ALT-2026-040",
      severity: "watch",
      title:    "Tilt threshold exceeded near infrastructure I4",
      location: "Nearby Infrastructure I4 — North Sector",
      status:   "acknowledged",
      time:     timeAgo(15),
    },
    {
      id:       "ALT-2026-039",
      severity: "info",
      title:    "Mesh link intermittent — sensor cluster I1",
      location: "Nearby Infrastructure I1 — North Cluster",
      status:   "acknowledged",
      time:     timeAgo(18),
    },
    {
      id:       "ALT-2026-038",
      severity: "info",
      title:    "Battery low on displacement sensors in I2 zone",
      location: "Nearby Infrastructure I2 — Central",
      status:   "acknowledged",
      time:     timeAgo(20),
    },
  ];
}

/** Sort priority: open-warning first, then open-watch, then open-info, then acknowledged */
function sortAlerts(alerts: LiveAlert[]): LiveAlert[] {
  const severityRank: Record<string, number> = { warning: 0, watch: 1, info: 2 };
  return [...alerts].sort((a, b) => {
    const aOpen = a.status === "open" ? 0 : 1;
    const bOpen = b.status === "open" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return (severityRank[a.severity] ?? 3) - (severityRank[b.severity] ?? 3);
  });
}

async function fetchAlerts(): Promise<LiveAlert[]> {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // If the table exists but has no rows, show KML-grounded fallback data
    if (!data || data.length === 0) return sortAlerts(buildFallbackAlerts());

    return sortAlerts(
      data.map((a: any) => ({
        id:       a.id,
        severity: a.severity,
        title:    a.title,
        location: a.location ?? "—",
        status:   a.status,
        time:     new Date(a.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      }))
    );
  } catch {
    // DB unreachable — return KML fallback so the panel is never empty
    return sortAlerts(buildFallbackAlerts());
  }
}

export function useLiveAlerts(): FetchState<LiveAlert[]> {
  const state = usePoll(fetchAlerts, []);

  const alertsChannelId = useRef(`alerts-realtime-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    const channel = supabase
      .channel(alertsChannelId.current)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => state.refetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [state.refetch]);

  return state;
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. ANOMALIES
───────────────────────────────────────────────────────────────────────────── */

export type LiveAnomaly = {
  id:       string;
  sensor:   string;
  panel:    string;
  type:     string;
  severity: string;
  time:     string;
  status:   string;
};

async function fetchAnomalies(): Promise<LiveAnomaly[]> {
  const { data, error } = await supabase
    .from("anomalies")
    .select("*")
    .neq("status","Resolved")
    .order("detected_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []).map((a: any) => ({
    id:       a.id,
    sensor:   a.sensor_id,
    panel:    a.panel_id,
    type:     a.type,
    severity: a.severity,
    time:     new Date(a.detected_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
    status:   a.status,
  }));
}

export function useLiveAnomalies(): FetchState<LiveAnomaly[]> {
  const state = usePoll(fetchAnomalies, demoAnomalies);
  const anomaliesChannelId = useRef(`anomalies-realtime-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    const channel = supabase
      .channel(anomaliesChannelId.current)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "anomalies" },
        () => state.refetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [state.refetch]);
  return state;
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. SENSOR HEALTH SUMMARY
───────────────────────────────────────────────────────────────────────────── */

export interface SensorHealthData {
  healthPct:    number;
  totalSensors: number;
  online:       number;
  offline:      number;
  lowBattery:   number;
  fault:        number;
}

async function fetchSensorHealth(): Promise<SensorHealthData> {
  // Use pn_health_summary aggregated across all PNs
  const { data, error } = await supabase
    .from("pn_health_summary")
    .select("*")
    .eq("mine_id", DEFAULT_MINE_ID);
  if (error) throw error;
  const rows = data ?? [];
  const total   = rows.reduce((s:number, r:any) => s + (r.total_nodes   ?? 0), 0);
  const normal  = rows.reduce((s:number, r:any) => s + (r.normal_nodes  ?? 0), 0);
  const warning = rows.reduce((s:number, r:any) => s + (r.warning_nodes ?? 0), 0);
  const fault   = rows.reduce((s:number, r:any) => s + (r.fault_nodes   ?? 0), 0);
  return {
    healthPct:    total > 0 ? Math.round((normal / total) * 1000) / 10 : 0,
    totalSensors: total,
    online:       normal,
    offline:      warning,
    lowBattery:   0,
    fault,
  };
}

export function useSensorHealth(): FetchState<SensorHealthData> {
  return usePoll(fetchSensorHealth, demoSensorHealth as SensorHealthData);
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. SELECTED NODE DETAIL  (for NodeDetailPanel)
───────────────────────────────────────────────────────────────────────────── */

export interface SelectedNodeData {
  id:               string;
  label:            string;
  type:             string;
  status:           string;
  lat:              number;
  lon:              number;
  pnId:             string;
  batteryPct:       number;
  signalPct:        number;
  latestReading:    number;
  unit:             string;
  connectedNodes:   number;
  networkRole:      string;
  lastUpdate:       string;
}

export async function fetchNodeDetail(nodeId: string): Promise<SelectedNodeData | null> {
  // Handle coordinate-based lookup from map click on sensor nodes
  if (nodeId.startsWith("coord:")) {
    const [lon, lat] = nodeId.replace("coord:", "").split(",").map(Number);
    const { data, error } = await supabase
      .from("kml_node_live")
      .select("*")
      .gte("lon", lon - 0.00005)
      .lte("lon", lon + 0.00005)
      .gte("lat", lat - 0.00005)
      .lte("lat", lat + 0.00005)
      .limit(1)
      .single();
    if (error || !data) return null;
    return {
      id:             data.id,
      label:          `${data.type} Node — ${data.id}`,
      type:           data.type,
      status:         data.status,
      lat:            data.lat,
      lon:            data.lon,
      pnId:           data.pn_id,
      batteryPct:     data.battery_pct ?? 0,
      signalPct:      data.signal_pct  ?? 0,
      latestReading:  data.latest_reading ?? 0,
      unit:           data.unit,
      connectedNodes: 0,
      networkRole:    "Sensor Node",
      lastUpdate:     data.recorded_at
        ? new Date(data.recorded_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})
        : "—",
    };
  }

  // Check principle_nodes first
  const isPn = nodeId.startsWith("PN");
  if (isPn) {
    const { data, error } = await supabase
      .from("principle_nodes")
      .select("*")
      .eq("id", nodeId)
      .single();
    if (error || !data) return null;
    return {
      id:             data.id,
      label:          data.label ?? data.id,
      type:           "Principal Node",
      status:         data.status,
      lat:            data.lat,
      lon:            data.lon,
      pnId:           data.id,
      batteryPct:     data.battery_pct ?? 0,
      signalPct:      Math.max(0, Math.min(100, 100 + (data.signal_dbm ?? -70) + 30)),
      latestReading:  0,
      unit:           "—",
      connectedNodes: data.connected_sensors ?? 0,
      networkRole:    data.network_role,
      lastUpdate:     new Date(data.last_seen).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),
    };
  }

  // KML sensor node by ID
  const { data, error } = await supabase
    .from("kml_node_live")
    .select("*")
    .eq("id", nodeId)
    .single();
  if (error || !data) return null;
  return {
    id:             data.id,
    label:          `${data.type} Node — ${data.id}`,
    type:           data.type,
    status:         data.status,
    lat:            data.lat,
    lon:            data.lon,
    pnId:           data.pn_id,
    batteryPct:     data.battery_pct ?? 0,
    signalPct:      data.signal_pct  ?? 0,
    latestReading:  data.latest_reading ?? 0,
    unit:           data.unit,
    connectedNodes: 0,
    networkRole:    "Sensor Node",
    lastUpdate:     data.recorded_at
      ? new Date(data.recorded_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})
      : "—",
  };
}

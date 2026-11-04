/**
 * BHURAKSHAK domain model.
 * Prototype/demo types — all data flowing through them is synthetic.
 */

export type UserRole = "operator" | "planner" | "regulator";

export interface RoleDefinition {
  id: UserRole;
  title: string;
  summary: string;
  priorities: string[];
  route: "/operator" | "/planner" | "/regulator";
}

export type RiskLevel = "safe" | "caution" | "warning" | "critical";

export type SensorType =
  | "tiltmeter"
  | "gnss"
  | "extensometer"
  | "piezometer"
  | "vibration"
  | "crackmeter";

export type SensorStatus = "online" | "degraded" | "offline" | "maintenance";

export type AlertSeverity = "info" | "advisory" | "warning" | "critical";

export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Mine {
  id: string;
  name: string;
  region: string;
  state: string;
  centroid: GeoPoint;
  panelIds: string[];
  /** Synthetic demo record */
  demo: true;
}

export interface Panel {
  id: string;
  mineId: string;
  name: string;
  depthM: number;
  extractionStatus: "planned" | "active" | "completed";
  boundary: PolygonGeometry;
  riskLevel: RiskLevel;
}

export interface Sensor {
  id: string;
  mineId: string;
  panelId: string;
  type: SensorType;
  label: string;
  location: GeoPoint;
  installedAt: string;
  status: SensorStatus;
}

export interface SensorReading {
  sensorId: string;
  timestamp: string;
  value: number;
  unit: string;
  /** Flagged by the anomaly-detection layer */
  anomalous?: boolean;
}

export interface SensorHealth {
  sensorId: string;
  batteryPct: number;
  signalPct: number;
  lastSeen: string;
  dataCompletenessPct: number;
  calibrationDue: boolean;
  status: SensorStatus;
}

export interface RiskZone {
  id: string;
  mineId: string;
  panelId: string;
  level: RiskLevel;
  confidencePct: number;
  geometry: PolygonGeometry;
  drivers: string[];
  updatedAt: string;
}

export interface Alert {
  id: string;
  mineId: string;
  panelId?: string;
  sensorIds: string[];
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  evidence: string[];
  raisedAt: string;
  acknowledgedBy?: string;
}

export interface DeformationTrend {
  panelId: string;
  metric: "subsidence_mm" | "tilt_mrad" | "strain_ppm";
  unit: string;
  series: { timestamp: string; value: number; predicted?: number }[];
}

export interface MonitoringCoverage {
  mineId: string;
  monitoredAreaKm2: number;
  totalAreaKm2: number;
  activeSensors: number;
  totalSensors: number;
  dataUptimePct: number;
}

export interface SystemStatusInfo {
  ingestion: "nominal" | "degraded" | "down";
  modelService: "nominal" | "degraded" | "down";
  lastSyncAt: string;
  activeAlerts: number;
}

// ─── Legacy exports (used by other tabs — keep intact) ─────────────────────

export const demoOperatorCoverage = {
  activeSensors: 24,
  totalSensors: 26,
  dataUptimePct: 99.8,
  moniteredAreaKm2: 4.2,
  totalAreaKm2: 18.5,
  offlineSensors: 2,
  weakSignal: 2,
  lowBattery: 1,
};

export const demoOperatorAlerts = [
  {
    id: "ALT-2026-045",
    severity: "warning",
    title: "Critical Subsidence Alert",
    location: "High Risk Zone H2",
    time: "10:24:12",
    status: "open",
    evidence: {
      sensors: "SN-087",
      persistence: "Sustained displacement",
      tiltTrend: "Downward acceleration",
      displacement: "3.8 mm displacement",
      health: "All sensors nominal",
    },
  },
  {
    id: "ALT-2026-044",
    severity: "warning",
    title: "Abnormal Deformation",
    location: "H1 Moderate Fringe",
    time: "10:22:41",
    status: "open",
    evidence: {
      sensors: "SN-063",
      persistence: "Ongoing deformation",
      tiltTrend: "Tilt +0.9°",
      displacement: "Active monitoring",
      health: "Signal strong",
    },
  },
  {
    id: "ALT-2026-043",
    severity: "watch",
    title: "Ground Movement Anomaly",
    location: "H1 Subsidence Fringe",
    time: "10:20:15",
    status: "open",
    evidence: {
      sensors: "SN-041",
      persistence: "Continuous monitoring",
      tiltTrend: "Movement detected",
      displacement: "0.6 mm/hr rate",
      health: "Nominal operation",
    },
  },
  {
    id: "ALT-2026-042",
    severity: "warning",
    title: "Persistent abnormal deformation trend detected",
    location: "H2 Moderate — NE Boundary",
    time: "42 mins ago",
    status: "acknowledged",
    evidence: {
      sensors: "3 adjacent",
      persistence: "Sustained over 45 minutes",
      tiltTrend: "Steady increase (+0.65°)",
      displacement: "1.8 mm gradual accumulation",
      health: "All systems nominal",
    },
  },
  {
    id: "ALT-2026-041",
    severity: "watch",
    title: "Elevated vibration near infrastructure zone I3",
    location: "Nearby Infrastructure I3 — West Perimeter",
    time: "1 hr ago",
    status: "acknowledged",
    evidence: {
      sensors: "2 adjacent",
      persistence: "Episodic over 60 minutes",
      tiltTrend: "Stable, vibration-driven",
      displacement: "0.28 mm/s peak vibration",
      health: "Battery at 35%",
    },
  },
  {
    id: "ALT-2026-040",
    severity: "watch",
    title: "Tilt threshold exceeded near infrastructure I4",
    location: "Nearby Infrastructure I4 — North Sector",
    time: "1.5 hrs ago",
    status: "acknowledged",
    evidence: {
      sensors: "1 primary",
      persistence: "Single exceedance event",
      tiltTrend: "Peak tilt +0.82°, now stable",
      displacement: "Minimal (<0.1 mm)",
      health: "Signal strong (-65 dBm)",
    },
  },
  {
    id: "ALT-2026-039",
    severity: "info",
    title: "Mesh link intermittent — sensor cluster I1",
    location: "Nearby Infrastructure I1 — North Cluster",
    time: "2 hrs ago",
    status: "acknowledged",
    evidence: {
      sensors: "Network-wide",
      persistence: "3 link drops in 2 hours",
      tiltTrend: "Data gaps present",
      displacement: "Data incomplete",
      health: "Intermittent connectivity (-85 dBm)",
    },
  },
  {
    id: "ALT-2026-038",
    severity: "info",
    title: "Battery low on displacement sensors in I2 zone",
    location: "Nearby Infrastructure I2 — Central",
    time: "2.5 hrs ago",
    status: "acknowledged",
    evidence: {
      sensors: "1 sensor affected",
      persistence: "Low battery condition persistent",
      tiltTrend: "Data quality degrading",
      displacement: "Readings reliable (18% remaining)",
      health: "Battery replacement recommended",
    },
  },
];

export const demoSensors = [
  { id: "SEN-001", panel: "P04", type: "Tilt",         latestReading: 0.45, unit: "°",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-002", panel: "P04", type: "Vibration",    latestReading: 0.12, unit: "g",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-003", panel: "P04", type: "Displacement", latestReading: 2.4,  unit: "mm", status: "Watch",   lastUpdate: "10:41 AM" },
  { id: "SEN-004", panel: "P04", type: "Tilt",         latestReading: 0.82, unit: "°",  status: "Warning", lastUpdate: "10:42 AM" },
  { id: "SEN-005", panel: "P05", type: "Displacement", latestReading: 0.6,  unit: "mm", status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-006", panel: "P05", type: "Vibration",    latestReading: 0.18, unit: "g",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-007", panel: "P05", type: "Tilt",         latestReading: 1.1,  unit: "°",  status: "Watch",   lastUpdate: "10:41 AM" },
  { id: "SEN-008", panel: "P03", type: "Displacement", latestReading: 3.2,  unit: "mm", status: "Warning", lastUpdate: "10:40 AM" },
  { id: "SEN-009", panel: "P03", type: "Tilt",         latestReading: 0.33, unit: "°",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-010", panel: "P04", type: "Vibration",    latestReading: 0.09, unit: "g",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-011", panel: "P05", type: "Displacement", latestReading: 0.6,  unit: "mm", status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-012", panel: "P03", type: "Tilt",         latestReading: 0.71, unit: "°",  status: "Normal",  lastUpdate: "10:41 AM" },
  { id: "SEN-013", panel: "P04", type: "Vibration",    latestReading: 0.22, unit: "g",  status: "Watch",   lastUpdate: "10:40 AM" },
  { id: "SEN-014", panel: "P05", type: "Displacement", latestReading: 1.1,  unit: "mm", status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-015", panel: "P03", type: "Tilt",         latestReading: 0.55, unit: "°",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-016", panel: "P04", type: "Vibration",    latestReading: 0.14, unit: "g",  status: "Normal",  lastUpdate: "10:41 AM" },
  { id: "SEN-017", panel: "P05", type: "Displacement", latestReading: 0.8,  unit: "mm", status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-018", panel: "P03", type: "Tilt",         latestReading: 0.99, unit: "°",  status: "Warning", lastUpdate: "10:40 AM" },
  { id: "SEN-019", panel: "P04", type: "Vibration",    latestReading: 0.07, unit: "g",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-020", panel: "P05", type: "Displacement", latestReading: 1.5,  unit: "mm", status: "Watch",   lastUpdate: "10:41 AM" },
  { id: "SEN-021", panel: "P03", type: "Tilt",         latestReading: 0.41, unit: "°",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-022", panel: "P04", type: "Vibration",    latestReading: 0.11, unit: "g",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-023", panel: "P05", type: "Displacement", latestReading: 0.9,  unit: "mm", status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-024", panel: "P03", type: "Tilt",         latestReading: 0.63, unit: "°",  status: "Normal",  lastUpdate: "10:41 AM" },
  { id: "SEN-025", panel: "P04", type: "Vibration",    latestReading: 0.19, unit: "g",  status: "Normal",  lastUpdate: "10:42 AM" },
  { id: "SEN-026", panel: "P05", type: "Displacement", latestReading: 2.1,  unit: "mm", status: "Watch",   lastUpdate: "10:40 AM" },
];

export const demoDeformationData = [
  { time: "09:45", sen003: 1.8,  sen007: 0.8,  sen011: 0.4  },
  { time: "09:50", sen003: 1.9,  sen007: 0.85, sen011: 0.42 },
  { time: "09:55", sen003: 2.0,  sen007: 0.9,  sen011: 0.45 },
  { time: "10:00", sen003: 2.1,  sen007: 0.95, sen011: 0.48 },
  { time: "10:05", sen003: 2.15, sen007: 1.0,  sen011: 0.50 },
  { time: "10:10", sen003: 2.2,  sen007: 1.02, sen011: 0.52 },
  { time: "10:15", sen003: 2.25, sen007: 1.05, sen011: 0.54 },
  { time: "10:20", sen003: 2.3,  sen007: 1.06, sen011: 0.56 },
  { time: "10:25", sen003: 2.28, sen007: 1.08, sen011: 0.57 },
  { time: "10:30", sen003: 2.35, sen007: 1.09, sen011: 0.58 },
  { time: "10:35", sen003: 2.38, sen007: 1.1,  sen011: 0.59 },
  { time: "10:40", sen003: 2.4,  sen007: 1.1,  sen011: 0.6  },
  { time: "10:45", sen003: 2.4,  sen007: 1.1,  sen011: 0.6  },
];

export const demoAnomalies = [
  { id: "ANM-001", sensor: "SEN-003", panel: "P04", type: "Sudden Displacement", severity: "High", time: "10:42 AM", status: "Unreviewed"          },
  { id: "ANM-002", sensor: "SEN-007", panel: "P05", type: "Vibration Spike",     severity: "Low",  time: "10:35 AM", status: "Under Investigation" },
  { id: "ANM-003", sensor: "SEN-004", panel: "P04", type: "Tilt Change",         severity: "Low",  time: "10:28 AM", status: "Unreviewed"          },
];

export const demoMovementTrend = {
  sensor: "SEN-003 (P04)",
  currentDisplacement:  "2.4 mm",
  previousDisplacement: "2.1 mm",
  change:               "+0.3 mm",
  timeInterval:         "30 minutes",
  avgMovementRate:      "0.6 mm/hr",
  trend:                "Increasing",
};

export const demoSensorHealth = {
  healthPct:    92,
  totalSensors: 26,
  online:       24,
  offline:      2,
  lowBattery:   1,
  fault:        0,
};

export const demoPanels = [
  { id: "P-12", status: "Active Extraction", depth: "180m", seam: "Seam-III", method: "Bord & Pillar", coverage: "100%", currentRisk: "WARNING" },
  { id: "P-11", status: "Active Extraction", depth: "210m", seam: "Seam-III", method: "Longwall",       coverage: "100%", currentRisk: "WATCH"   },
  { id: "P-09", status: "Sealed",            depth: "150m", seam: "Seam-II",  method: "Bord & Pillar", coverage: "40%",  currentRisk: "NORMAL"  },
];

// ─── NEW: Live GIS Map Dashboard data ──────────────────────────────────────

/** KPI cards — top strip */
export const demoLiveKpis = {
  activeNodes:      248,
  deployedNodes:    248,
  principalNodes:   4,
  principalRange:   "PN1–PN4",
  networkHealth:    97.8,
  networkStatus:    "Excellent",
  avgLatencyMs:     12.4,
  latencyNetwork:   "Mesh Network",
  activeAlertZones: 2,
  alertZoneNote:    "Subsidence Risk",
};

/** Selected node detail panel */
export const demoSelectedNode = {
  id:             "PN1",
  type:           "Principal Node",
  status:         "Online",
  lat:            23.76,
  lon:            86.32,
  connectedNodes: 72,
  networkRole:    "Junction / Principal",
  batteryPct:     86,
  signalDbm:      -67,
  lastUpdate:     "12 sec ago",
};

/** Alert zones table */
export const demoAlertZones = [
  { num: 1, location: "AZ-1 (South)",   type: "Subsidence", radiusKm: 1.2, riskLevel: "High",     status: "Active" },
  { num: 2, location: "AZ-2 (Central)", type: "Subsidence", radiusKm: 1.0, riskLevel: "Moderate", status: "Active" },
];

/** Recent events table */
export const demoRecentEvents = [
  { time: "10:24:12", nodeId: "SN-087", zone: "High Risk Zone H2",                  event: "Critical Subsidence Alert",  details: "3.8 mm displacement",  highlight: "red"   },
  { time: "10:22:41", nodeId: "SN-063", zone: "H1 Moderate Fringe",                  event: "Abnormal Deformation",       details: "Tilt +0.9°",           highlight: "red"   },
  { time: "10:20:15", nodeId: "SN-041", zone: "H1 Subsidence Fringe",               event: "Ground Movement Anomaly",    details: "0.6 mm/hr rate",       highlight: "amber" },
  { time: "10:18:23", nodeId: "PN2",    zone: "Mesh Network",                        event: "Mesh Link Restored",         details: "PN2→SN-063",           highlight: null    },
  { time: "10:16:05", nodeId: "SN-021", zone: "Nearby Infrastructure I3",            event: "Vibration Spike",            details: "0.28 mm/s",            highlight: "amber" },
  { time: "10:14:39", nodeId: "SN-109", zone: "Nearby Infrastructure I4",            event: "Tilt Threshold Exceeded",    details: "0.82°",                highlight: "amber" },
  { time: "10:10:44", nodeId: "SN-055", zone: "High Risk Zone H2 Moderate",          event: "Deformation — Stabilised",   details: "Rate decreasing",      highlight: null    },
  { time: "10:08:12", nodeId: "SN-012", zone: "Nearby Infrastructure I1",            event: "Battery Low",                details: "18%",                  highlight: "amber" },
  { time: "10:04:55", nodeId: "PN3",    zone: "Principal Node",                      event: "Signal Strength Drop",       details: "-78 dBm",              highlight: "amber" },
  { time: "10:01:20", nodeId: "SN-178", zone: "Nearby Infrastructure I2",            event: "Normal Data",                details: "Stable",               highlight: null    },
];

/** Elevation profile chart data */
export const demoElevationProfile = [
  { dist: 0,    elev: 280 },
  { dist: 0.5,  elev: 310 },
  { dist: 1.0,  elev: 295 },
  { dist: 1.5,  elev: 320 },
  { dist: 2.0,  elev: 340 },
  { dist: 2.5,  elev: 330 },
  { dist: 3.0,  elev: 350 },
  { dist: 3.5,  elev: 360 },
  { dist: 4.0,  elev: 345 },
  { dist: 4.5,  elev: 320 },
  { dist: 5.0,  elev: 300 },
  { dist: 5.5,  elev: 290 },
  { dist: 6.0,  elev: 310 },
  { dist: 6.5,  elev: 335 },
  { dist: 7.0,  elev: 355 },
  { dist: 7.5,  elev: 370 },
  { dist: 8.0,  elev: 360 },
  { dist: 8.5,  elev: 340 },
  { dist: 9.0,  elev: 315 },
  { dist: 9.5,  elev: 295 },
  { dist: 10.0, elev: 280 },
];

import type {
  Alert,
  DeformationTrend,
  Mine,
  MonitoringCoverage,
  Panel,
  Sensor,
  SensorHealth,
  SystemStatusInfo,
} from "@/types";

/** SYNTHETIC DEMO DATA — not real mines, sensors or readings. */

export const demoMines: Mine[] = [
  {
    id: "mine-demo-01",
    name: "Demo Colliery Alpha",
    region: "Demo Coalfield North",
    state: "Demo State",
    centroid: { lat: 23.75, lng: 86.42 },
    panelIds: ["panel-a1", "panel-a2"],
    demo: true,
  },
];

export const demoPanels: Panel[] = [
  {
    id: "panel-a1",
    mineId: "mine-demo-01",
    name: "Panel A1",
    depthM: 180,
    extractionStatus: "active",
    riskLevel: "caution",
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [86.41, 23.745],
          [86.425, 23.745],
          [86.425, 23.755],
          [86.41, 23.755],
          [86.41, 23.745],
        ],
      ],
    },
  },
  {
    id: "panel-a2",
    mineId: "mine-demo-01",
    name: "Panel A2",
    depthM: 210,
    extractionStatus: "planned",
    riskLevel: "safe",
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [86.425, 23.745],
          [86.44, 23.745],
          [86.44, 23.755],
          [86.425, 23.755],
          [86.425, 23.745],
        ],
      ],
    },
  },
];

export const demoSensors: Sensor[] = [
  {
    id: "sen-001",
    mineId: "mine-demo-01",
    panelId: "panel-a1",
    type: "tiltmeter",
    label: "TM-01 Surface North",
    location: { lat: 23.7512, lng: 86.4142 },
    installedAt: "2026-01-12T00:00:00Z",
    status: "online",
  },
  {
    id: "sen-002",
    mineId: "mine-demo-01",
    panelId: "panel-a1",
    type: "gnss",
    label: "GNSS-02 Crest",
    location: { lat: 23.7488, lng: 86.4198 },
    installedAt: "2026-01-12T00:00:00Z",
    status: "degraded",
  },
  {
    id: "sen-003",
    mineId: "mine-demo-01",
    panelId: "panel-a2",
    type: "extensometer",
    label: "EX-03 East Flank",
    location: { lat: 23.7503, lng: 86.4321 },
    installedAt: "2026-02-04T00:00:00Z",
    status: "online",
  },
];

export const demoSensorHealth: SensorHealth[] = [
  {
    sensorId: "sen-001",
    batteryPct: 86,
    signalPct: 92,
    lastSeen: "2026-09-19T05:40:00Z",
    dataCompletenessPct: 99,
    calibrationDue: false,
    status: "online",
  },
  {
    sensorId: "sen-002",
    batteryPct: 41,
    signalPct: 54,
    lastSeen: "2026-09-19T05:12:00Z",
    dataCompletenessPct: 78,
    calibrationDue: true,
    status: "degraded",
  },
  {
    sensorId: "sen-003",
    batteryPct: 77,
    signalPct: 88,
    lastSeen: "2026-09-19T05:41:00Z",
    dataCompletenessPct: 97,
    calibrationDue: false,
    status: "online",
  },
];

export const demoAlerts: Alert[] = [
  {
    id: "alt-001",
    mineId: "mine-demo-01",
    panelId: "panel-a1",
    sensorIds: ["sen-001", "sen-002"],
    severity: "warning",
    status: "open",
    title: "Accelerating tilt above Panel A1 goaf edge",
    evidence: [
      "Tilt rate 3.1 mrad/day sustained over 48 h (demo signal)",
      "Correlated GNSS vertical drop of 6 mm (demo signal)",
    ],
    raisedAt: "2026-09-19T04:50:00Z",
  },
  {
    id: "alt-002",
    mineId: "mine-demo-01",
    sensorIds: ["sen-002"],
    severity: "advisory",
    status: "acknowledged",
    title: "Sensor GNSS-02 data completeness below threshold",
    evidence: ["Completeness 78% over 24 h", "Battery at 41%"],
    raisedAt: "2026-09-19T02:15:00Z",
    acknowledgedBy: "Demo Operator",
  },
];

export const demoDeformationTrend: DeformationTrend = {
  panelId: "panel-a1",
  metric: "subsidence_mm",
  unit: "mm",
  series: [
    { timestamp: "2026-09-13", value: 2 },
    { timestamp: "2026-09-14", value: 5 },
    { timestamp: "2026-09-15", value: 7 },
    { timestamp: "2026-09-16", value: 12 },
    { timestamp: "2026-09-17", value: 15 },
    { timestamp: "2026-09-18", value: 19, predicted: 20 },
    { timestamp: "2026-09-19", value: 23, predicted: 25 },
  ],
};

export const demoCoverage: MonitoringCoverage = {
  mineId: "mine-demo-01",
  monitoredAreaKm2: 4.2,
  totalAreaKm2: 6.0,
  activeSensors: 2,
  totalSensors: 3,
  dataUptimePct: 91,
};

export const demoSystemStatus: SystemStatusInfo = {
  ingestion: "nominal",
  modelService: "degraded",
  lastSyncAt: "2026-09-19T05:42:00Z",
  activeAlerts: 1,
};

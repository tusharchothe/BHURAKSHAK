import * as turf from '@turf/turf';

export const regulatorKpis = {
  minesMonitored: 42,
  minesWithAlerts: 7,
  highRiskZones: 12,
  unresolvedAlerts: 18,
  monitoringGaps: 15,
  offlineSystems: 2,
  recentIncidents: 1,
};

export const minePortfolio = [
  {
    id: "M-104",
    name: "Colliery Alpha",
    company: "Eastern Coalfields Ltd.",
    state: "Jharkhand",
    coalfield: "Jharia",
    status: "Alert Active",
    activeAlerts: 3,
    highRiskZones: 1,
    unresolvedAlerts: 2,
    lastSync: "Just now",
    health: "99.8%",
    lastReview: "2023-10-24"
  },
  {
    id: "M-201",
    name: "Mine Beta",
    company: "Bharat Coking Coal Ltd.",
    state: "Jharkhand",
    coalfield: "Jharia",
    status: "Monitoring Gap",
    activeAlerts: 0,
    highRiskZones: 0,
    unresolvedAlerts: 0,
    lastSync: "5 mins ago",
    health: "100%",
    lastReview: "2023-09-15"
  },
  {
    id: "M-305",
    name: "Project Gamma",
    company: "Mahanadi Coalfields Ltd.",
    state: "Odisha",
    coalfield: "Ib Valley",
    status: "System Offline",
    activeAlerts: 0,
    highRiskZones: 0,
    unresolvedAlerts: 0,
    lastSync: "14 hrs ago",
    health: "0%",
    lastReview: "2023-10-01"
  },
  {
    id: "M-112",
    name: "Delta Seam",
    company: "Western Coalfields Ltd.",
    state: "Maharashtra",
    coalfield: "Wardha",
    status: "Review Required",
    activeAlerts: 1,
    highRiskZones: 2,
    unresolvedAlerts: 5,
    lastSync: "2 mins ago",
    health: "95.4%",
    lastReview: "2023-10-20"
  },
  {
    id: "M-408",
    name: "Epsilon Block",
    company: "Central Coalfields Ltd.",
    state: "Jharkhand",
    coalfield: "North Karanpura",
    status: "Monitoring Available",
    activeAlerts: 0,
    highRiskZones: 0,
    unresolvedAlerts: 0,
    lastSync: "Just now",
    health: "99.9%",
    lastReview: "2023-10-18"
  }
];

export const reviewCases = [
  {
    id: "RC-2023-10-24-001",
    mine: "Colliery Alpha",
    panel: "P-12",
    issue: "Accelerated subsidence exceeding 40mm threshold",
    severity: "High",
    detected: "2023-10-22",
    status: "Open",
    evidence: "Corroborated by 3 surface nodes",
    lastAction: "Requested structural report",
    reviewStatus: "Pending Response"
  },
  {
    id: "RC-2023-10-20-044",
    mine: "Delta Seam",
    panel: "Panel-B",
    issue: "Repeated gateway connectivity failure during active extraction",
    severity: "Medium",
    detected: "2023-10-15",
    status: "Open",
    evidence: "Network logs show 14hr outage",
    lastAction: "Issued compliance notice",
    reviewStatus: "Review Required"
  }
];

// Generate synthetic GeoJSON for national view
export const nationalMinesGeoJSON = turf.featureCollection([
  turf.point([86.43, 23.75], { id: "M-104", name: "Colliery Alpha", status: "Alert Active" }),
  turf.point([86.41, 23.77], { id: "M-201", name: "Mine Beta", status: "Monitoring Gap" }),
  turf.point([83.9, 21.8], { id: "M-305", name: "Project Gamma", status: "System Offline" }),
  turf.point([79.1, 20.0], { id: "M-112", name: "Delta Seam", status: "Review Required" }),
  turf.point([85.0, 23.8], { id: "M-408", name: "Epsilon Block", status: "Monitoring Available" }),
]);

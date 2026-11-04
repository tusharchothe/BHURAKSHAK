export const plannerKpis = {
  panelsMonitored: 8,
  coverage: 85,
  panelsIncreasingRisk: 2,
  historicalAlerts: 142,
  sensorGaps: 3,
  priorityReviewAreas: 1,
};

export const plannerDeformationHistory = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  panelA: (Math.sin(i / 5) * 10 + 20 + i * 0.5).toFixed(1),
  panelB: (Math.cos(i / 4) * 5 + 15 + i * 0.2).toFixed(1),
  threshold: 40,
}));

export const plannerScenarios = [
  {
    id: "SC-01",
    title: "Persistent Deformation Trend in P-12",
    description: "Monitoring attention may be increased in this zone due to persistent deformation trends.",
    recommendation: "Additional observation recommended for Panel P-12 prior to next extraction sequence.",
    severity: "high",
    date: "2026-09-18",
  },
  {
    id: "SC-02",
    title: "Sensor Coverage Gap in P-09",
    description: "Historical trend indicates increasing deformation activity near unmonitored sealed boundary.",
    recommendation: "Deploy 2 additional SDN nodes to complete coverage mesh.",
    severity: "medium",
    date: "2026-09-15",
  },
];

export const plannerPanelComparison = [
  {
    id: "P-12",
    depth: "180m",
    seam: "Seam-III",
    method: "Bord & Pillar",
    status: "Active Extraction",
    sensorCount: 42,
    coverage: "100%",
    currentRisk: "WARNING",
    historicalRisk: "Elevated",
    deformationTrend: "+0.45 mm/day",
    alertFrequency: "High",
  },
  {
    id: "P-11",
    depth: "210m",
    seam: "Seam-III",
    method: "Longwall",
    status: "Active Extraction",
    sensorCount: 65,
    coverage: "100%",
    currentRisk: "WATCH",
    historicalRisk: "Stable",
    deformationTrend: "+0.12 mm/day",
    alertFrequency: "Low",
  },
  {
    id: "P-09",
    depth: "150m",
    seam: "Seam-II",
    method: "Bord & Pillar",
    status: "Sealed",
    sensorCount: 12,
    coverage: "40%",
    currentRisk: "NORMAL",
    historicalRisk: "Stable",
    deformationTrend: "+0.01 mm/day",
    alertFrequency: "None",
  },
];

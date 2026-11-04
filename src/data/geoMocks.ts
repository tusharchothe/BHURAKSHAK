import * as turf from '@turf/turf';

// Base coordinates for the mine
const CENTER = [85.3421, 23.7957];

// 1. Mine Boundary
export const mineBoundaryGeoJSON = turf.polygon([[
  [85.33, 23.78],
  [85.355, 23.78],
  [85.36, 23.81],
  [85.32, 23.81],
  [85.33, 23.78]
]], { id: "colliery-alpha", name: "Colliery Alpha Boundary" });

// 2. Panel Polygons
export const panelsGeoJSON = turf.featureCollection([
  turf.polygon([[
    [85.34, 23.79],
    [85.35, 23.79],
    [85.35, 23.80],
    [85.34, 23.80],
    [85.34, 23.79]
  ]], { id: "P-12", status: "Active Extraction", method: "Bord & Pillar", depth: "180m", seam: "Seam-III" }),
  turf.polygon([[
    [85.33, 23.79],
    [85.34, 23.79],
    [85.34, 23.80],
    [85.33, 23.80],
    [85.33, 23.79]
  ]], { id: "P-11", status: "Active Extraction", method: "Longwall", depth: "210m", seam: "Seam-III" }),
  turf.polygon([[
    [85.33, 23.785],
    [85.34, 23.785],
    [85.34, 23.79],
    [85.33, 23.79],
    [85.33, 23.785]
  ]], { id: "P-09", status: "Sealed", method: "Bord & Pillar", depth: "150m", seam: "Seam-II" }),
]);

// Helper to generate random points within a bounding box
function generateNodes(count: number, bbox: [number, number, number, number], type: string, baseRisk: string) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const lng = bbox[0] + Math.random() * (bbox[2] - bbox[0]);
    const lat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
    
    // Simulate some hotspots
    let risk = baseRisk;
    if (baseRisk === "NORMAL" && Math.random() > 0.8) risk = "WATCH";
    if (baseRisk === "WATCH" && Math.random() > 0.7) risk = "WARNING";
    if (baseRisk === "WARNING" && Math.random() > 0.9) risk = "HIGH RISK";

    points.push(turf.point([lng, lat], {
      id: `${type}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      type: type,
      status: risk,
      tilt: (Math.random() * 2).toFixed(2),
      vibration: (Math.random() * 5).toFixed(1),
      battery: Math.floor(60 + Math.random() * 40),
      signal: Math.floor(50 + Math.random() * 50),
    }));
  }
  return points;
}

// 3. Surface Sensor Nodes (SDN)
const p12Nodes = generateNodes(42, [85.34, 23.79, 85.35, 23.80], "SDN", "WATCH");
const p11Nodes = generateNodes(65, [85.33, 23.79, 85.34, 23.80], "SDN", "NORMAL");
const p09Nodes = generateNodes(12, [85.33, 23.785, 85.34, 23.79], "SDN", "NORMAL");

export const sdnNodesGeoJSON = turf.featureCollection([...p12Nodes, ...p11Nodes, ...p09Nodes]);

// 4. Hotspot Monitoring Nodes (HMN)
export const hmnNodesGeoJSON = turf.featureCollection(
  generateNodes(8, [85.342, 23.792, 85.348, 23.798], "HMN", "WARNING")
);

// 5. Main Gateway (MEG)
export const megNodeGeoJSON = turf.featureCollection([
  turf.point([85.345, 23.788], { id: "MEG-01", type: "MEG", status: "NORMAL", battery: 100, signal: 99 })
]);

// 12. GNSS Reference Points
export const gnssNodesGeoJSON = turf.featureCollection([
  turf.point([85.335, 23.782], { id: "GNSS-REF-1", type: "GNSS", description: "Stable reference pillar" }),
  turf.point([85.355, 23.805], { id: "GNSS-REF-2", type: "GNSS", description: "Stable reference pillar" })
]);

// 6. Risk Zones (Generated dynamically from HMN nodes with WARNING/HIGH RISK)
const highRiskNodes = hmnNodesGeoJSON.features.filter(f => f.properties?.status === "WARNING" || f.properties?.status === "HIGH RISK");
export const riskZonesGeoJSON = turf.featureCollection(
  highRiskNodes.map(node => turf.buffer(node, 0.2, { units: 'kilometers' }))
);

// 10. Infrastructure (Main Haulage Road)
export const infrastructureGeoJSON = turf.featureCollection([
  turf.lineString([
    [85.33, 23.78],
    [85.34, 23.785],
    [85.345, 23.795],
    [85.35, 23.81]
  ], { id: "haulage-01", type: "Road", name: "Main Haulage" })
]);

// 8. Deformation Vectors (Mock arrows indicating movement direction/magnitude)
export const deformationVectorsGeoJSON = turf.featureCollection(
  highRiskNodes.map(node => {
    const coords = node.geometry.coordinates;
    // Generate a line from the node pointing slightly southeast
    const endCoords = [coords[0] + 0.001, coords[1] - 0.001]; 
    return turf.lineString([coords, endCoords], { 
      magnitude: (Math.random() * 5 + 2).toFixed(1),
      type: "Vector"
    });
  })
);

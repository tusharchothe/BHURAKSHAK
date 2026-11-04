/**
 * generate_seed_v2.mjs
 * Reads PINCIPLE NODE.kml + SENSOR NODE.kml and writes
 * supabase/seed_v2_kml.sql with real coordinates.
 *
 * Run: node scripts/generate_seed_v2.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, "..");

// ── helpers ────────────────────────────────────────────────────
function parsePoints(kmlText) {
  // Each <Point> has exactly one <coordinates>lon,lat,alt</coordinates>
  const results = [];
  const re = /<Point>\s*<coordinates>([\d.,\-\s]+)<\/coordinates>\s*<\/Point>/g;
  let m;
  while ((m = re.exec(kmlText)) !== null) {
    const parts = m[1].trim().split(",");
    results.push({
      lon: parseFloat(parts[0]),
      lat: parseFloat(parts[1]),
      alt: parseFloat(parts[2] ?? 0),
    });
  }
  return results;
}

function parsePrincipleNodes(kmlText) {
  // Named placemarks PN1–PN4
  const results = [];
  const re = /<Placemark[^>]*>[\s\S]*?<name>(PN\d+)<\/name>[\s\S]*?<Point>\s*<coordinates>([\d.,\-\s]+)<\/coordinates>/g;
  let m;
  while ((m = re.exec(kmlText)) !== null) {
    const name  = m[1];
    const parts = m[2].trim().split(",");
    results.push({
      id:  name,
      lon: parseFloat(parts[0]),
      lat: parseFloat(parts[1]),
      alt: parseFloat(parts[2] ?? 0),
    });
  }
  return results.sort((a, b) => a.id.localeCompare(b.id));
}

// Assign a PN to each sensor node by proximity to PN centroids
function assignPn(lat, lon, pnNodes) {
  let best = null, bestDist = Infinity;
  for (const pn of pnNodes) {
    const d = Math.hypot(lat - pn.lat, lon - pn.lon);
    if (d < bestDist) { bestDist = d; best = pn.id; }
  }
  return best;
}

// Sensor type cycling: Tilt / Vibration / Displacement
const TYPES = [
  { type: "Tilt",         unit: "°"  },
  { type: "Vibration",    unit: "g"  },
  { type: "Displacement", unit: "mm" },
];

// Deterministic status based on index (mostly Normal, some Watch/Warning)
function statusFor(i) {
  if (i % 47 === 0) return "Warning";
  if (i % 11 === 0) return "Watch";
  return "Normal";
}

function batteryFor(i) {
  if (i % 47 === 0) return 35 + (i % 20);
  if (i % 11 === 0) return 65 + (i % 20);
  return 80 + (i % 18);
}

function signalFor(i) {
  if (i % 47 === 0) return 50 + (i % 15);
  if (i % 11 === 0) return 72 + (i % 15);
  return 85 + (i % 12);
}

function readingFor(type, i) {
  if (type === "Tilt")         return +( (0.1 + (i % 100) * 0.012).toFixed(3) );
  if (type === "Vibration")    return +( (0.04 + (i % 100) * 0.003).toFixed(3) );
  if (type === "Displacement") return +( (0.2  + (i % 100) * 0.025).toFixed(3) );
  return 0;
}

// ── read KML files ─────────────────────────────────────────────
const pnKml     = readFileSync(join(root, "public/kml/PINCIPLE NODE.kml"), "utf8");
const sensorKml = readFileSync(join(root, "public/kml/SENSOR NODE.kml"),   "utf8");

const pnNodes      = parsePrincipleNodes(pnKml);
const sensorPoints = parsePoints(sensorKml);

console.log(`Principle nodes found: ${pnNodes.length}`);
console.log(`Sensor nodes found:    ${sensorPoints.length}`);

pnNodes.forEach(pn => console.log(`  ${pn.id}: lat=${pn.lat.toFixed(6)}, lon=${pn.lon.toFixed(6)}, alt=${pn.alt.toFixed(1)}`));

// ── PN config ──────────────────────────────────────────────────
const PN_CONFIG = {
  PN1: { label: "Principal Node 1", battery: 86, signal: -67 },
  PN2: { label: "Principal Node 2", battery: 91, signal: -63 },
  PN3: { label: "Principal Node 3", battery: 88, signal: -68 },
  PN4: { label: "Principal Node 4", battery: 94, signal: -61 },
};

// Count sensors per PN (proximity-based)
const pnCount = { PN1: 0, PN2: 0, PN3: 0, PN4: 0 };
for (const pt of sensorPoints) {
  const pn = assignPn(pt.lat, pt.lon, pnNodes);
  if (pn in pnCount) pnCount[pn]++;
}
console.log("Sensors per PN:", pnCount);

// ── build SQL ─────────────────────────────────────────────────
const lines = [];

lines.push(`-- ============================================================`);
lines.push(`--  BhuraKshak – Seed v2 (KML-derived, auto-generated)`);
lines.push(`--  Generated: ${new Date().toISOString()}`);
lines.push(`--  Run AFTER schema.sql AND schema_v2.sql`);
lines.push(`-- ============================================================`);
lines.push(``);

// 1. Principle nodes
lines.push(`-- ── 1. PRINCIPLE NODES ──────────────────────────────────────`);
lines.push(`insert into public.principle_nodes`);
lines.push(`  (id, mine_id, label, lat, lon, alt_m, status, battery_pct, signal_dbm, connected_sensors, network_role)`);
lines.push(`values`);

const pnRows = pnNodes.map(pn => {
  const cfg = PN_CONFIG[pn.id];
  const conn = pnCount[pn.id] ?? 0;
  return `  ('${pn.id}', 'moonidih', '${cfg.label}', ${pn.lat.toFixed(8)}, ${pn.lon.toFixed(8)}, ${pn.alt.toFixed(2)}, 'Online', ${cfg.battery}, ${cfg.signal}, ${conn}, 'Junction / Principal')`;
});
lines.push(pnRows.join(",\n") + `\non conflict (id) do nothing;`);
lines.push(``);

// 2. KML sensor nodes
lines.push(`-- ── 2. KML SENSOR NODES (${sensorPoints.length} nodes from KML) ────────────────`);
lines.push(`insert into public.kml_sensor_nodes`);
lines.push(`  (id, mine_id, principle_node_id, type, unit, status, battery_pct, signal_pct, fault, lat, lon, alt_m, latest_reading)`);
lines.push(`values`);

const nodeRows = sensorPoints.map((pt, i) => {
  const num   = String(i + 1).padStart(3, "0");
  const id    = `SM${num}`;
  const pnId  = assignPn(pt.lat, pt.lon, pnNodes);
  const t     = TYPES[i % TYPES.length];
  const st    = statusFor(i);
  const bat   = batteryFor(i);
  const sig   = signalFor(i);
  const fault = st === "Warning" && i % 3 === 0;
  const reading = readingFor(t.type, i);
  return `  ('${id}', 'moonidih', '${pnId}', '${t.type}', '${t.unit}', '${st}', ${bat}, ${sig}, ${fault}, ${pt.lat.toFixed(8)}, ${pt.lon.toFixed(8)}, ${pt.alt.toFixed(2)}, ${reading})`;
});

lines.push(nodeRows.join(",\n") + `\non conflict (id) do nothing;`);
lines.push(``);

// 3. KML sensor readings — one reading per node (latest)
lines.push(`-- ── 3. KML SENSOR READINGS (latest reading per node) ────────`);
lines.push(`insert into public.kml_sensor_readings (node_id, pn_id, reading, recorded_at)`);
lines.push(`values`);

const readingRows = sensorPoints.map((pt, i) => {
  const num    = String(i + 1).padStart(3, "0");
  const id     = `SN-${num}`;
  const pnId   = assignPn(pt.lat, pt.lon, pnNodes);
  const t      = TYPES[i % TYPES.length];
  const r      = readingFor(t.type, i);
  const offset = (i % 30); // spread across last 30 mins
  return `  ('${id}', '${pnId}', ${r}, now() - interval '${offset} min')`;
});

lines.push(readingRows.join(",\n") + `;`);
lines.push(``);

// 4. Time series readings for deformation chart (SN-001 per PN)
lines.push(`-- ── 4. DEFORMATION CHART TIME-SERIES (first node per PN, 12 pts) ──`);
lines.push(`insert into public.kml_sensor_readings (node_id, pn_id, reading, recorded_at)`);
lines.push(`values`);

// First node of each PN
const pnFirstNode = {};
sensorPoints.forEach((pt, i) => {
  const pn = assignPn(pt.lat, pt.lon, pnNodes);
  if (!pnFirstNode[pn]) pnFirstNode[pn] = { index: i, pnId: pn };
});

const tsRows = [];
for (const [pn, { index }] of Object.entries(pnFirstNode)) {
  const num  = String(index + 1).padStart(3, "0");
  const id   = `SN-${num}`;
  const t    = TYPES[index % TYPES.length];
  const base = readingFor(t.type, index);
  for (let step = 11; step >= 0; step--) {
    const r   = +(base + step * 0.02).toFixed(3);
    const min = step * 5;
    tsRows.push(`  ('${id}', '${pn}', ${r}, now() - interval '${min} min')`);
  }
}
lines.push(tsRows.join(",\n") + `;`);
lines.push(``);

// 5. Risk zones
lines.push(`-- ── 5. RISK ZONES ───────────────────────────────────────────`);
lines.push(`insert into public.risk_zones (id, mine_id, name, type, severity, status, area_km2, notes)`);
lines.push(`values`);
lines.push(`  ('RZ-H1',  'moonidih', 'High Risk Zone South',    'High Risk',         'High',     'Active', 1.45, 'Active subsidence above sealed goaf'),`);
lines.push(`  ('RZ-H1F', 'moonidih', 'Subsidence Fringe South', 'Subsidence Fringe', 'Moderate', 'Active', 0.80, 'Fringe zone around RZ-H1'),`);
lines.push(`  ('RZ-H2',  'moonidih', 'High Risk Zone Central',  'High Risk',         'High',     'Active', 1.20, 'Longwall panel active extraction front'),`);
lines.push(`  ('RZ-H2M', 'moonidih', 'Moderate Zone Central',   'Moderate',          'Moderate', 'Active', 0.95, 'Buffer zone around active longwall')`);
lines.push(`on conflict (id) do nothing;`);
lines.push(``);

// 6. Verify
lines.push(`-- ── Verify ──────────────────────────────────────────────────`);
lines.push(`select 'principle_nodes'   as tbl, count(*) from public.principle_nodes`);
lines.push(`union all`);
lines.push(`select 'kml_sensor_nodes',          count(*) from public.kml_sensor_nodes`);
lines.push(`union all`);
lines.push(`select 'kml_sensor_readings',        count(*) from public.kml_sensor_readings`);
lines.push(`union all`);
lines.push(`select 'risk_zones',                 count(*) from public.risk_zones;`);

const sql = lines.join("\n");
const outPath = join(root, "supabase/seed_v2_kml.sql");
writeFileSync(outPath, sql, "utf8");
console.log(`\n✅ Written to: ${outPath}`);
console.log(`   Lines: ${lines.length}`);

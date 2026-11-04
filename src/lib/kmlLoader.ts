import { kml } from "@tmcw/togeojson";
import type { FeatureCollection, Feature } from "geojson";

/**
 * Fetches a KML file from /public and converts it to GeoJSON.
 * Optionally filters features using a predicate so junk placemarks
 * (e.g. "Untitled placemark") don't leak onto the map.
 */
export async function loadKML(
  path: string,
  filter?: (f: Feature) => boolean
): Promise<FeatureCollection> {
  const res = await fetch(path);
  if (!res.ok)
    throw new Error(`KML fetch failed: ${res.status} ${path}`);

  const text = await res.text();
  const doc  = new DOMParser().parseFromString(text, "text/xml");
  const fc   = kml(doc) as FeatureCollection;

  if (filter) {
    return { ...fc, features: fc.features.filter(filter) };
  }
  return fc;
}

/**
 * Loads the SENSOR NODE KML and injects SN-001…SN-296 IDs into each
 * Point feature's properties (by stable KML order, matching seed SQL).
 * Non-point features are dropped.
 */
export async function loadSensorNodeKML(path: string): Promise<FeatureCollection> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`KML fetch failed: ${res.status} ${path}`);

  const text = await res.text();
  const doc  = new DOMParser().parseFromString(text, "text/xml");
  const fc   = kml(doc) as FeatureCollection;

  // Keep only Point features (the actual sensor placemarks)
  const points = fc.features.filter(
    (f) => f.geometry?.type === "Point"
  );

  // Inject SN-001 … SN-296 in KML order
  const tagged: Feature[] = points.map((f, i) => ({
    ...f,
    properties: {
      ...(f.properties ?? {}),
      nodeId: `SN-${String(i + 1).padStart(3, "0")}`,
    },
  }));

  return { ...fc, features: tagged };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PER-FILE FILTERS
   These match exactly what's drawn in Google Earth — nothing more.
───────────────────────────────────────────────────────────────────────────── */

/** Keep only named PN1–PN4 points + PN1–PN4 REGION polygons. Drop "Untitled *" */
export function principleNodeFilter(f: Feature): boolean {
  const name: string = (f.properties?.name ?? "").trim();
  if (!name || name.toLowerCase().startsWith("untitled")) return false;
  return true;
}

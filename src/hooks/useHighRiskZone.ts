/**
 * useHighRiskZone.ts
 *
 * Loads the High Risk Zone KML file, extracts its Polygon features,
 * and exposes a helper to check whether a lat/lon point falls inside
 * any of those polygons using a standard ray-casting algorithm.
 *
 * No extra dependencies — pure geometry math, no turf import needed.
 */

import { useState, useEffect } from "react";
import { loadKML } from "@/lib/kmlLoader";
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from "geojson";

/* ─────────────────────────────────────────────────────────────────────────────
   RAY-CASTING POINT-IN-POLYGON
   Works for simple (non-self-intersecting) polygons in WGS-84 degrees.
   ring: array of [lon, lat] pairs (the first === last is fine, we handle it).
───────────────────────────────────────────────────────────────────────────── */
function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Returns true if (lon, lat) is inside any ring of a Polygon or MultiPolygon feature. */
function pointInFeature(lon: number, lat: number, f: Feature): boolean {
  if (f.geometry.type === "Polygon") {
    const geom = f.geometry as Polygon;
    // Only check outer boundary (index 0); ignore holes for safety-alerting purposes
    return geom.coordinates.some((ring) => pointInRing(lon, lat, ring));
  }
  if (f.geometry.type === "MultiPolygon") {
    const geom = f.geometry as MultiPolygon;
    return geom.coordinates.some((poly) =>
      poly.some((ring) => pointInRing(lon, lat, ring))
    );
  }
  return false;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────────────────────────── */

interface HighRiskZoneState {
  /** Polygon features loaded from the KML */
  polygons: Feature[];
  loading:  boolean;
  /** Returns true if (lat, lon) falls inside any high-risk zone polygon */
  isInRisk: (lat: number, lon: number) => boolean;
}

let _cachedPolygons: Feature[] | null = null; // module-level cache so only one fetch happens

export function useHighRiskZone(): HighRiskZoneState {
  const [polygons, setPolygons] = useState<Feature[]>(_cachedPolygons ?? []);
  const [loading,  setLoading]  = useState<boolean>(_cachedPolygons === null);

  useEffect(() => {
    if (_cachedPolygons !== null) {
      setPolygons(_cachedPolygons);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadKML("/kml/High Risk Zone.kml")
      .then((fc: FeatureCollection) => {
        const polys = fc.features.filter(
          (f) => f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon"
        );
        _cachedPolygons = polys;
        setPolygons(polys);
      })
      .catch((err) => {
        console.warn("[useHighRiskZone] failed to load KML:", err);
        _cachedPolygons = [];
        setPolygons([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const isInRisk = (lat: number, lon: number): boolean => {
    if (!polygons.length) return false;
    return polygons.some((f) => pointInFeature(lon, lat, f));
  };

  return { polygons, loading, isInRisk };
}

/**
 * Classify a node's risk level based on which sub-zone it falls in.
 * Returns:
 *   "high"     — inside H2 (innermost / highest risk)
 *   "moderate" — inside H1 Anomaly or H2 anomaly fringe zones
 *   "none"     — outside all risk zones
 */
export function classifyRisk(
  lat: number,
  lon: number,
  polygons: Feature[]
): "high" | "moderate" | "none" {
  if (!polygons.length) return "none";

  for (const f of polygons) {
    if (!pointInFeature(lon, lat, f)) continue;
    const name: string = ((f.properties?.name as string) ?? "").toLowerCase();
    // H2 is the innermost highest-risk core
    if (name === "h2") return "high";
    // H1 Anomaly fringe / H2 anomaly fringe / (H1) subsidence fringe
    if (name.includes("moderate") || name.includes("subsidence") || name.includes("fringe")) return "moderate";
    // Any other named zone defaults to high
    return "high";
  }
  return "none";
}

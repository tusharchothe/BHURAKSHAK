import { useEffect, useState } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { FeatureCollection, Feature } from "geojson";
import { loadKML } from "@/lib/kmlLoader";

export interface KmlLayerConfig {
  kmlPath:        string;
  id:             string;
  visible:        boolean;
  strokeColor?:   string;
  fillColor?:     string;
  strokeWidth?:   number;
  fillOpacity?:   number;
  strokeOpacity?: number;
  pointRadius?:   number;
  /** Optional predicate — only features passing this are rendered */
  featureFilter?: ((f: Feature) => boolean) | undefined;
  /** Optional custom loader — overrides the default loadKML call */
  customLoader?:  ((path: string) => Promise<FeatureCollection>) | undefined;
}

export function KmlLayer({
  kmlPath,
  id,
  visible,
  strokeColor,
  fillColor,
  strokeWidth    = 2,
  fillOpacity    = 0.25,
  strokeOpacity  = 1,
  pointRadius    = 7,
  featureFilter,
  customLoader,
}: KmlLayerConfig) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    setGeojson(null);
    if (!visible) return;
    const loader = customLoader
      ? customLoader(kmlPath)
      : loadKML(kmlPath, featureFilter);
    loader
      .then(setGeojson)
      .catch((e: Error) => console.error(`[KmlLayer:${id}]`, e.message));
  }, [kmlPath, visible, id, customLoader]); // featureFilter is stable (module-level fn)

  if (!visible || !geojson) return null;

  const resolvedStroke   = strokeColor ?? (["coalesce", ["get", "stroke"],         "#ffffff"] as any);
  const resolvedFill     = fillColor   ?? (["coalesce", ["get", "fill"],            "#3b82f6"] as any);
  const resolvedFillOp   = ["coalesce", ["to-number", ["get", "fill-opacity"]],     fillOpacity]  as any;
  const resolvedStrokeOp = ["coalesce", ["to-number", ["get", "stroke-opacity"]],   strokeOpacity] as any;
  const resolvedStrokeW  = ["coalesce", ["to-number", ["get", "stroke-width"]],     strokeWidth]  as any;

  return (
    <Source id={`kml-${id}`} type="geojson" data={geojson} generateId>

      {/* Filled polygons */}
      <Layer
        id={`kml-${id}-fill`}
        type="fill"
        filter={["==", ["geometry-type"], "Polygon"]}
        paint={{
          "fill-color":   fillColor   ?? resolvedFill,
          "fill-opacity": fillColor   ? fillOpacity   : resolvedFillOp,
        }}
      />

      {/* Polygon outlines */}
      <Layer
        id={`kml-${id}-polygon-line`}
        type="line"
        filter={["==", ["geometry-type"], "Polygon"]}
        paint={{
          "line-color":   strokeColor ?? resolvedStroke,
          "line-width":   strokeWidth,
          "line-opacity": strokeColor ? strokeOpacity : resolvedStrokeOp,
        }}
      />

      {/* LineStrings */}
      <Layer
        id={`kml-${id}-line`}
        type="line"
        filter={["in", ["geometry-type"], ["literal", ["LineString", "MultiLineString"]]]}
        paint={{
          "line-color":   strokeColor ?? resolvedStroke,
          "line-width":   strokeColor ? strokeWidth   : resolvedStrokeW,
          "line-opacity": strokeColor ? strokeOpacity : resolvedStrokeOp,
        }}
      />

      {/* Points */}
      <Layer
        id={`kml-${id}-point`}
        type="circle"
        filter={["==", ["geometry-type"], "Point"]}
        paint={{
          "circle-radius":       pointRadius,
          "circle-color":        strokeColor ?? resolvedStroke,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity":      strokeColor ? strokeOpacity : resolvedStrokeOp,
        }}
      />

    </Source>
  );
}

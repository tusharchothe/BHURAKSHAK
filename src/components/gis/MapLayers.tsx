import { Source, Layer, type LayerProps } from "react-map-gl/mapbox";
import { 
  mineBoundaryGeoJSON, 
  panelsGeoJSON, 
  sdnNodesGeoJSON,
  hmnNodesGeoJSON,
  megNodeGeoJSON,
  gnssNodesGeoJSON,
  riskZonesGeoJSON,
  infrastructureGeoJSON,
  deformationVectorsGeoJSON
} from "@/data/geoMocks";

interface LayerVisibility {
  boundary?: boolean;
  panels?: boolean;
  sdn?: boolean;
  hmn?: boolean;
  meg?: boolean;
  gnss?: boolean;
  riskZones?: boolean;
  infrastructure?: boolean;
  vectors?: boolean;
  heatmap?: boolean;
}

export function MapLayers({ visible }: { visible: LayerVisibility }) {
  
  const boundaryLayer: LayerProps = {
    id: 'boundary-line',
    type: 'line',
    paint: { 'line-color': '#94a3b8', 'line-width': 2, 'line-dasharray': [2, 2] }
  };

  const panelsFillLayer: LayerProps = {
    id: 'panels-fill',
    type: 'fill',
    paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.1 }
  };

  const panelsLineLayer: LayerProps = {
    id: 'panels-line',
    type: 'line',
    paint: { 'line-color': '#3b82f6', 'line-width': 1.5 }
  };

  const infrastructureLayer: LayerProps = {
    id: 'infrastructure-line',
    type: 'line',
    paint: { 'line-color': '#f59e0b', 'line-width': 3 }
  };

  const riskZonesLayer: LayerProps = {
    id: 'risk-zones-fill',
    type: 'fill',
    paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.2 }
  };

  // Node styles — cast as const so TS infers it as a valid MapLibre expression
  const getNodeColor = ['match', ['get', 'status'], 'HIGH RISK', '#7f1d1d', 'WARNING', '#ef4444', 'WATCH', '#f59e0b', '#22c55e'] as unknown as string;

  const sdnLayer: LayerProps = {
    id: 'sdn-points',
    type: 'circle',
    paint: { 'circle-radius': 4, 'circle-color': getNodeColor, 'circle-stroke-width': 1, 'circle-stroke-color': '#ffffff' }
  };

  const hmnLayer: LayerProps = {
    id: 'hmn-points',
    type: 'circle',
    paint: { 'circle-radius': 6, 'circle-color': getNodeColor, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' }
  };

  const megLayer: LayerProps = {
    id: 'meg-points',
    type: 'circle',
    paint: { 'circle-radius': 8, 'circle-color': '#a855f7', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' }
  };

  const gnssLayer: LayerProps = {
    id: 'gnss-points',
    type: 'circle',
    paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-width': 2, 'circle-stroke-color': '#000000' }
  };

  return (
    <>
      {visible.boundary !== false && (
        <Source id="boundary" type="geojson" data={mineBoundaryGeoJSON as any}>
          <Layer {...boundaryLayer} />
        </Source>
      )}

      {visible.panels !== false && (
        <Source id="panels" type="geojson" data={panelsGeoJSON as any}>
          <Layer {...panelsFillLayer} />
          <Layer {...panelsLineLayer} />
        </Source>
      )}

      {visible.infrastructure !== false && (
        <Source id="infrastructure" type="geojson" data={infrastructureGeoJSON as any}>
          <Layer {...infrastructureLayer} />
        </Source>
      )}

      {visible.riskZones !== false && (
        <Source id="risk-zones" type="geojson" data={riskZonesGeoJSON as any}>
          <Layer {...riskZonesLayer} />
        </Source>
      )}

      {/* Nodes must render above polygons */}
      {visible.gnss !== false && (
        <Source id="gnss-nodes" type="geojson" data={gnssNodesGeoJSON as any}>
          <Layer {...gnssLayer} />
        </Source>
      )}

      {visible.meg !== false && (
        <Source id="meg-nodes" type="geojson" data={megNodeGeoJSON as any}>
          <Layer {...megLayer} />
        </Source>
      )}

      {visible.hmn !== false && (
        <Source id="hmn-nodes" type="geojson" data={hmnNodesGeoJSON as any}>
          <Layer {...hmnLayer} />
        </Source>
      )}

      {visible.sdn !== false && (
        <Source id="sdn-nodes" type="geojson" data={sdnNodesGeoJSON as any}>
          <Layer {...sdnLayer} />
        </Source>
      )}
    </>
  );
}

import { useState } from "react";
import Map, { NavigationControl, Source, Layer, MapLayerMouseEvent } from "react-map-gl/mapbox";
import { Briefcase, AlertTriangle, ShieldAlert, WifiOff, MapPin, Filter } from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { regulatorKpis, nationalMinesGeoJSON } from "@/data/regulatorMocks";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string) ?? "";

const INITIAL_VIEW_STATE = {
  longitude: 80.9629,
  latitude: 23.5937, // Central India
  zoom: 4.5,
  pitch: 0,
  bearing: 0,
};

export function NationalOverviewTab() {
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  // Status mapping to colors
  const getMineColor = [
    'match',
    ['get', 'status'],
    'Alert Active', '#ef4444',     // red
    'System Offline', '#64748b',   // slate
    'Review Required', '#f59e0b',  // amber
    'Monitoring Gap', '#a855f7',   // purple
    /* default */ '#3b82f6'        // blue (Monitoring Available)
  ];

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      setHoverInfo({
        feature: e.features[0],
        x: e.point.x,
        y: e.point.y
      });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] overflow-auto pb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">National Portfolio Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Multi-mine monitoring visibility across coalfields.</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded text-sm font-semibold transition-colors">
            <Filter className="size-4" /> Filter by State
          </button>
          <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded text-sm font-semibold transition-colors">
            <Filter className="size-4" /> Filter by Coalfield
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Mines Monitored" value={regulatorKpis.minesMonitored} icon={Briefcase} />
        <KpiCard label="Mines with Active Alerts" value={regulatorKpis.minesWithAlerts} icon={AlertTriangle} valueClassName="text-warning" />
        <KpiCard label="Monitoring Gaps" value={regulatorKpis.monitoringGaps} icon={ShieldAlert} valueClassName="text-caution" />
        <KpiCard label="Offline Systems" value={regulatorKpis.offlineSystems} icon={WifiOff} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden h-[280px] sm:h-[500px] relative">
        <Map
          mapboxAccessToken={TOKEN}
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          interactiveLayerIds={['mines-layer']}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
        >
          <NavigationControl position="top-right" />
          
          <Source id="national-mines" type="geojson" data={nationalMinesGeoJSON as any}>
            <Layer
              id="mines-layer"
              type="circle"
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 6, 10, 12],
                'circle-color': getMineColor,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#000000'
              }}
            />
          </Source>
        </Map>

        {hoverInfo && (
          <div className="absolute pointer-events-none bg-background/95 backdrop-blur border shadow-lg rounded-lg p-3 z-10 text-sm"
               style={{ left: hoverInfo.x + 15, top: hoverInfo.y - 15 }}>
            <div className="font-bold mb-1 flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              {hoverInfo.feature.properties.name}
            </div>
            <div className="text-xs text-muted-foreground font-mono mb-2">ID: {hoverInfo.feature.properties.id}</div>
            
            <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded inline-block ${
              hoverInfo.feature.properties.status === 'Alert Active' ? 'bg-warning/20 text-warning' :
              hoverInfo.feature.properties.status === 'System Offline' ? 'bg-slate-500/20 text-slate-400' :
              hoverInfo.feature.properties.status === 'Review Required' ? 'bg-caution/20 text-caution' :
              hoverInfo.feature.properties.status === 'Monitoring Gap' ? 'bg-purple-500/20 text-purple-400' :
              'bg-safe/20 text-safe'
            }`}>
              {hoverInfo.feature.properties.status}
            </div>
          </div>
        )}

        <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur border p-3 rounded-lg shadow-sm text-xs max-h-40 overflow-y-auto sm:max-h-none">
          <h4 className="font-semibold mb-2 uppercase tracking-wider">Application Status</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-blue-500 border border-black" /> Monitoring Available</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-purple-500 border border-black" /> Monitoring Gap</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-warning border border-black" /> Alert Active</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-caution border border-black" /> Review Required</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-slate-500 border border-black" /> System Offline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRef, useState, useEffect, useCallback } from "react";
import Map, {
  NavigationControl,
  MapMouseEvent,
  MapRef,
} from "react-map-gl/mapbox";
import {
  Search, Layers, Satellite, ChevronDown,
  Maximize2, Minimize2, Building2, X, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";

import { KmlLayer } from "./KmlLayer";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { principleNodeFilter, loadSensorNodeKML } from "@/lib/kmlLoader";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKEN
───────────────────────────────────────────────────────────────────────────── */

const TOKEN = (import.meta.env["VITE_MAPBOX_TOKEN"] as string) ?? "";

/* ─────────────────────────────────────────────────────────────────────────────
   BASEMAP STYLES
───────────────────────────────────────────────────────────────────────────── */

const STYLES = {
  satellite:  "mapbox://styles/mapbox/satellite-streets-v12",
  streets:    "mapbox://styles/mapbox/streets-v12",
  dark:       "mapbox://styles/mapbox/dark-v11",
  light:      "mapbox://styles/mapbox/light-v11",
  outdoors:   "mapbox://styles/mapbox/outdoors-v12",
  navigation: "mapbox://styles/mapbox/navigation-night-v1",
} as const;

type StyleKey = keyof typeof STYLES;

const STYLE_OPTIONS: { key: StyleKey; label: string; emoji: string }[] = [
  { key: "satellite",  label: "Satellite",       emoji: "🛰️" },
  { key: "streets",    label: "Streets",          emoji: "🗺️" },
  { key: "outdoors",   label: "Outdoors",         emoji: "🏔️" },
  { key: "dark",       label: "Dark",             emoji: "🌑" },
  { key: "light",      label: "Light",            emoji: "☀️" },
  { key: "navigation", label: "Navigation Night", emoji: "🚗" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MINE SITES
───────────────────────────────────────────────────────────────────────────── */

const MINE_SITES = [
  { id: "moonidih", label: "Moonidih Underground Mine", longitude: 86.3460, latitude: 23.7560, zoom: 14 },
  { id: "baliari",  label: "Baliari Coal Mine",          longitude: 86.3421, latitude: 23.7600, zoom: 13 },
  { id: "jharia",   label: "Jharia Coalfield",           longitude: 86.4200, latitude: 23.7500, zoom: 12 },
] as const;

type MineSiteId = (typeof MINE_SITES)[number]["id"];

/* ─────────────────────────────────────────────────────────────────────────────
   KML LAYERS
───────────────────────────────────────────────────────────────────────────── */

import type { KmlLayerConfig } from "./KmlLayer";

const KML_LAYERS: (KmlLayerConfig & { label: string; emoji: string })[] = [
  {
    id:          "mine-boundary",
    label:       "Mine Boundary",
    emoji:       "⬜",
    kmlPath:     "/kml/Mine boundary.kml",
    strokeColor: "#e2e8f0",
    fillColor:   "#e2e8f0",
    fillOpacity:  0.06,
    strokeWidth:  2.5,
  },
  {
    id:          "panel-boundaries",
    label:       "Underground Panels",
    emoji:       "🟦",
    kmlPath:     "/kml/Underground Panel Boundaries.kml",
    strokeColor: "#3b82f6",
    strokeWidth:  1.5,
    fillOpacity:  0,
  },
  {
    id:          "high-risk-zone",
    label:       "High Risk Zone",
    emoji:       "🔴",
    kmlPath:     "/kml/High Risk Zone.kml",
    strokeColor: "#ef4444",
    fillColor:   "#ef4444",
    fillOpacity:  0.25,
    strokeWidth:  2,
  },
  {
    id:          "sensor-deployment",
    label:       "Sensor Deploy Area",
    emoji:       "🟡",
    kmlPath:     "/kml/HIGH SENSOR NODE DEPLOYMENT AREA.kml",
    strokeColor: "#eab308",
    fillColor:   "#eab308",
    fillOpacity:  0.15,
    strokeWidth:  1.5,
  },
  {
    id:          "infrastructure",
    label:       "Infrastructure",
    emoji:       "🟠",
    kmlPath:     "/kml/Nearby infrastructure.kml",
    strokeColor: "#f97316",
    fillColor:   "#f97316",
    fillOpacity:  0.2,
    strokeWidth:  1.5,
  },
  {
    id:          "principle-node",
    label:       "Principle Nodes",
    emoji:       "🔵",
    kmlPath:     "/kml/PINCIPLE NODE.kml",
    strokeColor: "#1d4ed8",
    fillColor:   "#1d4ed8",
    fillOpacity:  0.2,
    pointRadius:  10,
    strokeWidth:  2,
  },
  {
    id:          "sensor-node",
    label:       "Sensor Nodes",
    emoji:       "🟢",
    kmlPath:     "/kml/SENSOR NODE.kml",
    strokeColor: "#22c55e",
    pointRadius:  5,
    customLoader: loadSensorNodeKML,
  },
];

type KmlLayerId = string;

/* ─────────────────────────────────────────────────────────────────────────────
   SEARCH SUGGESTIONS
   Simple coordinate + named location suggestions from KML layer names
───────────────────────────────────────────────────────────────────────────── */

const SEARCH_SUGGESTIONS = [
  ...MINE_SITES.map((m) => ({ label: m.label, type: "mine" as const, site: m })),
  { label: "High Risk Zone",          type: "layer" as const, layer: "high-risk-zone"     },
  { label: "Principle Nodes (PN1–22)",type: "layer" as const, layer: "principle-node"     },
  { label: "Sensor Nodes (296)",       type: "layer" as const, layer: "sensor-node"        },
  { label: "Underground Panels",       type: "layer" as const, layer: "panel-boundaries"   },
  { label: "Nearby Infrastructure",    type: "layer" as const, layer: "infrastructure"     },
];

/* ─────────────────────────────────────────────────────────────────────────────
   INITIAL VIEW
───────────────────────────────────────────────────────────────────────────── */

const INITIAL_VIEW = {
  longitude: 86.3460,
  latitude:  23.7560,
  zoom:      14,
  pitch:     35,
  bearing:   -10,
};

/* ─────────────────────────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────────────────────────── */

interface MapCoreProps {
  defaultStyleKey?: StyleKey;
  onPanelClick?:    (panelId: string) => void;
  /** Fired whenever the user clicks any node on the map (PN or SN). */
  onNodeClick?:     (nodeId: string) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOLBAR DROPDOWN — reusable pill button + dropdown
───────────────────────────────────────────────────────────────────────────── */

function ToolbarDropdown({
  icon: Icon,
  label,
  open,
  onToggle,
  children,
  hideLabel = false,
}: {
  icon: React.ElementType;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** On mobile: show only icon, expand label on sm+ */
  hideLabel?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 h-8 px-2 sm:px-3 rounded-lg border text-[11px] font-semibold transition-all ${
          open
            ? "bg-white border-blue-400 text-blue-600 shadow-sm"
            : "bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 shadow-sm"
        }`}
      >
        <Icon className="size-3.5 shrink-0" />
        {hideLabel ? (
          <span className="hidden sm:inline whitespace-nowrap">{label}</span>
        ) : (
          <span className="whitespace-nowrap">{label}</span>
        )}
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""} ${hideLabel ? "hidden sm:block" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute top-full mt-1.5 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[200px] overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEGEND PANEL — collapsible, compact on mobile
───────────────────────────────────────────────────────────────────────────── */

function LegendPanel({ kmlVisible }: { kmlVisible: Record<KmlLayerId, boolean> }) {
  const [expanded, setExpanded] = useState(false);
  const visible = KML_LAYERS.filter((l) => kmlVisible[l.id]);

  return (
    <div className="absolute bottom-10 left-3 z-10">
      {/* Collapsed pill — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-white transition-colors"
      >
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: visible[0]?.strokeColor ?? "#888" }}
        />
        <span>Legend</span>
        <span className="text-[9px] font-normal text-gray-400">
          {visible.length}/{KML_LAYERS.length}
        </span>
        {expanded
          ? <ChevronDown className="size-3 text-gray-400" />
          : <ChevronUp   className="size-3 text-gray-400" />}
      </button>

      {/* Expanded list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 6,  scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-full mb-1.5 left-0 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-lg px-3 py-2 pointer-events-none min-w-[160px]"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Active Layers</p>
            {visible.length > 0
              ? visible.map(({ id, label, emoji, strokeColor }) => (
                  <div key={id} className="flex items-center gap-2 mb-1 last:mb-0">
                    <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: strokeColor ?? "#888" }} />
                    <span className="text-[10px] font-medium text-gray-700">{emoji} {label}</span>
                  </div>
                ))
              : <p className="text-[10px] text-gray-400 italic">All layers hidden</p>
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export function MapCore({
  defaultStyleKey = "satellite",
  onPanelClick,
  onNodeClick,
}: MapCoreProps) {
  const mapRef = useRef<MapRef>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [currentStyle,   setCurrentStyle]   = useState<StyleKey>(defaultStyleKey);
  const [currentMine,    setCurrentMine]     = useState<MineSiteId>("moonidih");
  const [activeNodeId,   setActiveNodeId]    = useState<string | null>(null);
  const [isFullscreen,   setIsFullscreen]    = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dropdowns
  const [openDropdown, setOpenDropdown] = useState<"layers" | "basemap" | "mine" | null>(null);
  const toggleDropdown = (d: typeof openDropdown) =>
    setOpenDropdown((p) => (p === d ? null : d));

  // Search
  const [searchQuery,     setSearchQuery]     = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = searchQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_SUGGESTIONS;

  // KML visibility
  const [kmlVisible, setKmlVisible] = useState<Record<KmlLayerId, boolean>>(
    () => Object.fromEntries(KML_LAYERS.map((l) => [l.id, true])) as Record<KmlLayerId, boolean>
  );
  const toggleKml = (id: KmlLayerId) =>
    setKmlVisible((p) => ({ ...p, [id]: !p[id] }));
  const allOn  = () => setKmlVisible(Object.fromEntries(KML_LAYERS.map((l) => [l.id, true]))  as Record<KmlLayerId, boolean>);
  const allOff = () => setKmlVisible(Object.fromEntries(KML_LAYERS.map((l) => [l.id, false])) as Record<KmlLayerId, boolean>);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-toolbar]")) {
        setOpenDropdown(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fly to mine site
  const flyToMine = useCallback((site: (typeof MINE_SITES)[number]) => {
    setCurrentMine(site.id);
    mapRef.current?.flyTo({
      center: [site.longitude, site.latitude],
      zoom:   site.zoom,
      pitch:  35,
      duration: 1400,
    });
    setOpenDropdown(null);
  }, []);

  // Search select
  const handleSuggestionSelect = (s: (typeof SEARCH_SUGGESTIONS)[number]) => {
    setSearchQuery(s.label);
    setShowSuggestions(false);
    if (s.type === "mine") {
      flyToMine(s.site);
    } else {
      // Highlight / ensure layer is visible
      setKmlVisible((p) => ({ ...p, [s.layer as KmlLayerId]: true }));
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleMapClick = (e: MapMouseEvent) => {
    // Query rendered features at click point
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ["kml-principle-node-point", "kml-sensor-node-point"],
    });

    if (!features?.length) {
      setActiveNodeId(null);
      return;
    }

    const f    = features[0];
    const name = (f.properties?.name as string | undefined)?.trim() ?? "";
    const src  = f.source as string;

    // Principle nodes: name is "PN1" / "PN2" / "PN3" / "PN4"
    if (src === "kml-principle-node" && /^PN\d+$/.test(name)) {
      setActiveNodeId(name);
      if (onPanelClick) onPanelClick(name);
      if (onNodeClick)  onNodeClick(name);
      return;
    }

    // Sensor nodes — use injected nodeId property (SN-001…SN-296)
    if (src === "kml-sensor-node") {
      const nodeId = f.properties?.nodeId as string | undefined;
      if (nodeId) {
        setActiveNodeId(nodeId);
        if (onNodeClick) onNodeClick(nodeId);
        return;
      }
      // Safety fallback: coordinate lookup
      const coords = (f.geometry as any).coordinates as [number, number] | undefined;
      if (coords) {
        const coordId = `coord:${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
        setActiveNodeId(coordId);
        if (onNodeClick) onNodeClick(coordId);
      }
      return;
    }

    // Fallback: any named, non-junk feature
    if (name && name !== "SENSOR NODE" && !name.toLowerCase().startsWith("untitled")) {
      setActiveNodeId(name);
      if (onNodeClick) onNodeClick(name);
    }
  };

  const currentMineSite = MINE_SITES.find((m) => m.id === currentMine)!;
  const currentStyleOption = STYLE_OPTIONS.find((s) => s.key === currentStyle)!;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-b-md flex flex-col">

      {/* ════════════════════════════════════════════════════════════════════
          TOP TOOLBAR
      ════════════════════════════════════════════════════════════════════ */}
      <div
        data-toolbar
        className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
      >

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-0" ref={searchRef}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search location or node…"
            className="w-full h-8 pl-8 pr-8 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="size-3.5" />
            </button>
          )}

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-2 py-1 border-b border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Suggestions
                  </p>
                </div>
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleSuggestionSelect(s)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors"
                  >
                    <span className={`size-1.5 rounded-full shrink-0 ${
                      s.type === "mine" ? "bg-blue-500" : "bg-gray-400"
                    }`} />
                    <span className="text-gray-700 font-medium">{s.label}</span>
                    <span className="ml-auto text-[10px] text-gray-400 uppercase tracking-wider">
                      {s.type}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      {/* ── Mine selector ────────────────────────────────────────────────── */}
        <ToolbarDropdown
          icon={Building2}
          label={currentMineSite.label}
          open={openDropdown === "mine"}
          onToggle={() => toggleDropdown("mine")}
          hideLabel
        >
          <div className="py-1">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Mine Sites
            </p>
            {MINE_SITES.map((site) => (
              <button
                key={site.id}
                onMouseDown={() => flyToMine(site)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-[11px] font-medium transition-colors ${
                  currentMine === site.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Building2 className="size-3.5 shrink-0 text-gray-400" />
                <span className="flex-1">{site.label}</span>
                {currentMine === site.id && <span className="text-blue-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </ToolbarDropdown>

        {/* ── Layers dropdown ──────────────────────────────────────────────── */}
        <ToolbarDropdown
          icon={Layers}
          label="Layers"
          open={openDropdown === "layers"}
          onToggle={() => toggleDropdown("layers")}
          hideLabel
        >
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Map Layers
              </p>
              <div className="flex gap-2">
                <button onClick={allOn}  className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold">All on</button>
                <span className="text-gray-300">|</span>
                <button onClick={allOff} className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold">All off</button>
              </div>
            </div>
          </div>
          <div className="px-3 pb-3 space-y-1">
            {KML_LAYERS.map(({ id, label, emoji, strokeColor }) => (
              <div key={id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 size-2.5 rounded-full border border-gray-200"
                    style={{ backgroundColor: strokeColor ?? "#888" }}
                  />
                  <span className="text-[11px] font-medium text-gray-700 truncate">
                    {emoji} {label}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={kmlVisible[id]}
                  onClick={() => toggleKml(id)}
                  className={`relative shrink-0 w-8 h-4 rounded-full transition-colors focus:outline-none ${
                    kmlVisible[id] ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className="absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-all duration-150"
                    style={{ left: kmlVisible[id] ? "18px" : "2px" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </ToolbarDropdown>

        {/* ── Basemap dropdown ─────────────────────────────────────────────── */}
        <ToolbarDropdown
          icon={Satellite}
          label={currentStyleOption.label}
          open={openDropdown === "basemap"}
          onToggle={() => toggleDropdown("basemap")}
          hideLabel
        >
          <div className="py-1.5 px-1">
            {STYLE_OPTIONS.map(({ key, label, emoji }) => (
              <button
                key={key}
                onMouseDown={() => { setCurrentStyle(key); setOpenDropdown(null); }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-medium transition-colors text-left ${
                  currentStyle === key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{emoji}</span>
                <span className="flex-1">{label}</span>
                {currentStyle === key && <span className="text-blue-400">✓</span>}
              </button>
            ))}
          </div>
        </ToolbarDropdown>

        {/* ── Fullscreen ───────────────────────────────────────────────────── */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="flex items-center justify-center size-8 rounded-lg border border-gray-200 bg-white/90 hover:bg-white hover:border-gray-300 text-gray-600 shadow-sm transition-all shrink-0"
        >
          {isFullscreen
            ? <Minimize2 className="size-3.5" />
            : <Maximize2 className="size-3.5" />}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAP CANVAS  (top-offset = toolbar height ~44px)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 top-[44px]">
        <Map
          ref={mapRef}
          mapboxAccessToken={TOKEN}
          initialViewState={INITIAL_VIEW}
          mapStyle={STYLES[currentStyle]}
          onClick={handleMapClick}
          interactiveLayerIds={[
            "kml-principle-node-point",
            "kml-sensor-node-point",
          ]}
          cursor="pointer"
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-right" showCompass showZoom />

          {KML_LAYERS.map((layer) => (
            <KmlLayer
              key={layer.id}
              {...layer}
              visible={kmlVisible[layer.id]}
              featureFilter={layer.id === "principle-node" ? principleNodeFilter : undefined}
            />
          ))}
        </Map>
      </div>

      {/* ── Live legend (bottom-left, above nav controls) ─────────────────── */}
      <LegendPanel kmlVisible={kmlVisible} />

      {/* ── Node detail panel ─────────────────────────────────────────────── */}
      {activeNodeId && (
        <NodeDetailPanel nodeId={activeNodeId} onClose={() => setActiveNodeId(null)} />
      )}
    </div>
  );
}

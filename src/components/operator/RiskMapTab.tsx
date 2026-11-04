import { MapCore } from "@/components/gis/MapCore";

export function RiskMapTab() {
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 rounded-xl shadow-sm overflow-hidden relative">
        <MapCore />
      </div>
    </div>
  );
}

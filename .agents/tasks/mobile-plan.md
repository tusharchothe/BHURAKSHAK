# Mobile Responsive Implementation Plan — BHURAKSHAK

> This plan is decomposed into 4 FEATs (see `.agents/tasks/mobile-responsive/`).
> The workflow will execute them sequentially via the FEAT coder loop.

## Summary of design decisions

**Stack**: React 19 + TanStack Router + Tailwind CSS v4 + lucide-react + framer-motion. No new dependencies are needed.

**Breakpoints used** (Tailwind v4 defaults): `sm` = 640 px, `md` = 768 px, `lg` = 1024 px.

**Bottom nav strategy**: New `BottomNav.tsx` component, `fixed bottom-0`, `md:hidden`. Each role gets a curated set of ≤5 nav items. The component receives the same `items`, `activeTab`, `onTabChange`, `role`, and `accent` props that `Sidebar` already uses, keeping the integration trivial.

**Sidebar**: Already scoped to `lg:flex` (hidden below 1024 px). No change needed — it is not broken, just needs a note in DashboardShell that padding must account for BottomNav on mobile.

**Header**: Already compact (h-14, 56 px). Minor tweak: hide the text subtitle of the logo on narrow phones so the logo+name doesn't wrap.

**FloatingAIChat**: Already has `bottom: calc(4rem + 0.5rem)` hard-coded in both the button and the ChatCard inline styles — these already clear the bottom nav. No changes needed.

**Content area**: Add `pb-16 md:pb-0` to the scrollable `div` inside DashboardShell so content is never hidden behind the bottom bar.

**Page-header bar**: Add `px-3 sm:px-6` responsive padding and wrap content.

**DataTable**: Wrap the `overflow-hidden rounded-md border bg-card` container div in an `overflow-x-auto` wrapper.

**KpiCard**: Already supports `compact` prop; no change needed to the component itself.

**Grid layouts**: Replace fixed `grid-cols-4`, `lg:grid-cols-3`, `grid-cols-3` patterns with responsive equivalents throughout tab files.

**Map/GIS**: `MapCore` is already `w-full h-full` and the toolbar already has responsive classes. Heights need to switch from fixed pixel to viewport-relative on mobile.

---

## Implementation Plan

- [ ] 1. **Create `BottomNav.tsx`** — new bottom navigation component.
      Mobile-only (`md:hidden`), fixed bottom, role-aware (≤5 items per role), safe-area padding, integrates with existing `onTabChange` prop system.
      Files: `src/components/layout/BottomNav.tsx`
      Verify: `npm run build` — no TypeScript errors.

- [ ] 2. **Update `DashboardShell.tsx`** — wire in BottomNav, add bottom padding.
      Import `BottomNav`; render it below `<FloatingAIChat />`. Add `pb-16 md:pb-0` on the inner scroll div. Add `px-3 sm:px-6 py-3 sm:py-4` on the page-header bar.
      Files: `src/components/layout/DashboardShell.tsx`
      Verify: `npm run build` — no errors.

- [ ] 3. **Update `Header.tsx`** — mobile polish.
      Hide the logo subtitle text on very narrow screens: `hidden xs:block` → `hidden sm:block`. Ensure no overflow.
      Files: `src/components/layout/Header.tsx`
      Verify: `npm run build` — no errors.

- [ ] 4. **Update `DataTable.tsx`** — horizontal scroll wrapper.
      Wrap existing `<div className="overflow-hidden ...">` with `<div className="overflow-x-auto w-full">`.
      Files: `src/components/common/DataTable.tsx`
      Verify: `npm run build` — no errors.

- [ ] 5. **Operator tab — grid & table fixes (FEAT-002 scope)**
      See FEAT-002 for detailed per-file changes.
      Files: all operator tab files + ManagementTab.tsx

- [ ] 6. **Planner tab — grid fixes (FEAT-003 scope)**
      See FEAT-003.

- [ ] 7. **Regulator tab — grid & table fixes (FEAT-003 scope)**
      See FEAT-003.

- [ ] 8. **GIS/map height fix on mobile (FEAT-004 scope)**
      See FEAT-004.

---

## New File: `src/components/layout/BottomNav.tsx` — exact content

```tsx
/**
 * BottomNav.tsx
 * Mobile-only bottom navigation bar (md:hidden).
 * Shows ≤5 role-specific tabs with icon + label.
 * Fixed to bottom, respects iOS safe-area.
 */

import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
}

/** Max 5 items shown in the bottom bar per role. */
const BOTTOM_NAV_ITEMS: Record<UserRole, string[]> = {
  operator:  ["overview", "live", "alerts", "sensors", "ai"],
  planner:   ["overview", "map", "history", "trends", "intelligence"],
  regulator: ["overview", "portfolio", "review", "health", "reports"],
};

interface BottomNavProps {
  role: UserRole;
  items: NavItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  accent?: string;
}

export function BottomNav({
  role,
  items,
  activeTab,
  onTabChange,
  accent = "#3b82f6",
}: BottomNavProps) {
  const allowedIds = BOTTOM_NAV_ITEMS[role] ?? [];
  const visible = items.filter((item) => allowedIds.includes(item.id));

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a2035] border-t border-white/10 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {visible.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange?.(item.id)}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-colors"
            style={
              isActive
                ? { color: accent }
                : { color: "rgba(255,255,255,0.5)" }
            }
          >
            <item.icon
              className="size-5 shrink-0"
              aria-hidden
            />
            <span
              className="text-[9px] font-semibold uppercase tracking-wider leading-tight truncate max-w-full px-1"
              style={isActive ? { color: accent } : undefined}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className="absolute bottom-0 h-0.5 w-8 rounded-t-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
```

---

## Per-file change reference

### `DashboardShell.tsx`
1. Import `BottomNav` from `./BottomNav`.
2. `<div className="flex-1 overflow-auto p-6">` → `<div className="flex-1 overflow-auto p-3 sm:p-6 pb-20 md:pb-6">`
3. Page header bar: add `px-3 sm:px-6 py-3 sm:py-4` (remove hardcoded `px-6 py-4`).
4. After `<FloatingAIChat />` add:
   ```tsx
   <BottomNav
     role={role}
     items={nav}
     activeTab={activeTab}
     onTabChange={onTabChange}
     accent={accent}
   />
   ```

### `Header.tsx`
- Logo subtitle `<span className="block text-[10px] ...">Mine Safety Sentinel</span>` → add `hidden sm:block` to hide on tiny screens.

### `DataTable.tsx`
- Wrap the outer `<div className="overflow-hidden rounded-md border bg-card ...">` with `<div className="overflow-x-auto w-full">`.

### Operator tabs — grid changes

**OverviewTab.tsx** — already has `grid-cols-2 sm:grid-cols-4`. No change needed for KPI grid. The node table has its own `overflow-x-auto` wrapper — already present (`<div className="overflow-x-auto">`).

**LiveMonitoringTab.tsx**
- `KpiStrip`: already uses `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` — correct.
- `MapSection` layout: already uses `flex-col lg:flex-row` — correct.
- Map height: `h-[360px] lg:h-auto` — already responsive.

**SensorNetworkTab.tsx**
- `NetworkOverview`: already uses `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` — correct.
- Topology section: `flex flex-col lg:flex-row` already in place.

**AlertsTab.tsx**
- Evidence matrix: `grid grid-cols-2 gap-4` → `grid grid-cols-1 sm:grid-cols-2 gap-4`

**AlertCenterTab.tsx**
- Root div: `flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]` — already responsive. No change.
- Inner `grid md:grid-cols-2 gap-6` — correct, already responsive.

**AnalyticsTab.tsx**
- Top flex row: `flex justify-between items-start` → `flex flex-col sm:flex-row gap-3 items-start`
- Pipeline/chart section: `grid lg:grid-cols-2 gap-6 mt-2` — already responsive.

**ManagementTab.tsx** (biggest table)
- Wrap `<table>` with `<div className="overflow-x-auto">`.

**ReportsTab.tsx** (operator)
- `grid md:grid-cols-2 lg:grid-cols-3 gap-6` — already responsive. No change.

**RiskMapTab.tsx**
- `h-[calc(100vh-8rem)]` on map container → add `min-h-[300px]` as safeguard on very small screens. No other changes needed.

**BhurakshakAITab.tsx**
- Already uses `h-[calc(100vh-64px)]` which on mobile will be fine. The input area uses `sm:grid-cols-2` for suggested queries — already responsive.
- Context bar: `flex items-center gap-2 px-5 py-2 … flex-wrap shrink-0` — already wraps. No change.

### Planner tabs — grid changes

**PlanningOverviewTab.tsx**
- KPI grid: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3` — already responsive.
- Panel comparison table: already has `overflow-x-auto` wrapper. No change.
- Map+scenarios: `grid gap-5 lg:grid-cols-3` — correct.

**DeformationHistoryTab.tsx**
- Header flex: `flex items-center justify-between` → `flex flex-col sm:flex-row gap-3 items-start sm:items-center`
- Stats grid at bottom: `grid-cols-3 gap-4` → `grid-cols-1 sm:grid-cols-3 gap-4`

**RiskTrendsTab.tsx**
- Bottom flex: `flex items-center justify-between` → `flex flex-col sm:flex-row gap-3`

**MinePanelMapTab.tsx**
- `flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)]` — already responsive.
- Search overlay: `left-32` is fixed but map is full-width, fine on mobile.
- Detail panel: `w-full md:w-80` — already responsive.

**MonitoringCoverageTab.tsx**
- `grid lg:grid-cols-3 gap-6` — already responsive.
- Map container: `lg:col-span-2 … min-h-[400px]` — fine.

**PanelComparisonTab.tsx**
- `flex flex-col lg:flex-row gap-6 mt-4` — already responsive.
- `VS` divider: `hidden lg:flex` — correctly hidden on mobile.
- Summary row: `flex items-center justify-between` → `flex flex-col sm:flex-row gap-3`

**PlanningIntelligenceTab.tsx**
- Top header: `flex items-center justify-between` → `flex flex-col sm:flex-row gap-3 items-start`
- Grid: `grid lg:grid-cols-3 gap-6 mt-4` — already responsive.
- Scenario content: `ml-14` on mobile creates overflow → add `sm:ml-14 ml-0`

**ReportsTab.tsx** (planner)
- `grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4` — already responsive. No change.

### Regulator tabs — grid changes

**NationalOverviewTab.tsx**
- KPI grid: `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` — already responsive.
- Top header buttons row: `flex gap-2` → `flex flex-wrap gap-2`
- Map container `h-[500px]` → `h-[300px] sm:h-[500px]`
- Hover tooltip uses `style={{ left, top }}` absolute positioning — already fine on touch (hover doesn't appear).
- Legend panel in bottom-right: add `max-h-40 overflow-y-auto` so it doesn't overflow on small screens.

**MinePortfolioTab.tsx**
- Search/filter header: `flex items-center justify-between` → `flex flex-col sm:flex-row gap-3`
- Table: already has `overflow-x-auto`. No change.

**MineDetailTab.tsx**
- `grid lg:grid-cols-3 gap-6` — already responsive.
- Map container `h-[500px]` → `h-[280px] sm:h-[500px]`

**ReviewCenterTab.tsx**
- `flex flex-col lg:flex-row gap-6 mt-2 h-full` — already responsive.
- Evidence grid: `grid grid-cols-2 gap-4` → `grid grid-cols-1 sm:grid-cols-2 gap-4`

**MonitoringHealthTab.tsx**
- KPI grid: `grid sm:grid-cols-2 lg:grid-cols-4 gap-4` — already responsive.
- Bottom grid: `grid lg:grid-cols-2 gap-6 mt-4` — already responsive.

**RegulatorReportsTab.tsx**
- `grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4` — already responsive. No change.

### GIS components

**MapCore.tsx**
- Already fully responsive (w-full h-full, toolbar wraps).
- Toolbar: already has `px-3 py-2` and `hideLabel` prop on dropdowns for mobile.
- No changes needed.

**NodeDetailPanel.tsx** (not read — referenced from MapCore)
- This panel mounts absolutely. Check it doesn't overflow viewport width on mobile.
- Add `max-w-[calc(100vw-1rem)]` to its container if needed.

---

## Files changed summary

| File | Type of change |
|------|----------------|
| `src/components/layout/BottomNav.tsx` | **CREATE** |
| `src/components/layout/DashboardShell.tsx` | Add BottomNav, responsive padding |
| `src/components/layout/Header.tsx` | Hide subtitle on tiny screens |
| `src/components/common/DataTable.tsx` | overflow-x-auto wrapper |
| `src/components/operator/AlertsTab.tsx` | Evidence grid 1→2 col |
| `src/components/operator/AnalyticsTab.tsx` | Header flex-wrap |
| `src/components/operator/ManagementTab.tsx` | Table overflow-x-auto |
| `src/components/planner/DeformationHistoryTab.tsx` | Header + stats grid flex-wrap |
| `src/components/planner/RiskTrendsTab.tsx` | Bottom flex-wrap |
| `src/components/planner/PanelComparisonTab.tsx` | Summary row flex-wrap |
| `src/components/planner/PlanningIntelligenceTab.tsx` | Header flex-wrap, ml fix |
| `src/components/regulator/NationalOverviewTab.tsx` | Map height, header flex-wrap, legend scroll |
| `src/components/regulator/MinePortfolioTab.tsx` | Header flex-wrap |
| `src/components/regulator/MineDetailTab.tsx` | Map height |
| `src/components/regulator/ReviewCenterTab.tsx` | Evidence grid 1→2 col |

Most tab files are **already responsive** — the existing code already uses `flex-col lg:flex-row`, `overflow-x-auto`, and `sm:grid-cols-N` patterns. Changes are targeted to the remaining gaps only.

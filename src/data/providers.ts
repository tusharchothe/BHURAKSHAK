/**
 * Data access boundary.
 *
 * Today every provider returns synthetic demo data. Later these become
 * real API/server-function calls — signatures stay the same so the UI
 * layer does not change.
 */
import {
  demoAlerts,
  demoCoverage,
  demoDeformationTrend,
  demoMines,
  demoPanels,
  demoSensorHealth,
  demoSensors,
  demoSystemStatus,
} from "./mock";
import type {
  Alert,
  DeformationTrend,
  Mine,
  MonitoringCoverage,
  Panel,
  Sensor,
  SensorHealth,
  SystemStatusInfo,
} from "@/types";

const resolve = <T>(value: T): Promise<T> => Promise.resolve(value);

export const dataSource = {
  isDemo: true as const,
  getMines: (): Promise<Mine[]> => resolve(demoMines),
  getPanels: (mineId?: string): Promise<Panel[]> =>
    resolve(mineId ? demoPanels.filter((p) => p.mineId === mineId) : demoPanels),
  getSensors: (mineId?: string): Promise<Sensor[]> =>
    resolve(mineId ? demoSensors.filter((s) => s.mineId === mineId) : demoSensors),
  getSensorHealth: (): Promise<SensorHealth[]> => resolve(demoSensorHealth),
  getAlerts: (): Promise<Alert[]> => resolve(demoAlerts),
  getDeformationTrend: (): Promise<DeformationTrend> => resolve(demoDeformationTrend),
  getCoverage: (): Promise<MonitoringCoverage> => resolve(demoCoverage),
  getSystemStatus: (): Promise<SystemStatusInfo> => resolve(demoSystemStatus),
};

/** TanStack Query keys, ready for the dashboard stage. */
export const queryKeys = {
  mines: ["mines"] as const,
  panels: (mineId?: string) => ["panels", mineId ?? "all"] as const,
  sensors: (mineId?: string) => ["sensors", mineId ?? "all"] as const,
  sensorHealth: ["sensor-health"] as const,
  alerts: ["alerts"] as const,
  deformation: (panelId: string) => ["deformation", panelId] as const,
  coverage: ["coverage"] as const,
  systemStatus: ["system-status"] as const,
};

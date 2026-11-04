import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database types (matches schema.sql exactly) ──────────────────────────────

export interface DbMine {
  id: string;
  name: string;
  location: string | null;
  operator: string | null;
  created_at: string;
}

export interface DbPanel {
  id: string;
  mine_id: string;
  name: string | null;
  status: string;
  depth_m: number | null;
  seam: string | null;
  method: string | null;
  coverage_pct: number | null;
  risk_level: string;
  created_at: string;
}

export interface DbSensor {
  id: string;
  panel_id: string;
  type: string;
  unit: string;
  status: string;
  battery_pct: number | null;
  signal_pct: number | null;
  fault: boolean;
  installed_at: string;
  updated_at: string;
}

export interface DbSensorReading {
  id: number;
  sensor_id: string;
  panel_id: string;
  reading: number;
  recorded_at: string;
}

export interface DbAnomaly {
  id: string;
  sensor_id: string;
  panel_id: string;
  type: string;
  severity: string;
  status: string;
  detected_at: string;
  resolved_at: string | null;
  notes: string | null;
}

export interface DbAlert {
  id: string;
  mine_id: string | null;
  severity: string;
  title: string;
  location: string | null;
  status: string;
  sensor_count: number | null;
  persistence: string | null;
  tilt_trend: string | null;
  displacement: string | null;
  health_note: string | null;
  created_at: string;
  updated_at: string;
}

// View types
export interface DbSensorLive {
  id: string;
  panel: string;
  type: string;
  unit: string;
  status: string;
  battery_pct: number | null;
  signal_pct: number | null;
  fault: boolean;
  last_update: string;
  latest_reading: number | null;
  recorded_at: string | null;
}

export interface DbSensorHealthSummary {
  mine_id: string;
  total_sensors: number;
  online: number;
  offline: number;
  low_battery: number;
  fault: number;
  health_pct: number;
}

-- ============================================================
--  BhuraKshak – Live Monitoring Schema
--  Paste into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. MINES
-- ============================================================
create table if not exists public.mines (
  id         text        primary key,          -- e.g. "moonidih"
  name       text        not null,             -- "Moonidih Mine"
  location   text,
  operator   text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. PANELS
-- ============================================================
create table if not exists public.panels (
  id           text        primary key,         -- "P03", "P04", "P05"
  mine_id      text        not null references public.mines(id) on delete cascade,
  name         text,
  status       text        not null default 'Active Extraction',
  depth_m      numeric,
  seam         text,
  method       text,
  coverage_pct numeric,
  risk_level   text        not null default 'NORMAL',
  created_at   timestamptz not null default now()
);

create index if not exists panels_mine_id_idx on public.panels(mine_id);

-- ============================================================
-- 3. SENSORS
-- ============================================================
create table if not exists public.sensors (
  id           text        primary key,         -- "SEN-001" … "SEN-026"
  panel_id     text        not null references public.panels(id) on delete cascade,
  type         text        not null,            -- "Tilt" | "Vibration" | "Displacement"
  unit         text        not null,            -- "°" | "g" | "mm"
  status       text        not null default 'Normal',  -- "Normal" | "Watch" | "Warning"
  battery_pct  numeric,
  signal_pct   numeric,
  fault        boolean     not null default false,
  installed_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists sensors_panel_id_idx on public.sensors(panel_id);
create index if not exists sensors_status_idx   on public.sensors(status);

-- ============================================================
-- 4. SENSOR READINGS  (append-only time-series)
-- ============================================================
create table if not exists public.sensor_readings (
  id          bigserial   primary key,
  sensor_id   text        not null references public.sensors(id) on delete cascade,
  panel_id    text        not null,             -- denormalised for fast panel queries
  reading     numeric     not null,
  recorded_at timestamptz not null default now()
);

create index if not exists readings_sensor_id_idx   on public.sensor_readings(sensor_id);
create index if not exists readings_recorded_at_idx on public.sensor_readings(recorded_at desc);
create index if not exists readings_panel_time_idx  on public.sensor_readings(panel_id, recorded_at desc);

-- ============================================================
-- 5. ANOMALIES
-- ============================================================
create table if not exists public.anomalies (
  id          text        primary key,          -- "ANM-001"
  sensor_id   text        not null references public.sensors(id) on delete cascade,
  panel_id    text        not null,
  type        text        not null,             -- "Sudden Displacement" | "Vibration Spike" | "Tilt Change"
  severity    text        not null default 'Low',      -- "High" | "Medium" | "Low"
  status      text        not null default 'Unreviewed', -- "Unreviewed" | "Under Investigation" | "Resolved"
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes       text
);

create index if not exists anomalies_sensor_id_idx on public.anomalies(sensor_id);
create index if not exists anomalies_status_idx    on public.anomalies(status);
create index if not exists anomalies_detected_idx  on public.anomalies(detected_at desc);

-- ============================================================
-- 6. ALERTS
-- ============================================================
create table if not exists public.alerts (
  id           text        primary key,         -- "ALT-2026-042"
  mine_id      text        references public.mines(id) on delete set null,
  severity     text        not null default 'watch',  -- "warning" | "watch" | "info"
  title        text        not null,
  location     text,
  status       text        not null default 'open',   -- "open" | "acknowledged" | "resolved"
  sensor_count int,
  persistence  text,
  tilt_trend   text,
  displacement text,
  health_note  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists alerts_mine_id_idx    on public.alerts(mine_id);
create index if not exists alerts_created_at_idx on public.alerts(created_at desc);

-- ============================================================
-- VIEWS
-- ============================================================

-- Latest reading per sensor (used to power the live table)
create or replace view public.sensor_latest_reading as
select distinct on (sensor_id)
  sensor_id,
  panel_id,
  reading,
  recorded_at
from public.sensor_readings
order by sensor_id, recorded_at desc;

-- Sensor list joined with latest reading — the live monitoring table
create or replace view public.sensor_live as
select
  s.id,
  s.panel_id   as panel,
  s.type,
  s.unit,
  s.status,
  s.battery_pct,
  s.signal_pct,
  s.fault,
  s.updated_at as last_update,
  lr.reading   as latest_reading,
  lr.recorded_at
from public.sensors s
left join public.sensor_latest_reading lr on lr.sensor_id = s.id;

-- Sensor health aggregate per mine
create or replace view public.sensor_health_summary as
select
  p.mine_id,
  count(*)::int                                                  as total_sensors,
  count(*) filter (where s.status != 'Warning' and not s.fault)::int as online,
  count(*) filter (where s.status = 'Warning')::int              as offline,
  count(*) filter (where s.battery_pct < 20)::int                as low_battery,
  count(*) filter (where s.fault)::int                           as fault,
  round(
    100.0 * count(*) filter (where s.status = 'Normal') / nullif(count(*), 0),
    1
  )::numeric                                                     as health_pct
from public.sensors s
join public.panels p on p.id = s.panel_id
group by p.mine_id;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
alter table public.mines           enable row level security;
alter table public.panels          enable row level security;
alter table public.sensors         enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.anomalies       enable row level security;
alter table public.alerts          enable row level security;

-- Anon key: read-only
create policy "anon_read_mines"     on public.mines           for select using (true);
create policy "anon_read_panels"    on public.panels          for select using (true);
create policy "anon_read_sensors"   on public.sensors         for select using (true);
create policy "anon_read_readings"  on public.sensor_readings for select using (true);
create policy "anon_read_anomalies" on public.anomalies       for select using (true);
create policy "anon_read_alerts"    on public.alerts          for select using (true);

-- Authenticated users: full write
create policy "auth_write_mines"     on public.mines           for all using (auth.role() = 'authenticated');
create policy "auth_write_panels"    on public.panels          for all using (auth.role() = 'authenticated');
create policy "auth_write_sensors"   on public.sensors         for all using (auth.role() = 'authenticated');
create policy "auth_write_readings"  on public.sensor_readings for all using (auth.role() = 'authenticated');
create policy "auth_write_anomalies" on public.anomalies       for all using (auth.role() = 'authenticated');
create policy "auth_write_alerts"    on public.alerts          for all using (auth.role() = 'authenticated');

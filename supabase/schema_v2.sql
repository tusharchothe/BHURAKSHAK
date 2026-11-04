-- ============================================================
--  BhuraKshak – Schema v2
--  Run AFTER schema.sql in Supabase SQL Editor
--  Adds: lat/lon to sensors, principle_nodes table,
--        kml_sensor_nodes table, risk_zones table,
--        Realtime enabled on key tables
-- ============================================================

-- ── 1. Add geospatial columns to existing sensors table ──────
alter table public.sensors
  add column if not exists lat        numeric,
  add column if not exists lon        numeric,
  add column if not exists alt_m      numeric,
  add column if not exists kml_id     text,          -- e.g. "SN-001"
  add column if not exists principle_node_id text;   -- e.g. "PN1"

-- ── 2. PRINCIPLE NODES table ─────────────────────────────────
-- The 4 master nodes from PINCIPLE NODE.kml
create table if not exists public.principle_nodes (
  id           text        primary key,   -- "PN1" | "PN2" | "PN3" | "PN4"
  mine_id      text        not null references public.mines(id) on delete cascade,
  label        text        not null,      -- display name
  lat          numeric     not null,
  lon          numeric     not null,
  alt_m        numeric,
  status       text        not null default 'Online',   -- "Online" | "Degraded" | "Offline"
  battery_pct  numeric     not null default 100,
  signal_dbm   numeric     not null default -65,
  connected_sensors int    not null default 0,
  network_role text        not null default 'Junction / Principal',
  last_seen    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists pn_mine_id_idx on public.principle_nodes(mine_id);

-- ── 3. KML SENSOR NODES table ─────────────────────────────────
-- All 296 sensor nodes from SENSOR NODE.kml
create table if not exists public.kml_sensor_nodes (
  id                  text        primary key,   -- "SN-001" … "SN-296"
  mine_id             text        not null references public.mines(id) on delete cascade,
  principle_node_id   text        not null references public.principle_nodes(id) on delete cascade,
  type                text        not null,      -- "Tilt" | "Vibration" | "Displacement"
  unit                text        not null,      -- "°" | "g" | "mm"
  status              text        not null default 'Normal',  -- "Normal" | "Watch" | "Warning"
  battery_pct         numeric     not null default 90,
  signal_pct          numeric     not null default 90,
  fault               boolean     not null default false,
  lat                 numeric     not null,
  lon                 numeric     not null,
  alt_m               numeric,
  latest_reading      numeric,
  last_reading_at     timestamptz,
  updated_at          timestamptz not null default now()
);

create index if not exists ksn_mine_id_idx  on public.kml_sensor_nodes(mine_id);
create index if not exists ksn_pn_id_idx    on public.kml_sensor_nodes(principle_node_id);
create index if not exists ksn_status_idx   on public.kml_sensor_nodes(status);

-- ── 4. KML SENSOR READINGS (time-series for kml_sensor_nodes) ─
create table if not exists public.kml_sensor_readings (
  id          bigserial   primary key,
  node_id     text        not null references public.kml_sensor_nodes(id) on delete cascade,
  pn_id       text        not null,           -- denormalized for fast PN queries
  reading     numeric     not null,
  recorded_at timestamptz not null default now()
);

create index if not exists ksr_node_id_idx    on public.kml_sensor_readings(node_id);
create index if not exists ksr_recorded_idx   on public.kml_sensor_readings(recorded_at desc);
create index if not exists ksr_pn_time_idx    on public.kml_sensor_readings(pn_id, recorded_at desc);

-- ── 5. RISK ZONES table (from High Risk Zone.kml) ─────────────
create table if not exists public.risk_zones (
  id           text        primary key,   -- "RZ-H1", "RZ-H1F", "RZ-H2", "RZ-H2M"
  mine_id      text        not null references public.mines(id) on delete cascade,
  name         text        not null,
  type         text        not null,      -- "High Risk" | "Moderate" | "Subsidence Fringe"
  severity     text        not null default 'High',  -- "High" | "Moderate" | "Low"
  status       text        not null default 'Active',
  area_km2     numeric,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ── 6. LATEST READING VIEW for kml_sensor_nodes ───────────────
create or replace view public.kml_node_latest_reading as
select distinct on (node_id)
  node_id,
  pn_id,
  reading,
  recorded_at
from public.kml_sensor_readings
order by node_id, recorded_at desc;

-- ── 7. LIVE KML NODE VIEW (join nodes + latest reading) ────────
create or replace view public.kml_node_live as
select
  n.id,
  n.mine_id,
  n.principle_node_id as pn_id,
  n.type,
  n.unit,
  n.status,
  n.battery_pct,
  n.signal_pct,
  n.fault,
  n.lat,
  n.lon,
  n.alt_m,
  n.updated_at,
  lr.reading   as latest_reading,
  lr.recorded_at
from public.kml_sensor_nodes n
left join public.kml_node_latest_reading lr on lr.node_id = n.id;

-- ── 8. PN HEALTH SUMMARY VIEW ──────────────────────────────────
create or replace view public.pn_health_summary as
select
  pn.id                                                              as pn_id,
  pn.mine_id,
  pn.status                                                          as pn_status,
  pn.battery_pct                                                     as pn_battery,
  pn.signal_dbm,
  count(n.id)::int                                                   as total_nodes,
  count(n.id) filter (where n.status = 'Normal')::int                as normal_nodes,
  count(n.id) filter (where n.status = 'Watch')::int                 as watch_nodes,
  count(n.id) filter (where n.status = 'Warning')::int               as warning_nodes,
  count(n.id) filter (where n.fault)::int                            as fault_nodes,
  round(
    100.0 * count(n.id) filter (where n.status = 'Normal') / nullif(count(n.id),0), 1
  )::numeric                                                          as health_pct
from public.principle_nodes pn
left join public.kml_sensor_nodes n on n.principle_node_id = pn.id
group by pn.id, pn.mine_id, pn.status, pn.battery_pct, pn.signal_dbm;

-- ── 9. RLS policies for new tables ───────────────────────────────
alter table public.principle_nodes      enable row level security;
alter table public.kml_sensor_nodes     enable row level security;
alter table public.kml_sensor_readings  enable row level security;
alter table public.risk_zones           enable row level security;

create policy "anon_read_pn"    on public.principle_nodes      for select using (true);
create policy "anon_read_ksn"   on public.kml_sensor_nodes     for select using (true);
create policy "anon_read_ksr"   on public.kml_sensor_readings  for select using (true);
create policy "anon_read_rz"    on public.risk_zones           for select using (true);

create policy "auth_write_pn"   on public.principle_nodes      for all using (auth.role() = 'authenticated');
create policy "auth_write_ksn"  on public.kml_sensor_nodes     for all using (auth.role() = 'authenticated');
create policy "auth_write_ksr"  on public.kml_sensor_readings  for all using (auth.role() = 'authenticated');
create policy "auth_write_rz"   on public.risk_zones           for all using (auth.role() = 'authenticated');

-- ── 10. Enable Realtime on hot tables ────────────────────────────
-- Run these in Supabase: Database → Replication → enable for tables below
-- Or uncomment if using supabase CLI:
-- alter publication supabase_realtime add table public.kml_sensor_readings;
-- alter publication supabase_realtime add table public.kml_sensor_nodes;
-- alter publication supabase_realtime add table public.principle_nodes;
-- alter publication supabase_realtime add table public.alerts;

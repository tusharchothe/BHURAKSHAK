-- ============================================================
--  BhuraKshak – Live Reading Simulator
--  Paste into Supabase SQL Editor and run repeatedly (or
--  set up a pg_cron job every 30 seconds).
--
--  Each run inserts one new reading per PN (4 rows) into
--  kml_sensor_readings, simulating a slowly-drifting sensor.
-- ============================================================

-- Pick one representative node per PN (the first SN in each group)
-- and generate a reading with small random drift from the previous value.

with latest as (
  select distinct on (pn_id)
    node_id,
    pn_id,
    reading,
    recorded_at
  from public.kml_sensor_readings
  order by pn_id, recorded_at desc
),
new_readings as (
  select
    node_id,
    pn_id,
    -- Add gaussian-ish drift: previous ± (0 to 0.15) mm
    round(
      reading + (random() * 0.3 - 0.15),
      3
    ) as reading,
    now() as recorded_at
  from latest
)
insert into public.kml_sensor_readings (node_id, pn_id, reading, recorded_at)
select node_id, pn_id, reading, recorded_at from new_readings;

-- Also update the kml_sensor_nodes.latest_reading for map colour sync
update public.kml_sensor_nodes n
set
  latest_reading  = nr.reading,
  last_reading_at = nr.recorded_at,
  updated_at      = now()
from (
  select distinct on (node_id) node_id, reading, recorded_at
  from public.kml_sensor_readings
  order by node_id, recorded_at desc
) nr
where nr.node_id = n.id;

-- Verify
select pn_id, count(*) as total_readings, max(recorded_at) as latest
from public.kml_sensor_readings
group by pn_id
order by pn_id;

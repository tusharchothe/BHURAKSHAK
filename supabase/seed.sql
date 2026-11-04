-- ============================================================
--  BhuraKshak – Seed Data  (run AFTER schema.sql)
--  Paste into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── 1. Mine ──────────────────────────────────────────────────
insert into public.mines (id, name, location, operator) values
  ('moonidih', 'Moonidih Mine', 'Dhanbad, Jharkhand', 'BCCL')
on conflict (id) do nothing;

-- ── 2. Panels ────────────────────────────────────────────────
insert into public.panels (id, mine_id, name, status, depth_m, seam, method, coverage_pct, risk_level) values
  ('P03', 'moonidih', 'Panel 03', 'Active Extraction', 150, 'Seam-II',  'Bord & Pillar', 80,  'WATCH'),
  ('P04', 'moonidih', 'Panel 04', 'Active Extraction', 180, 'Seam-III', 'Bord & Pillar', 100, 'WARNING'),
  ('P05', 'moonidih', 'Panel 05', 'Active Extraction', 210, 'Seam-III', 'Longwall',       100, 'NORMAL')
on conflict (id) do nothing;

-- ── 3. Sensors ───────────────────────────────────────────────
insert into public.sensors (id, panel_id, type, unit, status, battery_pct, signal_pct, fault) values
  ('SEN-001', 'P04', 'Tilt',         '°',  'Normal',  95, 98, false),
  ('SEN-002', 'P04', 'Vibration',    'g',  'Normal',  92, 96, false),
  ('SEN-003', 'P04', 'Displacement', 'mm', 'Watch',   88, 94, false),
  ('SEN-004', 'P04', 'Tilt',         '°',  'Warning', 80, 90, false),
  ('SEN-005', 'P05', 'Displacement', 'mm', 'Normal',  97, 99, false),
  ('SEN-006', 'P05', 'Vibration',    'g',  'Normal',  93, 97, false),
  ('SEN-007', 'P05', 'Tilt',         '°',  'Watch',   85, 92, false),
  ('SEN-008', 'P03', 'Displacement', 'mm', 'Warning', 40, 75, false),
  ('SEN-009', 'P03', 'Tilt',         '°',  'Normal',  91, 95, false),
  ('SEN-010', 'P04', 'Vibration',    'g',  'Normal',  94, 98, false),
  ('SEN-011', 'P05', 'Displacement', 'mm', 'Normal',  96, 99, false),
  ('SEN-012', 'P03', 'Tilt',         '°',  'Normal',  90, 94, false),
  ('SEN-013', 'P04', 'Vibration',    'g',  'Watch',   82, 88, false),
  ('SEN-014', 'P05', 'Displacement', 'mm', 'Normal',  95, 97, false),
  ('SEN-015', 'P03', 'Tilt',         '°',  'Normal',  93, 96, false),
  ('SEN-016', 'P04', 'Vibration',    'g',  'Normal',  91, 95, false),
  ('SEN-017', 'P05', 'Displacement', 'mm', 'Normal',  97, 99, false),
  ('SEN-018', 'P03', 'Tilt',         '°',  'Warning', 15, 60, false),
  ('SEN-019', 'P04', 'Vibration',    'g',  'Normal',  98, 99, false),
  ('SEN-020', 'P05', 'Displacement', 'mm', 'Watch',   87, 93, false),
  ('SEN-021', 'P03', 'Tilt',         '°',  'Normal',  92, 96, false),
  ('SEN-022', 'P04', 'Vibration',    'g',  'Normal',  94, 98, false),
  ('SEN-023', 'P05', 'Displacement', 'mm', 'Normal',  96, 99, false),
  ('SEN-024', 'P03', 'Tilt',         '°',  'Normal',  90, 95, false),
  ('SEN-025', 'P04', 'Vibration',    'g',  'Normal',  93, 97, false),
  ('SEN-026', 'P05', 'Displacement', 'mm', 'Watch',   84, 91, false)
on conflict (id) do nothing;

-- ── 4. Sensor Readings ────────────────────────────────────────
-- SEN-003 displacement — rising trend (used for deformation chart)
insert into public.sensor_readings (sensor_id, panel_id, reading, recorded_at) values
  ('SEN-003','P04', 1.80, now() - interval '60 min'),
  ('SEN-003','P04', 1.90, now() - interval '55 min'),
  ('SEN-003','P04', 2.00, now() - interval '50 min'),
  ('SEN-003','P04', 2.10, now() - interval '45 min'),
  ('SEN-003','P04', 2.15, now() - interval '40 min'),
  ('SEN-003','P04', 2.20, now() - interval '35 min'),
  ('SEN-003','P04', 2.25, now() - interval '30 min'),
  ('SEN-003','P04', 2.30, now() - interval '25 min'),
  ('SEN-003','P04', 2.28, now() - interval '20 min'),
  ('SEN-003','P04', 2.35, now() - interval '15 min'),
  ('SEN-003','P04', 2.38, now() - interval '10 min'),
  ('SEN-003','P04', 2.40, now() - interval '5 min'),
  ('SEN-003','P04', 2.40, now());

-- SEN-007 tilt — steady rise
insert into public.sensor_readings (sensor_id, panel_id, reading, recorded_at) values
  ('SEN-007','P05', 0.80, now() - interval '60 min'),
  ('SEN-007','P05', 0.85, now() - interval '55 min'),
  ('SEN-007','P05', 0.90, now() - interval '50 min'),
  ('SEN-007','P05', 0.95, now() - interval '45 min'),
  ('SEN-007','P05', 1.00, now() - interval '40 min'),
  ('SEN-007','P05', 1.02, now() - interval '35 min'),
  ('SEN-007','P05', 1.05, now() - interval '30 min'),
  ('SEN-007','P05', 1.06, now() - interval '25 min'),
  ('SEN-007','P05', 1.08, now() - interval '20 min'),
  ('SEN-007','P05', 1.09, now() - interval '15 min'),
  ('SEN-007','P05', 1.10, now() - interval '10 min'),
  ('SEN-007','P05', 1.10, now() - interval '5 min'),
  ('SEN-007','P05', 1.10, now());

-- SEN-011 displacement — low stable
insert into public.sensor_readings (sensor_id, panel_id, reading, recorded_at) values
  ('SEN-011','P05', 0.40, now() - interval '60 min'),
  ('SEN-011','P05', 0.42, now() - interval '55 min'),
  ('SEN-011','P05', 0.45, now() - interval '50 min'),
  ('SEN-011','P05', 0.48, now() - interval '45 min'),
  ('SEN-011','P05', 0.50, now() - interval '40 min'),
  ('SEN-011','P05', 0.52, now() - interval '35 min'),
  ('SEN-011','P05', 0.54, now() - interval '30 min'),
  ('SEN-011','P05', 0.56, now() - interval '25 min'),
  ('SEN-011','P05', 0.57, now() - interval '20 min'),
  ('SEN-011','P05', 0.58, now() - interval '15 min'),
  ('SEN-011','P05', 0.59, now() - interval '10 min'),
  ('SEN-011','P05', 0.60, now() - interval '5 min'),
  ('SEN-011','P05', 0.60, now());

-- Latest single readings for all remaining sensors
insert into public.sensor_readings (sensor_id, panel_id, reading, recorded_at) values
  ('SEN-001','P04', 0.45, now()),
  ('SEN-002','P04', 0.12, now()),
  ('SEN-004','P04', 0.82, now()),
  ('SEN-005','P05', 0.60, now()),
  ('SEN-006','P05', 0.18, now()),
  ('SEN-008','P03', 3.20, now() - interval '2 min'),
  ('SEN-009','P03', 0.33, now()),
  ('SEN-010','P04', 0.09, now()),
  ('SEN-012','P03', 0.71, now() - interval '1 min'),
  ('SEN-013','P04', 0.22, now() - interval '2 min'),
  ('SEN-014','P05', 1.10, now()),
  ('SEN-015','P03', 0.55, now()),
  ('SEN-016','P04', 0.14, now() - interval '1 min'),
  ('SEN-017','P05', 0.80, now()),
  ('SEN-018','P03', 0.99, now() - interval '2 min'),
  ('SEN-019','P04', 0.07, now()),
  ('SEN-020','P05', 1.50, now() - interval '1 min'),
  ('SEN-021','P03', 0.41, now()),
  ('SEN-022','P04', 0.11, now()),
  ('SEN-023','P05', 0.90, now()),
  ('SEN-024','P03', 0.63, now() - interval '1 min'),
  ('SEN-025','P04', 0.19, now()),
  ('SEN-026','P05', 2.10, now() - interval '2 min');

-- ── 5. Anomalies ──────────────────────────────────────────────
insert into public.anomalies (id, sensor_id, panel_id, type, severity, status, detected_at) values
  ('ANM-001', 'SEN-003', 'P04', 'Sudden Displacement', 'High', 'Unreviewed',          now() - interval '3 min'),
  ('ANM-002', 'SEN-007', 'P05', 'Vibration Spike',     'Low',  'Under Investigation', now() - interval '10 min'),
  ('ANM-003', 'SEN-004', 'P04', 'Tilt Change',         'Low',  'Unreviewed',          now() - interval '17 min')
on conflict (id) do nothing;

-- ── 6. Alerts ─────────────────────────────────────────────────
insert into public.alerts (id, mine_id, severity, title, location, status, sensor_count, persistence, tilt_trend, displacement, health_note) values
  ('ALT-2026-042', 'moonidih', 'warning',
   'Persistent abnormal deformation trend detected.',
   'Panel P04, Zone Z-04', 'open', 4,
   '18-minute persistence', 'Increasing tilt rate', 'Displacement trend', 'Sensor health normal'),
  ('ALT-2026-041', 'moonidih', 'watch',
   'Elevated vibration signature',
   'Panel P05, Zone Z-02', 'acknowledged', 2,
   '5-minute persistence', 'Stable', 'None', 'Sensor health normal')
on conflict (id) do nothing;

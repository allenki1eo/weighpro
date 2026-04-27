create table if not exists public.movement_types (
  id text primary key,
  label text not null,
  requires_order_note boolean not null default false,
  requires_second_weight boolean not null default true,
  requires_fuel_support boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null,
  business_unit text,
  created_at timestamptz not null default now()
);

create table if not exists public.amcos_fuel_rates (
  id uuid primary key default gen_random_uuid(),
  amcos_name text not null,
  collection_point text not null,
  distance_km numeric not null,
  fuel_rate_per_km numeric not null,
  fuel_currency text not null default 'TZS',
  effective_from date not null default current_date,
  effective_to date,
  unique (amcos_name, collection_point, effective_from)
);

create table if not exists public.station_devices (
  id uuid primary key default gen_random_uuid(),
  station_name text not null,
  device_type text not null,
  device_name text not null,
  connection_status text not null default 'unknown',
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.weigh_session_photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.weigh_sessions(id) on delete cascade,
  photo_kind text not null,
  image_url text not null,
  camera_id text,
  captured_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  approval_type text not null,
  status text not null default 'pending',
  requested_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.movement_types (id, label, requires_order_note, requires_second_weight, requires_fuel_support)
values
  ('raw_material_receipt', 'Raw material receipt', false, true, false),
  ('raw_cotton_receipt', 'Raw cotton receipt', false, true, true),
  ('finished_goods_dispatch', 'Finished goods dispatch', true, true, false),
  ('production_transfer', 'Production transfer', false, true, false),
  ('lint_bale_transfer', 'Lint bale transfer', false, true, false),
  ('packaging_receipt', 'Packaging receipt', false, true, false),
  ('return_or_empty_movement', 'Return or empty movement', false, true, false),
  ('manual_weigh', 'Manual weigh', false, false, false)
on conflict (id) do update set
  label = excluded.label,
  requires_order_note = excluded.requires_order_note,
  requires_second_weight = excluded.requires_second_weight,
  requires_fuel_support = excluded.requires_fuel_support;

create index if not exists amcos_fuel_rates_lookup_idx on public.amcos_fuel_rates(amcos_name, collection_point);
create index if not exists station_devices_status_idx on public.station_devices(station_name, device_type, connection_status);
create index if not exists weigh_session_photos_session_idx on public.weigh_session_photos(session_id);
create index if not exists approvals_entity_idx on public.approvals(entity_type, entity_id, status);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

alter table public.movement_types enable row level security;
alter table public.materials enable row level security;
alter table public.amcos_fuel_rates enable row level security;
alter table public.station_devices enable row level security;
alter table public.weigh_session_photos enable row level security;
alter table public.approvals enable row level security;
alter table public.audit_logs enable row level security;

create policy "Authenticated users can read movement types" on public.movement_types for select to authenticated using (true);
create policy "Authenticated users can manage movement types" on public.movement_types for all to authenticated using (true) with check (true);

create policy "Authenticated users can read materials" on public.materials for select to authenticated using (true);
create policy "Authenticated users can manage materials" on public.materials for all to authenticated using (true) with check (true);

create policy "Authenticated users can read AMCOS fuel rates" on public.amcos_fuel_rates for select to authenticated using (true);
create policy "Authenticated users can manage AMCOS fuel rates" on public.amcos_fuel_rates for all to authenticated using (true) with check (true);

create policy "Authenticated users can read station devices" on public.station_devices for select to authenticated using (true);
create policy "Authenticated users can manage station devices" on public.station_devices for all to authenticated using (true) with check (true);

create policy "Authenticated users can read weigh photos" on public.weigh_session_photos for select to authenticated using (true);
create policy "Authenticated users can manage weigh photos" on public.weigh_session_photos for all to authenticated using (true) with check (true);

create policy "Authenticated users can read approvals" on public.approvals for select to authenticated using (true);
create policy "Authenticated users can manage approvals" on public.approvals for all to authenticated using (true) with check (true);

create policy "Authenticated users can read audit logs" on public.audit_logs for select to authenticated using (true);
create policy "Authenticated users can write audit logs" on public.audit_logs for insert to authenticated with check (true);

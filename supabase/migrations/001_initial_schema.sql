create extension if not exists "pgcrypto";

create type public.weigh_session_status as enum ('awaiting_first_weight','awaiting_second_weight','completed','cancelled');
create type public.weigh_event_kind as enum ('first_weight','second_weight','manual_adjustment');

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text not null unique,
  driver_name text,
  transport_company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_notes (
  id uuid primary key default gen_random_uuid(),
  external_note_id text not null unique,
  business_unit text,
  movement_type text,
  material_category text,
  counterparty_name text,
  amcos_name text,
  collection_point text,
  distance_km numeric,
  fuel_rate_per_km numeric,
  fuel_currency text not null default 'TZS',
  fuel_payable_amount numeric generated always as (case when distance_km is not null and fuel_rate_per_km is not null then distance_km * fuel_rate_per_km else null end) stored,
  customer_name text not null,
  vehicle_id uuid references public.vehicles(id),
  vehicle_plate text not null,
  driver_name text,
  product text not null,
  destination text,
  quantity numeric,
  scheduled_at timestamptz,
  notes text,
  raw_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.weigh_sessions (
  id uuid primary key default gen_random_uuid(),
  order_note_id uuid references public.order_notes(id),
  vehicle_id uuid references public.vehicles(id),
  status public.weigh_session_status not null default 'awaiting_first_weight',
  direction text not null default 'outbound',
  first_weight_kg numeric,
  second_weight_kg numeric,
  net_weight_kg numeric generated always as (case when first_weight_kg is not null and second_weight_kg is not null then abs(second_weight_kg - first_weight_kg) else null end) stored,
  opened_by uuid,
  closed_by uuid,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text
);

create table public.weigh_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.weigh_sessions(id) on delete cascade,
  kind public.weigh_event_kind not null,
  weight_kg numeric not null,
  raw_indicator_frame text,
  stable boolean not null default true,
  captured_by uuid,
  captured_at timestamptz not null default now()
);

create table public.camera_reads (
  id uuid primary key default gen_random_uuid(),
  camera_id text not null,
  plate text not null,
  confidence numeric,
  image_url text,
  matched_vehicle_id uuid references public.vehicles(id),
  matched_order_note_id uuid references public.order_notes(id),
  matched_session_id uuid references public.weigh_sessions(id),
  raw_payload jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table public.integration_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  event_type text not null,
  external_id text,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index order_notes_vehicle_plate_idx on public.order_notes(vehicle_plate);
create index order_notes_scheduled_at_idx on public.order_notes(scheduled_at);
create index weigh_sessions_status_idx on public.weigh_sessions(status);
create index camera_reads_plate_idx on public.camera_reads(plate);

alter table public.vehicles enable row level security;
alter table public.order_notes enable row level security;
alter table public.weigh_sessions enable row level security;
alter table public.weigh_events enable row level security;
alter table public.camera_reads enable row level security;
alter table public.integration_events enable row level security;

create policy "Authenticated users can manage vehicles" on public.vehicles for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage order notes" on public.order_notes for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage weigh sessions" on public.weigh_sessions for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage weigh events" on public.weigh_events for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage camera reads" on public.camera_reads for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage integration events" on public.integration_events for all to authenticated using (true) with check (true);

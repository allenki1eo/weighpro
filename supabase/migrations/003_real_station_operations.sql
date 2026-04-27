create sequence if not exists public.weigh_ticket_seq start 1000;

alter table public.weigh_sessions
  add column if not exists ticket_no text unique default ('WB-' || nextval('public.weigh_ticket_seq'::regclass)),
  add column if not exists movement_type text,
  add column if not exists counterparty_name text,
  add column if not exists product text,
  add column if not exists manual_override_reason text,
  add column if not exists offline_client_id text,
  add column if not exists synced_at timestamptz;

alter table public.vehicles
  add column if not exists stored_tare_kg numeric,
  add column if not exists stored_tare_verified_at timestamptz,
  add column if not exists rfid_tag text unique,
  add column if not exists driver_phone text;

create table if not exists public.axle_weigh_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.weigh_sessions(id) on delete cascade,
  axle_number integer not null,
  weight_kg numeric not null,
  legal_limit_kg numeric,
  captured_at timestamptz not null default now()
);

create table if not exists public.stored_tares (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  tare_kg numeric not null,
  verified_by uuid,
  verified_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true,
  notes text
);

create table if not exists public.weight_curve_samples (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.weigh_sessions(id) on delete cascade,
  weight_kg numeric not null,
  stable boolean not null default false,
  sample_index integer not null default 0,
  captured_at timestamptz not null default now()
);

create table if not exists public.station_hardware_events (
  id uuid primary key default gen_random_uuid(),
  station_name text not null,
  device_type text not null,
  device_name text,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.driver_kiosk_sessions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id),
  session_id uuid references public.weigh_sessions(id),
  kiosk_id text not null,
  status text not null default 'started',
  language text not null default 'en',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.weigh_sessions(id),
  provider text not null,
  external_reference text,
  amount numeric not null,
  currency text not null default 'TZS',
  status text not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calibration_certifications (
  id uuid primary key default gen_random_uuid(),
  station_name text not null,
  certificate_no text,
  certified_by text,
  certified_at date not null,
  expires_at date not null,
  document_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.regulatory_exports (
  id uuid primary key default gen_random_uuid(),
  export_type text not null,
  period_start date not null,
  period_end date not null,
  file_url text,
  status text not null default 'queued',
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.offline_outbox (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  entity_type text not null,
  entity_id text not null,
  operation text not null,
  payload jsonb not null,
  status text not null default 'queued',
  error text,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

create index if not exists axle_weigh_events_session_idx on public.axle_weigh_events(session_id, axle_number);
create index if not exists stored_tares_vehicle_idx on public.stored_tares(vehicle_id, active);
create index if not exists weight_curve_samples_session_idx on public.weight_curve_samples(session_id, captured_at);
create index if not exists station_hardware_events_lookup_idx on public.station_hardware_events(station_name, device_type, created_at desc);
create index if not exists payment_transactions_session_idx on public.payment_transactions(session_id, status);
create index if not exists calibration_certifications_due_idx on public.calibration_certifications(station_name, expires_at);
create index if not exists offline_outbox_status_idx on public.offline_outbox(client_id, status, created_at);

alter table public.axle_weigh_events enable row level security;
alter table public.stored_tares enable row level security;
alter table public.weight_curve_samples enable row level security;
alter table public.station_hardware_events enable row level security;
alter table public.driver_kiosk_sessions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.calibration_certifications enable row level security;
alter table public.regulatory_exports enable row level security;
alter table public.offline_outbox enable row level security;

create policy "Authenticated users can manage axle weigh events" on public.axle_weigh_events for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage stored tares" on public.stored_tares for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage weight curve samples" on public.weight_curve_samples for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage station hardware events" on public.station_hardware_events for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage kiosk sessions" on public.driver_kiosk_sessions for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage payments" on public.payment_transactions for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage calibration records" on public.calibration_certifications for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage regulatory exports" on public.regulatory_exports for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage offline outbox" on public.offline_outbox for all to authenticated using (true) with check (true);

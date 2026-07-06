-- AgroChain — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Replaces Hyperledger Fabric chaincode state with Postgres tables.

-- ── User profiles ────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with username + role.
create table if not exists public.profiles (
  id       uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role     text not null default 'farmer'
    check (role in ('farmer','mill','lab','regulator','consumer','admin'))
);

-- Auto-create profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'farmer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Wheat batches ─────────────────────────────────────────────────────────────
-- Corresponds to CreateWheatBatch chaincode transaction.
create table if not exists public.wheat_batches (
  id             uuid primary key default gen_random_uuid(),
  wheat_batch_id text unique not null,
  entity_id      text not null,
  variety        text,
  quantity       numeric default 0,
  harvest_date   date,
  qr_code        text,
  latitude       numeric,
  longitude      numeric,
  status         text not null default 'Created'
    check (status in ('Created','In Transit','Processing','Delivered')),
  created_by     uuid references auth.users(id),
  created_at     timestamptz default now()
);

-- ── Batch transfers ───────────────────────────────────────────────────────────
-- Corresponds to SendWheatBatch chaincode transaction.
create table if not exists public.batch_transfers (
  id             uuid primary key default gen_random_uuid(),
  wheat_batch_id text not null references public.wheat_batches(wheat_batch_id),
  from_entity_id text not null,
  to_entity_id   text not null,
  quantity       numeric default 0,
  transfer_date  date,
  location       text,
  created_by     uuid references auth.users(id),
  created_at     timestamptz default now()
);

-- ── Quality reports ───────────────────────────────────────────────────────────
-- Corresponds to RecordQualityTest chaincode transaction.
create table if not exists public.quality_reports (
  id          uuid primary key default gen_random_uuid(),
  report_id   text unique not null,
  subject_id  text not null,   -- batch/product ID under test; intentionally no FK
                               -- so labs can record tests for IDs outside wheat_batches
                               -- (e.g. consumer-reported products, sugar batches)
  lab_id      text,
  tested_by   text,
  test_date   date,
  moisture    numeric,
  protein     numeric,
  gluten      numeric,
  pesticides  boolean default false,
  aflatoxin   boolean default false,
  result      text not null default 'Pass' check (result in ('Pass','Fail')),
  grade       text not null default 'A'    check (grade  in ('A','B','C')),
  cert_hash   text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- ── Consumer issues ───────────────────────────────────────────────────────────
-- Corresponds to ReportConsumerIssue chaincode transaction.
create table if not exists public.consumer_issues (
  id           uuid primary key default gen_random_uuid(),
  product_id   text not null,
  district     text,
  description  text,
  reported_by  uuid references auth.users(id),
  created_at   timestamptz default now()
);

-- ── Row-level security ────────────────────────────────────────────────────────
-- For a research demo: allow anon read + authenticated write.
-- Tighten per-role in production.
alter table public.profiles       enable row level security;
alter table public.wheat_batches  enable row level security;
alter table public.batch_transfers enable row level security;
alter table public.quality_reports enable row level security;
alter table public.consumer_issues enable row level security;

-- Public read
create policy "public read profiles"        on public.profiles        for select using (true);
create policy "public read wheat_batches"   on public.wheat_batches   for select using (true);
create policy "public read batch_transfers" on public.batch_transfers  for select using (true);
create policy "public read quality_reports" on public.quality_reports  for select using (true);
create policy "public read consumer_issues" on public.consumer_issues  for select using (true);

-- Authenticated write
create policy "auth insert wheat_batches"   on public.wheat_batches   for insert with check (auth.role() = 'authenticated');
create policy "auth update wheat_batches"   on public.wheat_batches   for update using  (auth.role() = 'authenticated');
create policy "auth insert batch_transfers" on public.batch_transfers  for insert with check (auth.role() = 'authenticated');
create policy "auth insert quality_reports" on public.quality_reports  for insert with check (auth.role() = 'authenticated');
create policy "auth insert consumer_issues" on public.consumer_issues  for insert with check (auth.role() = 'authenticated');

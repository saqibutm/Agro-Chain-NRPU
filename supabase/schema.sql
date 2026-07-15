-- AgroChain — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Replaces Hyperledger Fabric chaincode state with Postgres tables.

-- ── User profiles ────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with username + role. There is no email-based
-- sign-up: "username" holds the user's 11-digit mobile number (e.g.
-- 03001234567), which the app also uses to build a synthetic
-- <number>@agrochain.local address for Supabase Auth under the hood.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  role       text not null default 'farmer'
    check (role in ('farmer','mill','lab','regulator','consumer')),
  avatar_url text
);

-- Re-running this file against a project created before avatar_url existed.
alter table public.profiles add column if not exists avatar_url text;

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
-- Corresponds to CreateWheatBatch chaincode transaction. Table/column names
-- predate commodity: this same table holds both wheat and sugarcane batches,
-- distinguished by the commodity column below (added after "variety" turned
-- out to be the only field telling them apart — a free-text farmer-typed
-- variety name, not a real crop-type selector).
create table if not exists public.wheat_batches (
  id             uuid primary key default gen_random_uuid(),
  wheat_batch_id text unique not null,
  entity_id      text not null,
  commodity      text not null default 'wheat' check (commodity in ('wheat','sugarcane')),
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

-- Re-running this file against a project created before commodity existed.
alter table public.wheat_batches add column if not exists commodity text not null default 'wheat';
alter table public.wheat_batches drop constraint if exists wheat_batches_commodity_check;
alter table public.wheat_batches add constraint wheat_batches_commodity_check check (commodity in ('wheat','sugarcane'));

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
-- moisture/protein/gluten are wheat's milling-quality metrics; brix/pol/purity
-- are sugarcane's (sugar content, sucrose %, and their ratio) — the two sets
-- are meaningless for the other commodity, so both are nullable and
-- Screens/LabDashboard.js only shows the set matching the batch's commodity.
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
  brix        numeric,
  pol         numeric,
  purity      numeric,
  pesticides  boolean default false,
  aflatoxin   boolean default false,
  result      text not null default 'Pass' check (result in ('Pass','Fail')),
  grade       text not null default 'A'    check (grade  in ('A','B','C')),
  cert_hash   text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- Re-running this file against a project created before brix/pol/purity existed.
alter table public.quality_reports add column if not exists brix   numeric;
alter table public.quality_reports add column if not exists pol    numeric;
alter table public.quality_reports add column if not exists purity numeric;

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

-- ── Mill locations ────────────────────────────────────────────────────────────
-- A mill operator can run more than one physical mill. Each row here is one
-- location they've registered from Screens/Mill/ManageMills.js, used to
-- populate a picker on the "record a batch transfer" form (Screens/Mill/Add.js)
-- instead of free-typing the name/location — and risking typos or
-- inconsistent spelling of the same mill — on every single transfer.
create table if not exists public.mills (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  location   text,
  latitude   numeric,
  longitude  numeric,
  created_at timestamptz default now(),
  unique (owner_id, name)
);

-- ── Sample transfers ──────────────────────────────────────────────────────────
-- A mill pulls a small sample from a batch and sends it to a lab for quality
-- testing — distinct from the bulk batch_transfers handoff (a sample is a
-- fraction of the batch's quantity, and the rest stays at the mill for
-- processing). This is what turns "any lab can test any ID at any time" into
-- a real chain of custody: Screens/LabDashboard.js only offers samples where
-- to_lab_username matches the signed-in lab, and moves them out of that
-- pending list once tested (see sample_id below).
create table if not exists public.sample_transfers (
  id              uuid primary key default gen_random_uuid(),
  sample_id       text unique not null,
  wheat_batch_id  text not null references public.wheat_batches(wheat_batch_id),
  from_mill_id    text not null,
  to_lab_username text not null,
  -- Grams, not kg — a lab sample is a small pinch pulled from a much larger
  -- batch, capped at 1000g (1kg) so "sample" can't smuggle in a bulk
  -- quantity. Screens/Mill/SendSample.js enforces the same cap client-side;
  -- this is the server-side backstop. See Services/units.js.
  quantity        numeric default 0 check (quantity >= 0 and quantity <= 1000),
  sent_date       date,
  status          text not null default 'Sent'
    check (status in ('Sent','Tested')),
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now()
);

-- Re-running this file against a project created before the cap existed.
alter table public.sample_transfers drop constraint if exists sample_transfers_quantity_check;
alter table public.sample_transfers add constraint sample_transfers_quantity_check check (quantity >= 0 and quantity <= 1000);

-- Links a quality report back to the specific sample it was tested from, so
-- the sample_transfers row can flip to 'Tested'. Nullable + deferred to here
-- (rather than inline on the quality_reports table above) because it can't
-- reference sample_transfers before that table exists — and on a project
-- that already has quality_reports, this alter is what actually adds it.
alter table public.quality_reports add column if not exists sample_id text references public.sample_transfers(sample_id);

-- ── Row-level security ────────────────────────────────────────────────────────
-- Batch/transfer/quality/issue/sample rows are intentionally public-read (QR
-- scan traceability works with no login). profiles is the exception —
-- profiles.username is the user's phone number, so it gets its own,
-- much narrower policy below instead of a blanket public-read.
alter table public.profiles       enable row level security;
alter table public.wheat_batches  enable row level security;
alter table public.batch_transfers enable row level security;
alter table public.quality_reports enable row level security;
alter table public.consumer_issues enable row level security;
alter table public.mills          enable row level security;
alter table public.sample_transfers enable row level security;

-- Public read
drop policy if exists "public read profiles" on public.profiles;
drop policy if exists "public read wheat_batches" on public.wheat_batches;
create policy "public read wheat_batches"   on public.wheat_batches   for select using (true);
drop policy if exists "public read batch_transfers" on public.batch_transfers;
create policy "public read batch_transfers" on public.batch_transfers  for select using (true);
drop policy if exists "public read quality_reports" on public.quality_reports;
create policy "public read quality_reports" on public.quality_reports  for select using (true);
drop policy if exists "public read consumer_issues" on public.consumer_issues;
create policy "public read consumer_issues" on public.consumer_issues  for select using (true);
drop policy if exists "public read mills" on public.mills;
create policy "public read mills"           on public.mills           for select using (true);

-- profiles: a user may only read their own row directly (it holds a phone
-- number). Other users' info needed by the app (e.g. picking a destination
-- lab by username in Screens/Mill/SendSample.js) goes through the narrow
-- list_labs() RPC further down instead of a broad SELECT policy.
drop policy if exists "own read profiles" on public.profiles;
create policy "own read profiles" on public.profiles for select using (auth.uid() = id);
drop policy if exists "public read sample_transfers" on public.sample_transfers;
create policy "public read sample_transfers" on public.sample_transfers for select using (true);

-- Authenticated write — scoped to (a) the role that legitimately performs
-- each action and (b) always self-attributing created_by/reported_by, so a
-- modified client can't insert on someone else's behalf or forge a lab
-- certification / farmer batch it never actually did. There is no general
-- UPDATE policy on wheat_batches or sample_transfers anymore (a blanket
-- "any authenticated user" USING(true) let anyone rewrite anyone else's
-- batch quantity, GPS, QR code, or status) — the only supported updates are
-- the narrow advance_batch_status()/mark_sample_tested() RPCs further down,
-- which touch only the status column.
drop policy if exists "auth insert wheat_batches" on public.wheat_batches;
drop policy if exists "farmer insert wheat_batches" on public.wheat_batches;
create policy "farmer insert wheat_batches" on public.wheat_batches for insert
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'farmer')
  );
drop policy if exists "auth update wheat_batches" on public.wheat_batches;

drop policy if exists "auth insert batch_transfers" on public.batch_transfers;
drop policy if exists "mill insert batch_transfers" on public.batch_transfers;
create policy "mill insert batch_transfers" on public.batch_transfers for insert
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'mill')
  );

drop policy if exists "auth insert quality_reports" on public.quality_reports;
drop policy if exists "lab insert quality_reports" on public.quality_reports;
create policy "lab insert quality_reports" on public.quality_reports for insert
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'lab')
  );

drop policy if exists "auth insert consumer_issues" on public.consumer_issues;
create policy "auth insert consumer_issues" on public.consumer_issues for insert
  with check (reported_by = auth.uid());

drop policy if exists "auth insert sample_transfers" on public.sample_transfers;
drop policy if exists "mill insert sample_transfers" on public.sample_transfers;
create policy "mill insert sample_transfers" on public.sample_transfers for insert
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'mill')
  );
drop policy if exists "auth update sample_transfers" on public.sample_transfers;

-- Mills: only the registering operator can add/remove their own locations
-- (unlike the tables above, this one has a real owner, so it isn't just
-- "any authenticated user").
drop policy if exists "owner insert mills" on public.mills;
create policy "owner insert mills" on public.mills for insert with check (auth.uid() = owner_id);
drop policy if exists "owner delete mills" on public.mills;
create policy "owner delete mills" on public.mills for delete using  (auth.uid() = owner_id);

-- ── Status-transition RPCs ────────────────────────────────────────────────────
-- Replace the old blanket UPDATE policies on wheat_batches/sample_transfers
-- (see above): these only ever touch the one column Services/api.js actually
-- needs to move forward, so a modified client can't use the same access to
-- rewrite a batch's quantity, GPS, QR code, or commodity.
create or replace function public.advance_batch_status(p_wheat_batch_id text, p_new_status text)
returns void language plpgsql security definer as $$
begin
  if p_new_status not in ('In Transit', 'Processing', 'Delivered') then
    raise exception 'Invalid status transition: %', p_new_status;
  end if;
  update public.wheat_batches set status = p_new_status where wheat_batch_id = p_wheat_batch_id;
end;
$$;
revoke all on function public.advance_batch_status(text, text) from public;
grant execute on function public.advance_batch_status(text, text) to authenticated;

-- Only the lab a sample was actually addressed to (to_lab_username) can flip
-- it to Tested — previously any authenticated user could mark any sample
-- (anyone's) as tested and make it disappear from the real lab's queue.
create or replace function public.mark_sample_tested(p_sample_id text)
returns void language plpgsql security definer as $$
begin
  update public.sample_transfers
  set status = 'Tested'
  where sample_id = p_sample_id
    and to_lab_username = (select username from public.profiles where id = auth.uid());
end;
$$;
revoke all on function public.mark_sample_tested(text) from public;
grant execute on function public.mark_sample_tested(text) to authenticated;

-- Lets Screens/Mill/SendSample.js populate a "destination lab" picker by
-- username without needing a broad profiles SELECT policy (see above).
create or replace function public.list_labs()
returns table(username text) language sql security definer stable as $$
  select username from public.profiles where role = 'lab' order by username;
$$;
revoke all on function public.list_labs() from public;
grant execute on function public.list_labs() to authenticated;

-- ── Avatar update ─────────────────────────────────────────────────────────────
-- No general "update own profile" RLS policy: that would let a user rewrite
-- their own `role` column (farmer -> regulator) and self-escalate privilege.
-- This RPC only ever touches avatar_url for the caller's own row.
create or replace function public.update_own_avatar(new_avatar_url text)
returns void language plpgsql security definer as $$
begin
  update public.profiles set avatar_url = new_avatar_url where id = auth.uid();
end;
$$;

revoke all on function public.update_own_avatar(text) from public;
grant execute on function public.update_own_avatar(text) to authenticated;

-- ── Avatar storage ────────────────────────────────────────────────────────────
-- Public bucket (profile pictures are low-sensitivity and shown throughout
-- the app), but a user may only write inside their own "<user id>/" folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

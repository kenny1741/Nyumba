-- ─────────────────────────────────────────────────────────────────────────────
-- Nyumba Kenya — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase auth.users) ─────────────────────────────────
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  full_name    text,
  phone        text,
  whatsapp     text,
  avatar_url   text,
  role         text default 'landlord' check (role in ('landlord', 'admin')),
  is_verified  boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── Properties ─────────────────────────────────────────────────────────────
create table public.properties (
  id               uuid default uuid_generate_v4() primary key,
  landlord_id      uuid references public.profiles(id) on delete cascade not null,
  title            text not null,
  description      text,
  house_type       text not null check (house_type in (
                     'Single Room', 'Bedsitter', 'Studio',
                     '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Maisonette'
                   )),
  monthly_rent     integer not null,
  bedrooms         integer default 0,
  bathrooms        integer default 1,
  location         text not null,
  town             text not null,
  county           text not null default 'Nairobi',
  directions       text,
  google_maps_url  text,
  amenities        text[] default '{}',
  images           text[] default '{}',
  phone            text,
  whatsapp         text,
  status           text default 'available' check (status in ('available', 'rented', 'pending')),
  is_featured      boolean default false,
  is_verified      boolean default false,
  source           text default 'manual' check (source in ('manual', 'api', 'csv', 'rss', 'import')),
  source_id        text,           -- external ID to prevent duplicate imports
  source_url       text,           -- original listing URL
  views            integer default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Import Jobs ─────────────────────────────────────────────────────────────
create table public.import_jobs (
  id           uuid default uuid_generate_v4() primary key,
  landlord_id  uuid references public.profiles(id) on delete cascade,
  source_type  text not null check (source_type in ('csv', 'api', 'rss')),
  source_url   text,
  status       text default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  total        integer default 0,
  imported     integer default 0,
  skipped      integer default 0,
  errors       text[] default '{}',
  created_at   timestamptz default now(),
  finished_at  timestamptz
);

-- ── Saved Properties (tenants) ──────────────────────────────────────────────
create table public.saved_properties (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  property_id  uuid references public.properties(id) on delete cascade,
  created_at   timestamptz default now(),
  unique(user_id, property_id)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index on public.properties (town);
create index on public.properties (house_type);
create index on public.properties (status);
create index on public.properties (landlord_id);
create index on public.properties (source_id);
create index on public.properties (created_at desc);
create index on public.properties (monthly_rent);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.properties  enable row level security;
alter table public.import_jobs enable row level security;
alter table public.saved_properties enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Properties: anyone can read available, landlord manages their own
create policy "properties_select" on public.properties for select using (status = 'available' or landlord_id = auth.uid());
create policy "properties_insert" on public.properties for insert with check (auth.uid() = landlord_id);
create policy "properties_update" on public.properties for update using (auth.uid() = landlord_id);
create policy "properties_delete" on public.properties for delete using (auth.uid() = landlord_id);

-- Import jobs: landlord sees their own
create policy "import_select" on public.import_jobs for select using (auth.uid() = landlord_id);
create policy "import_insert" on public.import_jobs for insert with check (auth.uid() = landlord_id);

-- Saved: user manages their own
create policy "saved_select" on public.saved_properties for select using (auth.uid() = user_id);
create policy "saved_insert" on public.saved_properties for insert with check (auth.uid() = user_id);
create policy "saved_delete" on public.saved_properties for delete using (auth.uid() = user_id);

-- ── Auto-update timestamps ──────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_updated_at before update on public.properties
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ── Auto-create profile on signup ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Storage bucket for property images ──────────────────────────────────────
insert into storage.buckets (id, name, public) values ('properties', 'properties', true);

create policy "images_select" on storage.objects for select using (bucket_id = 'properties');
create policy "images_insert" on storage.objects for insert with check (bucket_id = 'properties' and auth.role() = 'authenticated');
create policy "images_delete" on storage.objects for delete using (bucket_id = 'properties' and auth.uid()::text = (storage.foldername(name))[1]);

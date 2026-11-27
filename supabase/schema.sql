-- SimpanIn Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Jalankan seluruh script ini di Supabase Dashboard -> SQL Editor -> New Query.

-- 1. Tabel Collections
create table if not exists public.collections (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#8FC9FF',
  icon text not null default 'folder',
  is_system boolean not null default false,
  parent_id text null,
  created_at bigint not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- 2. Tabel Saved Items
create table if not exists public.saved_items (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  description text not null default '',
  source text not null default 'Web',
  collection_id text not null,
  is_pinned boolean not null default false,
  is_reviewed boolean not null default false,
  tags text[] not null default '{}',
  notes text not null default '',
  image text null,
  author text null,
  deadline bigint null,
  reminder_timing text null,
  custom_reminder_time bigint null,
  created_at bigint not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- 3. Tabel User Settings
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dark_mode boolean not null default false,
  home_title text[] not null default array['Simpan sekarang.', 'Temukan kapan saja.'],
  cloud_sync_enabled boolean not null default true,
  auto_extract_metadata boolean not null default true,
  notifications_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Index untuk query cepat per user
create index if not exists idx_collections_user on public.collections(user_id);
create index if not exists idx_saved_items_user on public.saved_items(user_id);
create index if not exists idx_saved_items_collection on public.saved_items(user_id, collection_id);

-- Aktifkan Row Level Security (RLS)
alter table public.collections enable row level security;
alter table public.saved_items enable row level security;
alter table public.user_settings enable row level security;

-- Policy: setiap user hanya bisa membaca/menulis datanya sendiri
drop policy if exists "Users can manage own collections" on public.collections;
create policy "Users can manage own collections"
  on public.collections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own saved_items" on public.saved_items;
create policy "Users can manage own saved_items"
  on public.saved_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own user_settings" on public.user_settings;
create policy "Users can manage own user_settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

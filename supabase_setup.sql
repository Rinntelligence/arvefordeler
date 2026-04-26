-- ============================================================
-- ARVEFORDELER – Supabase SQL oppsett
-- Kjør dette i Supabase SQL Editor (én gang)
-- ============================================================

-- 1. PROFILES (én per bruker)
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  display_name text not null,
  avatar_color text default '#8c7b6b',
  email text,
  created_at timestamptz default now()
);

-- 2. CATEGORIES
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  emoji text default '📦',
  created_at timestamptz default now()
);

-- Seed default categories
insert into categories (label, emoji) values
  ('Møbler', '🛋️'),
  ('Kunst & bilder', '🖼️'),
  ('Bøker', '📚'),
  ('Kjøkkenutstyr', '🍳'),
  ('Pyntegjenstander', '🏺'),
  ('Elektronikk', '📺'),
  ('Klær & tekstiler', '🧣'),
  ('Annet', '📦')
on conflict do nothing;

-- 3. ITEMS
create table if not exists items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  added_by uuid references auth.users(id) on delete set null,
  added_by_name text,
  created_at timestamptz default now()
);

-- 4. INTERESTS
create table if not exists interests (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references items(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  reason text,
  created_at timestamptz default now(),
  unique(item_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table interests enable row level security;

-- Profiles: alle innloggede kan se alle, bare eier kan endre sin
create policy "Alle kan se profiler" on profiles for select using (auth.role() = 'authenticated');
create policy "Eier kan lage profil" on profiles for insert with check (auth.uid() = user_id);
create policy "Eier kan oppdatere profil" on profiles for update using (auth.uid() = user_id);

-- Categories: alle innloggede kan se og legge til, ingen kan slette andres
create policy "Alle kan se kategorier" on categories for select using (auth.role() = 'authenticated');
create policy "Alle kan lage kategorier" on categories for insert with check (auth.role() = 'authenticated');
create policy "Alle kan slette kategorier" on categories for delete using (auth.role() = 'authenticated');

-- Items: alle innloggede kan se alle, alle kan legge til, bare eier sletter
create policy "Alle kan se gjenstander" on items for select using (auth.role() = 'authenticated');
create policy "Alle kan legge til gjenstander" on items for insert with check (auth.role() = 'authenticated');
create policy "Alle kan oppdatere gjenstander" on items for update using (auth.role() = 'authenticated');
create policy "Alle kan slette gjenstander" on items for delete using (auth.role() = 'authenticated');

-- Interests: alle kan se, bare eier kan endre sine
create policy "Alle kan se interesser" on interests for select using (auth.role() = 'authenticated');
create policy "Kan legge til interesse" on interests for insert with check (auth.uid() = user_id);
create policy "Kan slette sin interesse" on interests for delete using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET FOR BILDER
-- ============================================================

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict do nothing;

create policy "Alle innloggede kan laste opp bilder"
  on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.role() = 'authenticated');

create policy "Bilder er offentlig tilgjengelige"
  on storage.objects for select
  using (bucket_id = 'item-images');

-- ============================================================
-- REALTIME (aktiver for live-oppdateringer)
-- ============================================================

alter publication supabase_realtime add table items;
alter publication supabase_realtime add table interests;
alter publication supabase_realtime add table categories;

-- Ferdig! ✓

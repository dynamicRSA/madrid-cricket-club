-- ═══════════════════════════════════════════════════════════════════════════════
-- Madrid Cricket Club — Database Schema
-- Migration: 001_initial
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────
create type match_format as enum ('t10', 't20', '40_over', '50_over', 'friendly', 'other');
create type event_status as enum ('scheduled', 'completed', 'cancelled', 'postponed');
create type availability_status as enum ('available', 'not_available', 'maybe', 'no_response');
create type membership_type as enum ('senior_full', 'senior_half', 'junior_full', 'junior_half', 'social', 'honorary');
create type payment_status as enum ('unpaid', 'paid', 'waived', 'overdue');
create type charge_type as enum ('membership', 'match_fee', 'tour', 'equipment', 'fine', 'other');
create type member_role as enum ('president', 'vice_president', 'treasurer', 'secretary', 'captain_40', 'captain_t20', 'captain_junior', 'captain_womens', 'committee', 'member');

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  display_name  text,
  nationality   text,
  phone         text,
  joined_date   date,
  membership_type membership_type default 'senior_full',
  member_role   member_role default 'member',
  is_active     boolean default true,
  is_admin      boolean default false,
  emergency_contact_name  text,
  emergency_contact_phone text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Members can read their own profile, admins can read all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── VENUES ──────────────────────────────────────────────────────────────────
create table public.venues (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  short_name  text,
  address     text,
  city        text,
  map_link    text,
  notes       text,
  is_home     boolean default false,
  created_at  timestamptz default now()
);

alter table public.venues enable row level security;
create policy "venues_public_read" on public.venues for select using (true);
create policy "venues_admin_write" on public.venues for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- Seed real venues
insert into public.venues (name, short_name, address, city, map_link, notes, is_home) values
  ('Centro Deportivo Municipal La Elipa', 'La Elipa',
   'C. del Alcalde Garrido Juaristi, 17, Moratalaz', 'Madrid',
   'https://maps.google.com/?q=Centro+Deportivo+Municipal+La+Elipa+Madrid',
   'Madrid base for training and junior cricket. Subsidised by Madrid City Council (2hr/week).', true),
  ('Sporting Alfaz Cricket Ground', 'Sporting Alfaz',
   'Alfaz del Pi', 'Alicante',
   'https://maps.google.com/?q=Sporting+Alfaz+del+Pi+cricket',
   'Away ground for ECCL 40-over and 20-over coastal league. ~460km from Madrid.', false),
  ('La Manga Club', 'La Manga',
   'La Manga del Mar Menor', 'Murcia',
   'https://maps.google.com/?q=La+Manga+Club+Murcia',
   'ECCL T20 league and tournament venue.', false),
  ('Menorca Cricket Club', 'Menorca CC',
   'Camino Biniparrell 55, 07711 Biniparrell', 'Menorca',
   'https://maps.google.com/?q=Menorca+Cricket+Club+Biniparrell',
   'Spanish U18 Championship venue.', false);

-- ─── EVENTS ──────────────────────────────────────────────────────────────────
create table public.events (
  id                    uuid primary key default uuid_generate_v4(),
  type                  text not null check (type in ('match', 'nets', 'social', 'agm_meeting', 'tournament')),
  title                 text not null,
  opponent              text,
  competition           text,
  date                  date not null,
  start_time            time,
  meet_time             time,
  end_time              time,
  venue_id              uuid references public.venues(id),
  is_home               boolean default false,
  format                match_format,
  squad_size            int,
  availability_deadline date,
  team                  text default 'seniors' check (team in ('seniors', 'juniors', 'womens', 'all')),
  status                event_status default 'scheduled',
  notes                 text,
  is_livestreamed       boolean default false,
  livestream_url        text,
  created_by            uuid references auth.users(id),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.events enable row level security;
create policy "events_public_read" on public.events for select using (true);
create policy "events_admin_write" on public.events for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- ─── RESULTS ─────────────────────────────────────────────────────────────────
create table public.results (
  id                uuid primary key default uuid_generate_v4(),
  event_id          uuid unique references public.events(id) on delete cascade,
  our_score         text,
  opposition_score  text,
  overs             text,
  result            text check (result in ('won', 'lost', 'draw', 'no_result', 'abandoned')),
  margin            text,
  summary           text,
  cricclubs_link    text,
  created_at        timestamptz default now()
);

alter table public.results enable row level security;
create policy "results_public_read" on public.results for select using (true);
create policy "results_admin_write" on public.results for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- ─── AVAILABILITY ────────────────────────────────────────────────────────────
create table public.availability (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid references public.events(id) on delete cascade,
  member_id   uuid references public.profiles(id) on delete cascade,
  status      availability_status default 'no_response',
  note        text,
  responded_at timestamptz,
  created_at  timestamptz default now(),
  unique (event_id, member_id)
);

alter table public.availability enable row level security;

create policy "availability_select_own" on public.availability
  for select using (auth.uid() = member_id);

create policy "availability_select_admin" on public.availability
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "availability_upsert_own" on public.availability
  for all using (auth.uid() = member_id);

create policy "availability_admin" on public.availability
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── MEMBERSHIP CHARGES ──────────────────────────────────────────────────────
create table public.charges (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid references public.profiles(id) on delete cascade,
  type          charge_type not null,
  description   text,
  amount        numeric(8,2) not null,
  currency      text default 'EUR',
  due_date      date,
  paid_date     date,
  status        payment_status default 'unpaid',
  reference     text,
  event_id      uuid references public.events(id),
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now()
);

alter table public.charges enable row level security;

create policy "charges_select_own" on public.charges
  for select using (auth.uid() = member_id);

create policy "charges_admin" on public.charges
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── NEWS ────────────────────────────────────────────────────────────────────
create table public.news (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  content         text,
  hero_image_url  text,
  author_name     text,
  published_at    timestamptz,
  is_published    boolean default false,
  is_match_report boolean default false,
  tags            text[],
  event_id        uuid references public.events(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.news enable row level security;
create policy "news_public_published" on public.news for select using (is_published = true);
create policy "news_admin" on public.news for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- ─── AGM DOCUMENTS ───────────────────────────────────────────────────────────
create table public.agm_documents (
  id            uuid primary key default uuid_generate_v4(),
  year          int not null,
  title         text not null,
  document_url  text,
  type          text check (type in ('minutes', 'accounts', 'agenda', 'other')),
  is_public     boolean default true,
  uploaded_at   timestamptz default now()
);

alter table public.agm_documents enable row level security;
create policy "agm_public_read" on public.agm_documents for select using (is_public = true);
create policy "agm_admin" on public.agm_documents for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- ─── ACCOMMODATION ───────────────────────────────────────────────────────────
create table public.accommodation (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid references public.events(id) on delete cascade,
  name          text,
  address       text,
  check_in      date,
  check_out     date,
  cost_per_night numeric(8,2),
  notes         text,
  created_at    timestamptz default now()
);

create table public.accommodation_bookings (
  id                uuid primary key default uuid_generate_v4(),
  accommodation_id  uuid references public.accommodation(id) on delete cascade,
  member_id         uuid references public.profiles(id) on delete cascade,
  nights            int default 1,
  paid              boolean default false,
  created_at        timestamptz default now(),
  unique (accommodation_id, member_id)
);

alter table public.accommodation enable row level security;
alter table public.accommodation_bookings enable row level security;
create policy "accom_public_read" on public.accommodation for select using (true);
create policy "accom_bookings_own" on public.accommodation_bookings for all using (auth.uid() = member_id);
create policy "accom_bookings_admin" on public.accommodation_bookings for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

create trigger news_updated_at before update on public.news
  for each row execute function public.set_updated_at();

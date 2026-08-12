-- ============================================================
-- Madrid Cricket Club — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor or via migration files
-- ============================================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Membership years ──────────────────────────────────────
CREATE TABLE membership_years (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  season        text NOT NULL,              -- e.g. "2026/27"
  start_date    date NOT NULL,
  end_date      date NOT NULL,
  half_year_start date NOT NULL,
  is_current    boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- ── Membership categories ─────────────────────────────────
CREATE TABLE membership_categories (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  duration      text NOT NULL CHECK (duration IN ('full_year', 'half_year')),
  member_type   text NOT NULL CHECK (member_type IN ('senior', 'junior')),
  fee_euros     numeric(10,2) NOT NULL,
  description   text,
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Seed default categories
INSERT INTO membership_categories (name, duration, member_type, fee_euros) VALUES
  ('Senior Full Year', 'full_year', 'senior', 80.00),
  ('Senior Half Year', 'half_year', 'senior', 50.00),
  ('Junior Full Year', 'full_year', 'junior', 40.00),
  ('Junior Half Year', 'half_year', 'junior', 25.00);

-- ── Members (extends auth.users) ─────────────────────────
CREATE TABLE members (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Personal
  full_legal_name       text NOT NULL,
  preferred_name        text,
  date_of_birth         date,
  nationality           text,
  gender                text,
  id_type               text CHECK (id_type IN ('dni', 'nie', 'passport', 'other')),
  id_number             text,
  -- Contact
  email                 text NOT NULL,
  mobile                text,
  address               text,
  -- Emergency
  emergency_name        text,
  emergency_relationship text,
  emergency_phone       text,
  -- Medical
  medical_info          text,
  dietary_requirements  text,
  allergies             text,
  -- Playing
  playing_role          text CHECK (playing_role IN ('batter', 'bowler', 'all_rounder', 'wicketkeeper')),
  previous_clubs        text,
  kit_size              text,
  -- Consent
  photo_consent         boolean DEFAULT false,
  rules_accepted        boolean DEFAULT false,
  -- Status
  status                text NOT NULL DEFAULT 'enquiry' CHECK (status IN (
    'enquiry','application_in_progress','submitted','approved_awaiting_payment',
    'active','expiring_soon','expired','lapsed','rejected','withdrawn','suspended'
  )),
  roles                 text[] DEFAULT ARRAY['member'],
  is_minor              boolean DEFAULT false,
  guardian_id           uuid REFERENCES members(id),
  -- Registration
  registration_status   text DEFAULT 'not_submitted' CHECK (registration_status IN ('not_submitted','submitted','confirmed')),
  -- Audit
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own record"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all members"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
      AND ('admin' = ANY(m.roles) OR 'super_admin' = ANY(m.roles))
    )
  );

-- ── Membership records ────────────────────────────────────
CREATE TABLE membership_records (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id             uuid NOT NULL REFERENCES members(id),
  year_id               uuid NOT NULL REFERENCES membership_years(id),
  category_id           uuid NOT NULL REFERENCES membership_categories(id),
  fee_euros             numeric(10,2) NOT NULL,
  payment_reference     text UNIQUE,
  status                text DEFAULT 'pending',
  payment_amount        numeric(10,2) DEFAULT 0,
  payment_confirmed_at  timestamptz,
  payment_confirmed_by  uuid REFERENCES members(id),
  created_at            timestamptz DEFAULT now()
);

-- ── Junior profiles ───────────────────────────────────────
CREATE TABLE junior_profiles (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  guardian_member_id    uuid NOT NULL REFERENCES members(id),
  full_name             text NOT NULL,
  date_of_birth         date NOT NULL,
  playing_role          text,
  dietary_requirements  text,
  allergies             text,
  registration_status   text DEFAULT 'not_submitted',
  created_at            timestamptz DEFAULT now()
);

-- ── Venues ────────────────────────────────────────────────
CREATE TABLE venues (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  address     text,
  map_link    text,
  notes       text,
  is_home     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ── Events ────────────────────────────────────────────────
CREATE TABLE events (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type                  text NOT NULL CHECK (type IN ('match','nets','social','agm_meeting')),
  title                 text NOT NULL,
  opponent              text,
  competition           text,
  date                  date NOT NULL,
  end_date              date,
  start_time            time,
  meet_time             time,
  venue_id              uuid REFERENCES venues(id),
  is_home               boolean DEFAULT true,
  format                text,
  squad_size            int DEFAULT 11,
  availability_deadline date,
  late_changes_blocked  boolean DEFAULT false,
  team                  text DEFAULT 'seniors' CHECK (team IN ('seniors','juniors')),
  notes                 text,
  status                text DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled','postponed','completed')),
  created_at            timestamptz DEFAULT now()
);

-- ── Availability ──────────────────────────────────────────
CREATE TABLE availability (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id     uuid NOT NULL REFERENCES members(id),
  status        text NOT NULL CHECK (status IN ('available','not_available','maybe')),
  note          text,
  lift_status   text CHECK (lift_status IN ('can_drive','needs_seat','own_way')),
  lift_seats    int,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (event_id, member_id)
);

-- ── Lift assignments ──────────────────────────────────────
CREATE TABLE lift_assignments (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid NOT NULL REFERENCES events(id),
  driver_id     uuid NOT NULL REFERENCES members(id),
  passenger_id  uuid NOT NULL REFERENCES members(id),
  created_by    uuid REFERENCES members(id),
  created_at    timestamptz DEFAULT now()
);

-- ── Team selections ───────────────────────────────────────
CREATE TABLE team_selections (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid NOT NULL REFERENCES events(id),
  status        text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  captain_id    uuid REFERENCES members(id),
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE selected_players (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  selection_id      uuid NOT NULL REFERENCES team_selections(id),
  member_id         uuid NOT NULL REFERENCES members(id),
  batting_position  int,
  is_captain        boolean DEFAULT false,
  is_vice_captain   boolean DEFAULT false,
  is_wicketkeeper   boolean DEFAULT false,
  is_reserve        boolean DEFAULT false
);

-- ── Meal options & selections ─────────────────────────────
CREATE TABLE meal_options (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid NOT NULL REFERENCES events(id),
  day           date NOT NULL,
  sitting       text DEFAULT 'Lunch',
  name          text NOT NULL,
  description   text,
  price_euros   numeric(10,2),
  capacity      int,
  deadline      timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE meal_selections (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_option_id  uuid NOT NULL REFERENCES meal_options(id),
  member_id       uuid NOT NULL REFERENCES members(id),
  dietary_notes   text,
  selected_at     timestamptz DEFAULT now(),
  UNIQUE (meal_option_id, member_id)
);

-- ── Accommodation ─────────────────────────────────────────
CREATE TABLE accommodation_options (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id          uuid NOT NULL REFERENCES events(id),
  property_name     text NOT NULL,
  address           text,
  map_link          text,
  contact_details   text,
  booking_reference text,
  notes             text,
  check_in          date NOT NULL,
  check_out         date NOT NULL,
  cost_basis        text NOT NULL CHECK (cost_basis IN ('per_person_per_night','per_room_per_night','flat_per_person')),
  rate_euros        numeric(10,2) NOT NULL,
  nightly_rates     jsonb,
  capacity          int,
  booking_deadline  date,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE accommodation_bookings (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id             uuid NOT NULL REFERENCES accommodation_options(id),
  member_id             uuid NOT NULL REFERENCES members(id),
  nights                date[],
  accommodation_status  text CHECK (accommodation_status IN ('staying','own_arrangement','not_staying')),
  own_arrangement_notes text,
  guest_count           int DEFAULT 0,
  guest_names           text,
  room_sharing_pref     text,
  total_cost_euros      numeric(10,2) DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  UNIQUE (option_id, member_id)
);

-- ── Charges & payments ────────────────────────────────────
CREATE TABLE charges (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        uuid REFERENCES events(id),
  member_id       uuid NOT NULL REFERENCES members(id),
  type            text NOT NULL,
  amount_euros    numeric(10,2) NOT NULL,
  description     text,
  status          text DEFAULT 'raised' CHECK (status IN (
    'raised','declared_paid','confirmed','settled','partially_paid','waived','disputed','cancelled'
  )),
  waiver_reason   text,
  raised_at       timestamptz DEFAULT now(),
  settled_at      timestamptz,
  raised_by       uuid REFERENCES members(id)
);

CREATE TABLE payment_declarations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  charge_id     uuid NOT NULL REFERENCES charges(id),
  member_id     uuid NOT NULL REFERENCES members(id),
  amount_euros  numeric(10,2) NOT NULL,
  method        text CHECK (method IN ('cash','bank_transfer','bizum','other')),
  declared_at   timestamptz DEFAULT now(),
  reference     text,
  note          text,
  confirmed_by  uuid REFERENCES members(id),
  confirmed_at  timestamptz,
  status        text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','disputed'))
);

-- ── Fixtures & scorecards ─────────────────────────────────
CREATE TABLE fixture_results (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id          uuid NOT NULL UNIQUE REFERENCES events(id),
  our_score         text,
  opposition_score  text,
  overs             text,
  result            text CHECK (result IN ('won','lost','draw','tied','abandoned','no_result')),
  margin            text,
  summary           text,
  cricclubs_link    text,
  umpires           text,
  scorers           text,
  published         boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE scorecard_images (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    uuid NOT NULL REFERENCES events(id),
  storage_key text NOT NULL,
  caption     text,
  sort_order  int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ── News articles ─────────────────────────────────────────
CREATE TABLE news_articles (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                text UNIQUE NOT NULL,
  title               text NOT NULL,
  excerpt             text,
  content             text,
  hero_image_url      text,
  author_id           uuid REFERENCES members(id),
  published_at        timestamptz,
  is_published        boolean DEFAULT false,
  tags                text[],
  related_fixture_id  uuid REFERENCES events(id),
  is_match_report     boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- ── AGM documents ─────────────────────────────────────────
CREATE TABLE agm_documents (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  year          int NOT NULL,
  title         text NOT NULL,
  document_url  text NOT NULL,
  type          text CHECK (type IN ('minutes','accounts','agenda','other')),
  is_public     boolean DEFAULT false,
  uploaded_at   timestamptz DEFAULT now(),
  uploaded_by   uuid REFERENCES members(id)
);

-- ── Registration returns (disclosure log) ─────────────────
CREATE TABLE registration_returns (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_at           timestamptz DEFAULT now(),
  sent_by           uuid NOT NULL REFERENCES members(id),
  recipient_email   text NOT NULL,
  member_count      int NOT NULL,
  is_supplementary  boolean DEFAULT false,
  file_hash         text,
  notes             text
);

-- ── Audit trail ───────────────────────────────────────────
CREATE TABLE audit_trail (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    uuid REFERENCES members(id),
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  old_value   jsonb,
  new_value   jsonb,
  note        text,
  created_at  timestamptz DEFAULT now()
);

-- ── Site settings ─────────────────────────────────────────
CREATE TABLE site_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz DEFAULT now(),
  updated_by  uuid REFERENCES members(id)
);

INSERT INTO site_settings (key, value) VALUES
  ('club_bank_details', '{"bank_name": "Banco Santander", "iban": "ES00 0000 0000 0000 0000 0000", "bic": "BSCHESMMXXX", "account_name": "Madrid Cricket Club"}'),
  ('notification_recipients', '["secretary@madridcricketclub.es", "captain@madridcricketclub.es"]'),
  ('default_squad_size', '11'),
  ('availability_reminder_days', '[7, 3, 1]'),
  ('balance_reminder_days', '[30, 14, 7]'),
  ('cricket_espana_email', 'registration@cricketespana.es');

-- Madrid Cricket Club — Create Members Table + RLS Fix + Jersey Columns

-- Step 1: Create the members table (app uses this, not the old 'profiles' table)
CREATE TABLE IF NOT EXISTS public.members (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_legal_name         text NOT NULL DEFAULT '',
  preferred_name          text,
  date_of_birth           date,
  nationality             text,
  gender                  text,
  email                   text NOT NULL DEFAULT '',
  mobile                  text,
  address                 text,
  emergency_name          text,
  emergency_phone         text,
  playing_role            text,
  previous_clubs          text,
  kit_size                text,
  bio                     text,
  photo_consent           boolean DEFAULT false,
  rules_accepted          boolean DEFAULT false,
  status                  text NOT NULL DEFAULT 'enquiry',
  roles                   text[] DEFAULT ARRAY['member'],
  is_minor                boolean DEFAULT false,
  registration_status     text DEFAULT 'not_submitted',
  cricket_espana_id       text,
  membership_category     text,
  notes                   text,
  jersey_number           integer,
  jersey_number_requested integer,
  jersey_number_status    text DEFAULT 'none',
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- Step 2: Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Step 3: Create non-recursive admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE user_id = auth.uid()
      AND (
        'admin'       = ANY(roles) OR
        'super_admin' = ANY(roles) OR
        'treasurer'   = ANY(roles) OR
        'secretary'   = ANY(roles) OR
        'captain'     = ANY(roles)
      )
  );
$$;

-- Step 4: Members RLS policies
DROP POLICY IF EXISTS "Members read own record"   ON members;
DROP POLICY IF EXISTS "Admins read all members"   ON members;
DROP POLICY IF EXISTS "Members insert own record" ON members;
DROP POLICY IF EXISTS "Members update own record" ON members;
DROP POLICY IF EXISTS "Admins update all members" ON members;
DROP POLICY IF EXISTS "Admins insert members"     ON members;

CREATE POLICY "Members read own record"
  ON members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all members"
  ON members FOR SELECT USING (is_admin());
CREATE POLICY "Members update own record"
  ON members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins update all members"
  ON members FOR UPDATE USING (is_admin());
CREATE POLICY "Admins insert members"
  ON members FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Members insert own record"
  ON members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 5: Events RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone authenticated reads events" ON events;
DROP POLICY IF EXISTS "Admins manage events"              ON events;
CREATE POLICY "Anyone authenticated reads events"
  ON events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage events"
  ON events FOR ALL USING (is_admin());

-- Step 6: Availability RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members read availability"       ON availability;
DROP POLICY IF EXISTS "Members manage own availability" ON availability;
DROP POLICY IF EXISTS "Admins manage all availability"  ON availability;
CREATE POLICY "Members read availability"
  ON availability FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage all availability"
  ON availability FOR ALL USING (is_admin());

-- Step 7: Charges RLS
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members read own charges" ON charges;
DROP POLICY IF EXISTS "Admins manage charges"    ON charges;
CREATE POLICY "Members read own charges"
  ON charges FOR SELECT
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage charges"
  ON charges FOR ALL USING (is_admin());

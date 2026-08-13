CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  body        text,
  data        jsonb DEFAULT '{}',
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Members read own notifications') THEN
    CREATE POLICY "Members read own notifications" ON notifications FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
  END IF;
END $$

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Members update own notifications') THEN
    CREATE POLICY "Members update own notifications" ON notifications FOR UPDATE USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
  END IF;
END $$

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='System insert notifications') THEN
    CREATE POLICY "System insert notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  member_id               uuid PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  fixture_created         boolean DEFAULT true,
  selected_for_team       boolean DEFAULT true,
  selection_published     boolean DEFAULT true,
  availability_reminder   boolean DEFAULT true,
  match_reminder          boolean DEFAULT true,
  status_change           boolean DEFAULT true,
  charge_raised           boolean DEFAULT true,
  jersey_assigned         boolean DEFAULT true,
  email_enabled           boolean DEFAULT true,
  inapp_enabled           boolean DEFAULT true,
  updated_at              timestamptz DEFAULT now()
)

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notification_preferences' AND policyname='Members manage own preferences') THEN
    CREATE POLICY "Members manage own preferences" ON notification_preferences FOR ALL USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
  END IF;
END $$

CREATE TABLE IF NOT EXISTS public.membership_reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  action       text NOT NULL,
  reason       text,
  decided_by   uuid REFERENCES members(id),
  created_at   timestamptz DEFAULT now()
)

ALTER TABLE membership_reviews ENABLE ROW LEVEL SECURITY

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='membership_reviews' AND policyname='Admins manage reviews') THEN
    CREATE POLICY "Admins manage reviews" ON membership_reviews FOR ALL USING (is_admin());
  END IF;
END $$

INSERT INTO notification_preferences (member_id)
SELECT id FROM members
WHERE NOT EXISTS (SELECT 1 FROM notification_preferences np WHERE np.member_id = members.id)
ON CONFLICT (member_id) DO NOTHING

-- Migration: site_config table for club-wide settings
-- Allows admins to toggle features like registrations from the admin panel
-- Note: members.roles is a text[] array, not a single-value column

CREATE TABLE IF NOT EXISTS public.site_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed defaults
INSERT INTO public.site_config (key, value)
VALUES ('registrations_open', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read (join page needs to check this without auth)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='site_config_public_read') THEN
    CREATE POLICY "site_config_public_read" ON public.site_config FOR SELECT USING (true);
  END IF;
END $$;

-- Only admins/committee can update (roles is a text[] array)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='site_config_admin_write') THEN
    CREATE POLICY "site_config_admin_write" ON public.site_config
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.members
          WHERE user_id = auth.uid()
            AND (
              'admin' = ANY(roles) OR
              'secretary' = ANY(roles) OR
              'president' = ANY(roles) OR
              'super_admin' = ANY(roles)
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.members
          WHERE user_id = auth.uid()
            AND (
              'admin' = ANY(roles) OR
              'secretary' = ANY(roles) OR
              'president' = ANY(roles) OR
              'super_admin' = ANY(roles)
            )
        )
      );
  END IF;
END $$;

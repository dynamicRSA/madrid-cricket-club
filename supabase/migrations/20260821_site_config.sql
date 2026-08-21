-- Migration: site_config table for club-wide settings
-- Allows admins to toggle features like registrations from the admin panel

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
CREATE POLICY "site_config_public_read" ON public.site_config
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "site_config_admin_write" ON public.site_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'secretary')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'secretary')
    )
  );

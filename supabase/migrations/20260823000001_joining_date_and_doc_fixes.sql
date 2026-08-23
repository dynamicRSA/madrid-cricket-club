-- ═══════════════════════════════════════════════════════════════════════════════
-- Madrid Cricket Club — Migration: Joining Date + Document Fixes
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add joining_date to members ───────────────────────────────────────────
-- Separate, editable field (created_at stays as system timestamp).
-- Set default from created_at for existing rows.
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS joining_date date;
UPDATE public.members SET joining_date = created_at::date WHERE joining_date IS NULL;

-- ── 2. joining_date_requests ─────────────────────────────────────────────────
-- Members request a correction; admins approve/reject.
CREATE TABLE IF NOT EXISTS public.joining_date_requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  requested_date date NOT NULL,
  reason         text,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by    uuid REFERENCES public.members(id),
  review_note    text,
  reviewed_at    timestamptz,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.joining_date_requests ENABLE ROW LEVEL SECURITY;

-- Members can view and insert their own requests
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'joining_date_requests' AND policyname = 'members_own_date_requests'
  ) THEN
    CREATE POLICY "members_own_date_requests" ON public.joining_date_requests
      FOR ALL
      USING (
        member_id IN (
          SELECT id FROM public.members WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        member_id IN (
          SELECT id FROM public.members WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Admins can read and update all requests
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'joining_date_requests' AND policyname = 'admins_all_date_requests'
  ) THEN
    CREATE POLICY "admins_all_date_requests" ON public.joining_date_requests
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.members m
          WHERE m.user_id = auth.uid()
          AND (
            'admin' = ANY(m.roles)
            OR 'super_admin' = ANY(m.roles)
            OR 'secretary' = ANY(m.roles)
          )
        )
      );
  END IF;
END $$;

-- ── 3. Add source column to member_documents ──────────────────────────────────
-- Tracks whether the file was uploaded during registration or from the profile.
ALTER TABLE public.member_documents ADD COLUMN IF NOT EXISTS source text DEFAULT 'profile'
  CHECK (source IN ('registration', 'profile'));

-- ── 4. Supabase Storage — member-documents bucket policies ───────────────────
-- Note: The bucket itself must be created via Supabase Dashboard or CLI:
--   supabase storage create-bucket member-documents --private --file-size-limit 5242880
--
-- These policies allow:
--   • Members to read their own files (for profile download)
--   • Admins to read all files (for admin signed URLs)
--   • Inserts are handled server-side via Edge Function using service role
--   • No direct browser write access (files only enter via Edge Function)

-- Allow members to read their own files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'member_docs_member_read_own'
  ) THEN
    CREATE POLICY "member_docs_member_read_own"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'member-documents'
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.members WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow admins to read all files in the bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'member_docs_admin_read_all'
  ) THEN
    CREATE POLICY "member_docs_admin_read_all"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'member-documents'
        AND EXISTS (
          SELECT 1 FROM public.members m
          WHERE m.user_id = auth.uid()
          AND (
            'admin' = ANY(m.roles)
            OR 'super_admin' = ANY(m.roles)
            OR 'secretary' = ANY(m.roles)
          )
        )
      );
  END IF;
END $$;

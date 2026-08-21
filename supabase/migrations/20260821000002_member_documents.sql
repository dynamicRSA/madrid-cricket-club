-- Migration: member documents table + dietary requirements
-- Files uploaded during/after registration stored in Supabase Storage (private)

-- Add missing columns to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS dietary_requirements text;

-- Create member_documents table
CREATE TABLE IF NOT EXISTS public.member_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  doc_type     text NOT NULL,
  file_name    text NOT NULL,
  storage_path text NOT NULL,
  file_size    integer,
  mime_type    text,
  scan_status  text NOT NULL DEFAULT 'pending',
  scan_details text,
  uploaded_at  timestamptz DEFAULT now(),
  CONSTRAINT doc_type_check CHECK (doc_type IN ('id_document', 'payment_proof', 'other')),
  CONSTRAINT scan_status_check CHECK (scan_status IN ('clean', 'infected', 'pending', 'error'))
);

ALTER TABLE public.member_documents ENABLE ROW LEVEL SECURITY;

-- Members can read their own documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='member_documents' AND policyname='members_read_own_docs') THEN
    CREATE POLICY "members_read_own_docs" ON public.member_documents
      FOR SELECT USING (
        member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- Admins can read all documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='member_documents' AND policyname='admins_read_all_docs') THEN
    CREATE POLICY "admins_read_all_docs" ON public.member_documents
      FOR SELECT USING (is_admin());
  END IF;
END $$;

-- Admins can update scan status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='member_documents' AND policyname='admins_update_docs') THEN
    CREATE POLICY "admins_update_docs" ON public.member_documents
      FOR ALL USING (is_admin());
  END IF;
END $$;

-- Storage bucket and policies are created via CLI (see setup notes)
-- Bucket name: member-documents (private, 5MB limit)

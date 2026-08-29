-- Migration: add structured join form fields to members table
-- Previously these were concatenated into the notes column.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS hear_about             text,
  ADD COLUMN IF NOT EXISTS is_previous_member     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS application_experience text;

COMMENT ON COLUMN members.hear_about             IS 'How the applicant found out about Madrid CC (from join form)';
COMMENT ON COLUMN members.is_previous_member     IS 'Whether the applicant was previously a member of Madrid CC';
COMMENT ON COLUMN members.application_experience IS 'Cricket experience stated at time of application';

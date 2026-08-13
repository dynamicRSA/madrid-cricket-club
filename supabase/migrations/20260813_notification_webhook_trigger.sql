-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create trigger function that POSTs new notification rows to the edge function
CREATE OR REPLACE FUNCTION public.fn_notify_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://cfelwzoqktupvvksqeki.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZWx3em9xa3R1cHZ2a3NxZWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDcxOTksImV4cCI6MjEwMjEyMzE5OX0.EdFSz0OINuNpCKabXVCG7UDfBCDqNdguvB-O5yi7RWA'
    ),
    body    := row_to_json(NEW)::jsonb
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS trg_notify_on_insert ON public.notifications;

CREATE TRIGGER trg_notify_on_insert
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_insert();

SELECT 'Webhook trigger created successfully' AS status;

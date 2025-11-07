-- Allow admins to capture internal feedback on collaboration requests
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS admin_feedback TEXT;

COMMENT ON COLUMN public.quotes.admin_feedback IS 'Internal notes from Webara admins shared with the requester.';

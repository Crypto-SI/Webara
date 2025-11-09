-- Add user_feedback column to quotes table for bidirectional feedback
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS user_feedback TEXT;

-- Add comment to describe the purpose of this column
COMMENT ON COLUMN public.quotes.user_feedback IS 'Feedback from the user about the quote or admin response';
-- Fix profiles table id column to work with Clerk user IDs
-- The id column should be text to match Clerk user IDs, not UUID

-- Drop the primary key constraint temporarily
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Convert id column to text to match Clerk user IDs
ALTER TABLE public.profiles 
    ALTER COLUMN id TYPE text USING id::text;

-- Recreate the primary key constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Update the comment to reflect the change
COMMENT ON COLUMN public.profiles.id IS 'Primary key - can be either UUID or Clerk user ID string';

-- Ensure the unique constraint on user_id is still valid
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Update the trigger function to handle text IDs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger if it doesn't exist
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
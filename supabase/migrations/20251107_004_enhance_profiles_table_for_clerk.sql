-- Enhance profiles table to serve as complete public users table mirroring Clerk auth data
-- This migration adds missing Clerk authentication fields to eliminate dependency on auth.users

-- Add email-related fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add additional name fields for better user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add Clerk-specific timestamp fields to replace auth.users dependency
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clerk_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS clerk_last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Add metadata fields for role management and user attributes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS public_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS private_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unsafe_metadata JSONB DEFAULT '{}';

-- Add constraints for data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_email_not_null CHECK (email IS NOT NULL),
ADD CONSTRAINT IF NOT EXISTS profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_clerk_created_at_idx ON public.profiles(clerk_created_at);
CREATE INDEX IF NOT EXISTS profiles_clerk_last_sign_in_at_idx ON public.profiles(clerk_last_sign_in_at);

-- Add comments to document the new fields
COMMENT ON COLUMN public.profiles.email IS 'Primary email address from Clerk authentication';
COMMENT ON COLUMN public.profiles.email_verified IS 'Email verification status from Clerk';
COMMENT ON COLUMN public.profiles.first_name IS 'First name from Clerk user profile';
COMMENT ON COLUMN public.profiles.last_name IS 'Last name from Clerk user profile';
COMMENT ON COLUMN public.profiles.username IS 'Username from Clerk user profile';
COMMENT ON COLUMN public.profiles.clerk_created_at IS 'Account creation timestamp from Clerk';
COMMENT ON COLUMN public.profiles.clerk_last_sign_in_at IS 'Last sign-in timestamp from Clerk';
COMMENT ON COLUMN public.profiles.public_metadata IS 'Public metadata from Clerk for role management';
COMMENT ON COLUMN public.profiles.private_metadata IS 'Private metadata from Clerk';
COMMENT ON COLUMN public.profiles.unsafe_metadata IS 'Unsafe metadata from Clerk';

-- Create a function to update full_name when first_name or last_name changes
CREATE OR REPLACE FUNCTION update_full_name_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update full_name if it's not explicitly set
    IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
        NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically maintain full_name
DROP TRIGGER IF EXISTS profiles_full_name_trigger ON public.profiles;
CREATE TRIGGER profiles_full_name_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_full_name_trigger();
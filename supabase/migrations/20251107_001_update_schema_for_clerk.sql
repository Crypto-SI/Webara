-- Update database schema for Clerk integration
-- This migration removes Supabase auth dependencies and updates user ID columns

-- Remove foreign key constraints to auth.users table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_user_id_fkey;

-- Update user_id columns to store Clerk user ID as text
-- Remove default values that reference Supabase auth
ALTER TABLE public.profiles ALTER COLUMN user_id DROP DEFAULT IF EXISTS;
ALTER TABLE public.businesses ALTER COLUMN owner_id DROP DEFAULT IF EXISTS;
ALTER TABLE public.quotes ALTER COLUMN user_id DROP DEFAULT IF EXISTS;

-- Add NOT NULL constraints since we'll manage this in application logic
ALTER TABLE public.profiles ADD CONSTRAINT IF NOT EXISTS profiles_user_id_not_null CHECK (user_id IS NOT NULL);
ALTER TABLE public.businesses ADD CONSTRAINT IF NOT EXISTS businesses_owner_id_not_null CHECK (owner_id IS NOT NULL);
ALTER TABLE public.quotes ADD CONSTRAINT IF NOT EXISTS quotes_user_id_not_null CHECK (user_id IS NOT NULL);

-- Add comments to document the change
COMMENT ON COLUMN public.profiles.user_id IS 'Clerk user ID from JWT sub claim';
COMMENT ON COLUMN public.businesses.owner_id IS 'Clerk user ID from JWT sub claim';
COMMENT ON COLUMN public.quotes.user_id IS 'Clerk user ID from JWT sub claim';
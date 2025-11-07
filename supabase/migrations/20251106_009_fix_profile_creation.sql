-- Fix existing profiles that might be missing or have incorrect roles
-- This migration ensures all users have proper profiles

-- Update existing profiles to ensure they have the correct role based on user metadata
UPDATE public.profiles 
SET role = CASE 
    WHEN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = profiles.user_id 
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'webara_staff')
    ) THEN auth.users.raw_user_meta_data->>'role'
    ELSE 'user'
END
FROM auth.users
WHERE auth.users.id = profiles.user_id;

-- Create profiles for any users that don't have one
INSERT INTO public.profiles (user_id, full_name, role)
SELECT 
    auth.users.id,
    COALESCE(auth.users.raw_user_meta_data->>'full_name', split_part(auth.users.email, '@', 1)),
    CASE 
        WHEN auth.users.raw_user_meta_data->>'role' IN ('admin', 'webara_staff') 
        THEN auth.users.raw_user_meta_data->>'role'
        ELSE 'user'
    END
FROM auth.users
LEFT JOIN public.profiles ON auth.users.id = profiles.user_id
WHERE profiles.user_id IS NULL;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a function to sync roles from auth metadata to profiles
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile role when user metadata changes
    UPDATE public.profiles 
    SET role = CASE 
        WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'webara_staff') 
        THEN NEW.raw_user_meta_data->>'role'
        ELSE 'user'
    END
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync roles when user metadata is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
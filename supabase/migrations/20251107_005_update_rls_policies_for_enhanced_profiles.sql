-- Update RLS policies for enhanced profiles table
-- This migration creates comprehensive policies for the enhanced profiles table

-- Drop existing policies to recreate them with enhanced logic
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Webara staff full access to profiles" ON public.profiles;

-- Create comprehensive RLS policies for enhanced profiles table

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Policy: Users can update their own profile (with restrictions)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (
        auth.jwt() ->> 'sub' = user_id AND
        -- Users cannot change their own role or email verification status
        (role IS NOT DISTINCT FROM OLD.role) AND
        (email_verified IS NOT DISTINCT FROM OLD.email_verified)
    );

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Policy: Admins and Webara staff have full access to profiles
CREATE POLICY "Admins and staff full access to profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.jwt() ->> 'sub' 
            AND p.role IN ('admin', 'webara_staff')
        )
    );

-- Policy: Public read access for basic user information (for admin dashboard)
CREATE POLICY "Public read access for basic user info" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.jwt() ->> 'sub' 
            AND p.role IN ('admin', 'webara_staff')
        ) OR
        -- Allow admins to see all profiles
        auth.jwt() ->> 'sub' IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'webara_staff')
        )
    );

-- Create a function to check if current user is admin or staff
CREATE OR REPLACE FUNCTION is_admin_or_staff(current_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = current_user_id 
        AND role IN ('admin', 'webara_staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin user management (combines all user data)
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.email_verified,
    p.first_name,
    p.last_name,
    p.full_name,
    p.username,
    p.phone,
    p.avatar_url,
    p.role,
    p.clerk_created_at,
    p.clerk_last_sign_in_at,
    p.created_at,
    p.updated_at,
    p.public_metadata,
    p.private_metadata,
    p.unsafe_metadata
FROM public.profiles p;

-- Grant appropriate permissions
GRANT SELECT ON admin_users_view TO authenticated;
GRANT SELECT ON admin_users_view TO service_role;

-- Add comments for documentation
COMMENT ON POLICY "Users can view own profile" IS 'Allows users to see their own profile data';
COMMENT ON POLICY "Users can update own profile" IS 'Allows users to update their own profile with role restrictions';
COMMENT ON POLICY "Users can insert own profile" IS 'Allows users to create their own profile during registration';
COMMENT ON POLICY "Admins and staff full access to profiles" IS 'Grants full access to admins and webara_staff';
COMMENT ON POLICY "Public read access for basic user info" IS 'Allows admins to see all profiles for management';
COMMENT ON FUNCTION is_admin_or_staff IS 'Helper function to check if user has admin or staff role';
COMMENT ON VIEW admin_users_view IS 'Admin view for comprehensive user management';
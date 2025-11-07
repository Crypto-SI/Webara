-- Update RLS policies for Clerk integration
-- This migration drops existing policies that use Supabase auth functions
-- and creates new policies that use Clerk JWT claims

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Webara staff full access to profiles" ON public.profiles;

DROP POLICY IF EXISTS "Business owners full access" ON public.businesses;
DROP POLICY IF EXISTS "Webara staff full access to businesses" ON public.businesses;

DROP POLICY IF EXISTS "Users view own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users create own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Webara staff full access to quotes" ON public.quotes;

-- New policies using Clerk JWT
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Business owners full access" ON public.businesses
    FOR ALL USING (auth.jwt() ->> 'sub' = owner_id);

CREATE POLICY "Quote owners full access" ON public.quotes
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);
-- Drop existing policies that use JWT claims
DROP POLICY IF EXISTS "Webara staff full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Webara staff full access to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Webara staff full access to quotes" ON public.quotes;

-- Create new policies using role field from profiles

-- Profiles policies
CREATE POLICY "Admins full access to profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Webara staff full access to profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'webara_staff'
        )
    );

-- Businesses policies
CREATE POLICY "Admins full access to businesses" ON public.businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Webara staff full access to businesses" ON public.businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'webara_staff'
        )
    );

-- Quotes policies
CREATE POLICY "Admins full access to quotes" ON public.quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Webara staff full access to quotes" ON public.quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'webara_staff'
        )
    );

-- Grant admins and staff access to other tables
CREATE POLICY "Admins full access to quote_activities" ON public.quote_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('admin', 'webara_staff')
        )
    );

CREATE POLICY "Admins full access to projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('admin', 'webara_staff')
        )
    );

CREATE POLICY "Admins full access to project_milestones" ON public.project_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('admin', 'webara_staff')
        )
    );

CREATE POLICY "Admins full access to project_documents" ON public.project_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('admin', 'webara_staff')
        )
    );

CREATE POLICY "Admins full access to audit_logs" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('admin', 'webara_staff')
        )
    );
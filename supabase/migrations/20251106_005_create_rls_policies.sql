-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Webara staff full access to profiles" ON public.profiles
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'webara_staff'
    );

-- Businesses policies
CREATE POLICY "Business owners full access" ON public.businesses
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Webara staff full access to businesses" ON public.businesses
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'webara_staff'
    );

-- Quotes policies
CREATE POLICY "Users view own quotes" ON public.quotes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create own quotes" ON public.quotes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own quotes" ON public.quotes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Webara staff full access to quotes" ON public.quotes
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'webara_staff'
    );
-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    description TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    business_type TEXT CHECK (business_type IN ('startup', 'small_business', 'enterprise', 'non_profit', 'agency')),
    contact_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for businesses
CREATE TRIGGER businesses_updated_at 
    BEFORE UPDATE ON public.businesses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS businesses_owner_id_idx ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS businesses_industry_idx ON public.businesses(industry);
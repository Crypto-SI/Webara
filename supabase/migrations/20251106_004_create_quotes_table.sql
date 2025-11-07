-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    website_needs TEXT NOT NULL,
    collaboration_preferences TEXT,
    budget_range TEXT,
    ai_quote TEXT,
    suggested_collaboration TEXT,
    ai_suggestions JSONB DEFAULT '[]',
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'under_review', 'accepted', 'rejected', 'call_requested', 'project_created')),
    estimated_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for quotes
CREATE TRIGGER quotes_updated_at 
    BEFORE UPDATE ON public.quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS quotes_business_id_idx ON public.quotes(business_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON public.quotes(status);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON public.quotes(created_at);
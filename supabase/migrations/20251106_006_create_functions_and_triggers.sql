-- Function to check if user is Webara staff
CREATE OR REPLACE FUNCTION is_webara_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.jwt() ->> 'role' = 'webara_staff';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if profile already exists to avoid duplicates
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = NEW.id
    ) THEN
        INSERT INTO public.profiles (user_id, full_name, role)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            CASE
                WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'webara_staff')
                THEN NEW.raw_user_meta_data->>'role'
                ELSE 'user'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log quote activities
CREATE OR REPLACE FUNCTION log_quote_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.quote_activities (quote_id, activity_type, description, created_by)
        VALUES (NEW.id, 'created', 'Quote created', NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO public.quote_activities (quote_id, activity_type, description, created_by, metadata)
            VALUES (NEW.id, 'status_changed', 
                    format('Status changed from %s to %s', OLD.status, NEW.status), 
                    auth.uid(), 
                    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log quote activities (will be created after quote_activities table exists)
-- CREATE TRIGGER quote_activity_logger
--     AFTER INSERT OR UPDATE ON public.quotes
--     FOR EACH ROW EXECUTE FUNCTION log_quote_activity();
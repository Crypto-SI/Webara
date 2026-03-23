alter table public.apps
  add column if not exists supabase_dashboard_url text;

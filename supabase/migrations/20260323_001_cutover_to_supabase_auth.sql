-- Supabase Auth cutover
-- Keep user identifier columns as text for a staged migration, but treat the
-- values as canonical Supabase auth UUID strings moving forward.

alter table public.profiles
  alter column clerk_user_id drop not null;

comment on column public.profiles.user_id is 'Canonical Supabase Auth user id (UUID string)';
comment on column public.businesses.owner_id is 'Canonical Supabase Auth user id (UUID string)';
comment on column public.quotes.user_id is 'Canonical Supabase Auth user id (UUID string)';
comment on column public.profiles.clerk_user_id is 'Legacy Clerk user id retained only for migration/backfill history';

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins and staff full access to profiles" on public.profiles;
drop policy if exists "Public read access for basic user info" on public.profiles;

create policy "Users can view own profile" on public.profiles
  for select
  using (user_id = auth.uid()::text);

create policy "Users can update own profile" on public.profiles
  for update
  using (user_id = auth.uid()::text)
  with check (
    user_id = auth.uid()::text
    and role = (
      select p.role
      from public.profiles p
      where p.id = profiles.id
    )
    and email_verified = (
      select p.email_verified
      from public.profiles p
      where p.id = profiles.id
    )
  );

create policy "Users can insert own profile" on public.profiles
  for insert
  with check (
    user_id = auth.uid()::text
    and coalesce(role, 'user') = 'user'
    and coalesce(email_verified, false) = false
  );

create policy "Admins and staff full access to profiles" on public.profiles
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  );

drop policy if exists "Business owners full access" on public.businesses;
drop policy if exists "Admins full access to businesses" on public.businesses;
drop policy if exists "Webara staff full access to businesses" on public.businesses;

create policy "Business owners full access" on public.businesses
  for all
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

create policy "Admins and staff full access to businesses" on public.businesses
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  );

drop policy if exists "Users view own quotes" on public.quotes;
drop policy if exists "Users create own quotes" on public.quotes;
drop policy if exists "Users update own quotes" on public.quotes;
drop policy if exists "Quote owners full access" on public.quotes;
drop policy if exists "Admins full access to quotes" on public.quotes;
drop policy if exists "Webara staff full access to quotes" on public.quotes;

create policy "Quote owners full access" on public.quotes
  for all
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

create policy "Admins and staff full access to quotes" on public.quotes
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  );

do $$
begin
  if to_regclass('public.quote_activities') is not null then
    execute 'drop policy if exists "Admins full access to quote_activities" on public.quote_activities';
    execute $policy$
      create policy "Admins full access to quote_activities" on public.quote_activities
        for all
        using (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
        with check (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
    $policy$;
  end if;

  if to_regclass('public.projects') is not null then
    execute 'drop policy if exists "Admins full access to projects" on public.projects';
    execute $policy$
      create policy "Admins full access to projects" on public.projects
        for all
        using (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
        with check (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
    $policy$;
  end if;

  if to_regclass('public.project_milestones') is not null then
    execute 'drop policy if exists "Admins full access to project_milestones" on public.project_milestones';
    execute $policy$
      create policy "Admins full access to project_milestones" on public.project_milestones
        for all
        using (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
        with check (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
    $policy$;
  end if;

  if to_regclass('public.project_documents') is not null then
    execute 'drop policy if exists "Admins full access to project_documents" on public.project_documents';
    execute $policy$
      create policy "Admins full access to project_documents" on public.project_documents
        for all
        using (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
        with check (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
    $policy$;
  end if;

  if to_regclass('public.audit_logs') is not null then
    execute 'drop policy if exists "Admins full access to audit_logs" on public.audit_logs';
    execute $policy$
      create policy "Admins full access to audit_logs" on public.audit_logs
        for all
        using (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
        with check (
          exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()::text
              and p.role in ('admin', 'webara_staff')
          )
        )
    $policy$;
  end if;
end
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()::text
      and p.role in ('admin', 'webara_staff')
  );
$$;

comment on function public.is_admin() is
  'Returns true if the current Supabase auth user has admin or staff access in public.profiles.';

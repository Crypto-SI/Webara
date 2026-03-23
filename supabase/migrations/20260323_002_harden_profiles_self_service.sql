-- Harden self-service profile policies after the Supabase Auth cutover.
-- This is safe to apply in environments where 20260323_001 has already run.

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

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

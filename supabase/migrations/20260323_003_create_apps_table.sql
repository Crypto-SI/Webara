create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text,
  description text,
  status text not null default 'active' check (status in ('active', 'planning', 'archived')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apps_status_idx on public.apps(status);
create index if not exists apps_sort_order_idx on public.apps(sort_order);

drop trigger if exists apps_updated_at on public.apps;
create trigger apps_updated_at
before update on public.apps
for each row execute function update_updated_at_column();

alter table public.apps enable row level security;

drop policy if exists "Admins and staff can read apps" on public.apps;
drop policy if exists "Admins and staff can manage apps" on public.apps;

create policy "Admins and staff can read apps" on public.apps
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()::text
        and p.role in ('admin', 'webara_staff')
    )
  );

create policy "Admins and staff can manage apps" on public.apps
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

insert into public.apps (name, slug, sort_order)
values
  ('Forge', 'forge', 10),
  ('Verity peptide group', 'verity-peptide-group', 20),
  ('Hollingsworth Associates', 'hollingsworth-associates', 30),
  ('Afroball Connect', 'afroball-connect', 40),
  ('Prime Torque', 'prime-torque', 50),
  ('Gold Coast Grange', 'gold-coast-grange', 60),
  ('CaseLens', 'caselens', 70),
  ('Vibe dossier', 'vibe-dossier', 80),
  ('Crypto Waffle', 'crypto-waffle', 90),
  ('4 Rivers Studio', '4-rivers-studio', 100)
on conflict (slug) do nothing;

-- Weekly Marketing Tracker schema & RLS
-- Creates:
--  - public.is_admin()
--  - public.weekly_marketing_checklist_items
--  - public.weekly_marketing_summaries
--  - RLS policies limiting access to admins

------------------------------------------------------------
-- 1) Helper: is_admin()
------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select
    coalesce(
      exists (
        select 1
        from public.profiles p
        where p.clerk_user_id = auth.uid()
          and p.role in ('admin', 'webara_staff')
      ),
      false
    )
    or
    coalesce(
      (
        current_setting('request.jwt.claims', true) is not null
        and current_setting('request.jwt.claims', true) != ''
        and (
          (current_setting('request.jwt.claims', true)::jsonb ? 'role')
          and (
            (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
              in ('admin', 'webara_staff')
          )
        )
      ),
      false
    );
$$;

comment on function public.is_admin() is
  'Returns true if the current auth user is an admin based on profiles.role or JWT role claim.';

------------------------------------------------------------
-- 2) weekly_marketing_checklist_items
------------------------------------------------------------

create table if not exists public.weekly_marketing_checklist_items (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  task_key text not null,
  task_label text not null,
  platform text not null,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by text,
  constraint weekly_marketing_checklist_items_unique_task
    unique (week_start_date, task_key)
);

alter table public.weekly_marketing_checklist_items
  owner to postgres;

alter table public.weekly_marketing_checklist_items
  enable row level security;

comment on table public.weekly_marketing_checklist_items is
  'Per-task, per-week marketing execution checklist state. Only admins may read/write.';

-- RLS: Only admins can SELECT
create policy "Admins can read weekly checklist items"
on public.weekly_marketing_checklist_items
for select
to authenticated
using (public.is_admin());

-- RLS: Only admins can INSERT
create policy "Admins can insert weekly checklist items"
on public.weekly_marketing_checklist_items
for insert
to authenticated
with check (public.is_admin());

-- RLS: Only admins can UPDATE
create policy "Admins can update weekly checklist items"
on public.weekly_marketing_checklist_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- No DELETE policy -> by default deletes are blocked under RLS unless explicitly allowed.

------------------------------------------------------------
-- 3) weekly_marketing_summaries
------------------------------------------------------------

create table if not exists public.weekly_marketing_summaries (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  total_tasks integer not null,
  completed_tasks integer not null,
  completion_rate numeric(5,2) not null,
  breakdown_json jsonb not null,
  committed_at timestamptz not null default now(),
  committed_by text,
  is_committed boolean not null default true,
  constraint weekly_marketing_summaries_unique_week
    unique (week_start_date)
);

alter table public.weekly_marketing_summaries
  owner to postgres;

alter table public.weekly_marketing_summaries
  enable row level security;

comment on table public.weekly_marketing_summaries is
  'Immutable weekly snapshots of marketing checklist completion. Only admins may read/insert.';

-- RLS: Only admins can SELECT summaries
create policy "Admins can read weekly summaries"
on public.weekly_marketing_summaries
for select
to authenticated
using (public.is_admin());

-- RLS: Only admins can INSERT summaries
create policy "Admins can insert weekly summaries"
on public.weekly_marketing_summaries
for insert
to authenticated
with check (public.is_admin());

-- No UPDATE/DELETE policies -> summaries are immutable by default.

------------------------------------------------------------
-- 4) Notes (for app/server implementation)
------------------------------------------------------------

-- Commit-time enforcement is intentionally handled in the application layer:
--  - Validate the caller is admin (mirroring public.is_admin()).
--  - Compute current time in Europe/London and only allow commit at/after Sunday 21:00.
--  - Aggregate from weekly_marketing_checklist_items for the target week.
--  - Insert a row into weekly_marketing_summaries.
--  - Treat existence of a summary row for a week as "locked" in the UI and APIs.
--
-- API routes /admin/weekly-tracker/* should:
--  - Deny updates to weekly_marketing_checklist_items for weeks that already have a committed summary.
--  - Expose summaries for reporting inside the admin dashboard only.
-- Notifications
--
-- In-app notifications addressed to a single user. Clients never insert: a
-- trigger writes the row whenever a field we care about changes.
--
-- Run in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "mark own notifications read" on public.notifications;
create policy "mark own notifications read"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- No insert policy: only the SECURITY DEFINER trigger below writes rows, and it
-- bypasses RLS as the table owner. The column grant means a client can flip
-- `read` but can't rewrite a message or hand a notification to someone else.
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

-- ---------------------------------------------------------------------------
-- The generic trigger
-- ---------------------------------------------------------------------------

-- Written once, reused for every event. Arguments, supplied per trigger:
--   tg_argv[0]  column on the changed row holding the recipient's user id
--   tg_argv[1]  message to show
--   tg_argv[2]  link to open (optional)
--
-- Which field change fires it is decided entirely by the trigger's WHEN clause,
-- so adding an event never means touching this function.
create or replace function public.notify_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  execute format('select ($1).%I', tg_argv[0]) into recipient using new;

  -- A null recipient means the row points at a deleted user.
  if recipient is null then
    return new;
  end if;

  -- Don't tell people about their own actions -- an organizer closing their
  -- own project shouldn't get "your project was closed". auth.uid() is null
  -- when running from the SQL editor, so manual testing still produces rows.
  if recipient = auth.uid() then
    return new;
  end if;

  -- opportunities.created_by has no foreign key, so it can hold a uuid with no
  -- matching profile (seed data, a since-deleted user). Inserting anyway would
  -- raise a foreign key violation on notifications.user_id and roll back the
  -- update that triggered us -- an admin's approve click would simply fail.
  -- Dropping the notification is the lesser evil.
  if not exists (select 1 from public.profiles where id = recipient) then
    return new;
  end if;

  insert into public.notifications (user_id, message, link)
  values (recipient, tg_argv[1], tg_argv[2]);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

-- A volunteer is added to a project.
drop trigger if exists signup_onboarded_notify on public.signups;
create trigger signup_onboarded_notify
  after update of status on public.signups
  for each row
  when (old.status is distinct from new.status and new.status = 'onboarded')
  execute function public.notify_user(
    'volunteer_id',
    'You were added to a project as a contributor.',
    '/dashboard'
  );

-- A volunteer's interest is turned down.
drop trigger if exists signup_declined_notify on public.signups;
create trigger signup_declined_notify
  after update of status on public.signups
  for each row
  when (old.status is distinct from new.status and new.status = 'declined')
  execute function public.notify_user(
    'volunteer_id',
    'An organizer is not moving forward with your interest in a project.',
    '/dashboard'
  );

-- An organizer's project is approved by an admin.
drop trigger if exists opportunity_approved_notify on public.opportunities;
create trigger opportunity_approved_notify
  after update of status on public.opportunities
  for each row
  when (old.status is distinct from new.status and new.status = 'approved')
  execute function public.notify_user(
    'created_by',
    'Your project was approved and is now live in the gallery.',
    '/dashboard'
  );

-- An organizer's project is rejected by an admin.
drop trigger if exists opportunity_rejected_notify on public.opportunities;
create trigger opportunity_rejected_notify
  after update of status on public.opportunities
  for each row
  when (old.status is distinct from new.status and new.status = 'rejected')
  execute function public.notify_user(
    'created_by',
    'Your project was not approved. Contact an admin if you would like feedback.',
    '/dashboard'
  );

-- A project is closed and stops accepting interest.
drop trigger if exists opportunity_closed_notify on public.opportunities;
create trigger opportunity_closed_notify
  after update of status on public.opportunities
  for each row
  when (old.status is distinct from new.status and new.status = 'closed')
  execute function public.notify_user(
    'created_by',
    'Your project was closed and is no longer accepting interest.',
    '/dashboard'
  );

-- ---------------------------------------------------------------------------
-- Adding an event later
-- ---------------------------------------------------------------------------
--
-- Copy a block above. Point it at the table and column that changed, name the
-- column holding the recipient, and write the message. Nothing else changes --
-- no new function, no schema.ts edit, no UI change. For example:
--
--   drop trigger if exists role_approved_notify on public.profiles;
--   create trigger role_approved_notify
--     after update of role_approved on public.profiles
--     for each row
--     when (not old.role_approved and new.role_approved)
--     execute function public.notify_user(
--       'id',
--       'Your role request was approved.',
--       '/settings/profile'
--     );
--
-- Note the WHEN clause is a plain boolean over old/new -- it does not have to
-- be a status enum. Any column change you can express there can fire a
-- notification.
--
-- Messages are fixed strings, because a generic function can't know that
-- signups.opportunity_id points at opportunities.title. If a message needs the
-- project name in it, that event gets its own trigger function that does the
-- lookup -- the two styles coexist on the same table.

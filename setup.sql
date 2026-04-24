-- PostgreSQL tutorial: https://supabase.com/docs/guides/database/tables#resources

-- Create a table for public profiles
CREATE TABLE if not exists public.profiles (
    -- id column that is uuid and primary key, refers to auth.users.id as foreign key
    id uuid primary key REFERENCES auth.users(id) ON delete cascade,

    -- include username (text, unique) and avatar_url (text) for github data
    username text unique,
    avatar_url text
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table public.profiles enable row level security;

-- add SELECT and UPDATE policies so users can only see their profile (e.g., using (auth.uid() = id))
drop policy if exists "view only own profile" on public.profiles;
create policy "view only own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "update only own profile" on public.profiles;
create policy "update only own profile"
on public.profiles
for update
using (auth.uid() = id);

-- added policy to allow creating new user
drop policy if exists "insert only own profile" on public.profiles;
create policy "insert only own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create or replace function public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- automatically inserts a new row into the public.profiles table
  INSERT INTO public.profiles (id, username, avatar_url)
  values (
    -- includes id from auth.users and username and avatar_url from new.raw_user_meta_data
    NEW.id,
    NEW.raw_user_meta_data ->> 'user_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  return NEW;
end;
$$;

-- postgres function triggers after insert on the auth.users table
drop trigger if exists on_auth_user_created on auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
